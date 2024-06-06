import { statuses } from '../database/stores/kanban.js';
import { tasks } from '../database/stores/task.js';

// Listen for changes to the statuses and tasks
statuses.listen(() => renderTaskPage());
tasks.listen(() => renderTaskPage());

// Define the Task board and its elements
document.addEventListener("DOMContentLoaded", () => {
    defineCustomElements();
    renderTaskPage();
});

function defineCustomElements() {
    customElements.define('task-column', TaskColumn);
    customElements.define('task-card', TaskCard);
    customElements.define('add-task-column', AddTaskColumn);
    customElements.define('task-card-popup', TaskCardPopup);
}

function renderTaskPage() {
    const main = document.querySelector('main');
    main.innerHTML = ''; // Clear the board before re-rendering

    // Render task columns
    statuses.get().forEach(status => {
        const column = new TaskColumn(status);
        main.appendChild(column);
    });

    // Add the "Add Column" button
    main.appendChild(new AddTaskColumn());
}

// TaskColumn class
class TaskColumn extends HTMLElement {
    constructor(status) {
        super();
        this.status = status;
        this.columnId = status.id;

        this.innerHTML = `
            <section class="task-column" data-column-id="${this.columnId}">
                <div class="task-column-header">
                    <h2 class="column-title" name="task-column-title">${status.name}</h2>
                </div>
                <button class="task-column-delete-button">X</button>
                <div class="content">
                    <div class="task-card-container"></div>
                </div>
                <div class="addBtn">
                    <button class="add-task-card-button">
                        <img src="public/images/paw.png" alt="Cat Paw" width="30" height="30"> <span>Add a task</span>
                    </button>
                </div>
            </section>
        `;

        this.addEventListeners();
        this.renderCards();
    }

    addEventListeners() {
        const deleteButton = this.querySelector('.task-column-delete-button');
        deleteButton.addEventListener('click', () => this.deleteColumn());
        const box = document.getElementById("container");
        const header = document.getElementById("header");
        const addCardButton = this.querySelector('.add-task-card-button');
        addCardButton.addEventListener('click', () => {
            document.body.appendChild(new TaskCardPopup(this.status));
            box.style.display = "none";
            header.innerHTML = "Add a Task";
        });

        const columnNameInput = this.querySelector('[name="task-column-title"]');
        columnNameInput.addEventListener('input', (event) => {
            this.updateStatus(event.target.value);
        });

        const cardContainer = this.querySelector('.task-card-container');
        cardContainer.addEventListener('dragover', (event) => this.dragOverHandler(event));
        cardContainer.addEventListener('drop', (event) => this.dropHandler(event));

        this.updatePlaceholder();
    }

    dragOverHandler(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    dropHandler(event) {
        event.preventDefault();
        const taskId = event.dataTransfer.getData('application/card-id');
        this.moveCardToColumn(taskId, this.columnId);
    }

    moveCardToColumn(taskId, newColumnId) {
        const updatedTasks = tasks.get().map((task) => {
            if (task.id === taskId) {
                return { ...task, status: newColumnId };
            }
            return task;
        });
        tasks.set(updatedTasks);
    }

    renderCards() {
        const cardContainer = this.querySelector('.task-card-container');
        cardContainer.innerHTML = '';

        tasks.get().filter(task => task.status === this.columnId).forEach(task => {
            const card = new TaskCard(task);
            cardContainer.appendChild(card);
        });

        this.updatePlaceholder();
    }

    updatePlaceholder() {
        const cardContainer = this.querySelector('.task-card-container');
        if (cardContainer.children.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'task-card-placeholder';
            placeholder.innerText = 'Drop here';
            cardContainer.appendChild(placeholder);
        } else {
            const placeholder = cardContainer.querySelector('.task-card-placeholder');
            if (placeholder) placeholder.remove();
        }
    }

    deleteColumn() {
        // Remove this specific column element from the DOM
        this.remove();

        // Update statuses by filtering out the status of this column only once
        let currentStatuses = statuses.get();
        currentStatuses = currentStatuses.filter(status => status.id !== this.columnId);
        statuses.set(currentStatuses);

        // Remove tasks associated with this column
        const updatedTasks = tasks.get().filter(task => task.status !== this.columnId);
        tasks.set(updatedTasks);
    }

    updateStatus(newName) {
        const currentStatuses = statuses.get();
        const newStatuses = currentStatuses.map(s => {
            if (s.id === this.columnId) {
                return { ...s, name: newName };
            }
            return s;
        });
        statuses.set(newStatuses);
    }
}

// AddTaskColumn class
class AddTaskColumn extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <button class="add-task-column-button" role="button">
                <img src="public/images/paw.png" alt="Cat Paw" width="30" height="30"><span>Add Column</span>
            </button>
        `;

        this.addEventListener('click', () => {
            const newStatusName = prompt("Enter new column name:");
            if (newStatusName) {
                const newStatus = {
                    id: `status-${Date.now()}`,
                    name: newStatusName
                };
                const currentStatuses = statuses.get();
                statuses.set([...currentStatuses, newStatus]);
            }
        });
    }
}

// TaskCardPopup class
class TaskCardPopup extends HTMLElement {
    constructor(status, task = {}) {
        super();
        this.status = status;
        this.task = task;

        const isEditing = !!task.id; // Determine if we are editing an existing task

        this.innerHTML = `
            <dialog class="task-card-popup">
                <div class="task-card-popup-header">
                    <button class="task-card-popup-close-button">X</button>
                </div>
                <form class="task-card-popup-body">
                    <label for="taskName">Task Name<br> 
                        <input type="text" class="inputs" name="taskName" value="${task.title || ''}" required/><br>
                    </label>
                    <label for="dueDate">Due Date<br>
                        <input type="date" class="inputs" name="dueDate" value="${task.date || ''}" required/><br>
                    </label>
                    <label for="taskDesc">Task Description<br>
                        <input type="text" class="inputs" name="taskDesc" value="${task.description || ''}" required/><br>
                    </label>
                    <label for="journal">Link to Journal<br>
                        <input type="text" class="inputs" name="journal" value="${task.journal || ''}" /><br>
                    </label>
                    <label for="tags">Tags<br>
                        <input type="text" class="inputs" name="tags" value="${task.tags || ''}" required/><br>
                    </label>
                    <div class="task-card-popup-footer">
                        <button type="submit" class="task-card-popup-save-button" id="saveButton">${isEditing ? 'Edit Task' : 'Add Task'}</button>
                    </div>
                </form>
            </dialog>
        `;

        this.querySelector('dialog').show();
        this.addEventListeners();
    }

    addEventListeners() {
        const box = document.getElementById("container");
        const header = document.getElementById("header");
        this.querySelector('.task-card-popup-close-button').addEventListener('click', () => {
            this.closePopup();
            box.style.display = "flex";
            header.innerHTML = "Task Lists";   
        });
        this.querySelector('.task-card-popup-save-button').addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default form submission
            if (this.querySelector('form').checkValidity()) {
                this.saveCard();
                box.style.display = "flex";
                header.innerHTML = "Task Lists";
            } else {
                this.querySelector('form').reportValidity(); // Show validation errors
            }
        });
    }

    closePopup() {
        this.remove();
    }

    saveCard() {
        const title = this.querySelector('[name="taskName"]').value;
        const description = this.querySelector('[name="taskDesc"]').value;
        const date = this.querySelector('[name="dueDate"]').value;
        const tags = this.querySelector('[name="tags"]').value;
        const journal = this.querySelector('[name="journal"]').value;
    
        const newTask = {
            id: this.task.id || `task-${Date.now()}`,
            title,
            description,
            date,
            tags,
            journal,
            status: this.status.id, // Use the current status ID
            createdAt: this.task.createdAt || Date.now(),
            dueAt: this.task.dueAt || Date.now() + 7 * 24 * 60 * 60 * 1000 // Example due date: one week later
        };
    
        if (this.task.id) {
            // If task already exists, update it
            tasks.set(tasks.get().map(task => task.id === this.task.id ? newTask : task));
        } else {
            // If it's a new task, add it to the tasks array
            tasks.set([...tasks.get(), newTask]);
        }
    
        this.closePopup();
    }
}
// TaskCard class
class TaskCard extends HTMLElement {
    constructor(task) {
        super();
        this.task = task;
        this.innerHTML = `
            <div class="task-card" draggable="true" id="${task.id}">
                <div class="card-content">
                    <p class="card-title">${task.title}</p>
                    <p class="card-description">${task.description}</p>
                    <p class="dueDate">${task.date}</p>
                    <img class="orangeBlob" src="public/images/orangeBlob.png" alt="Orange Blob" width="65" height="40">
                    <img class="grayBlob" src="public/images/grayBlob.png" alt="Gray Blob" width="50" height="45">
                    <button class="card-delete-button">X</button>
                    <button class="edit">
                        <img class="pencil" src="public/images/pencil.png" alt="edit" width="30" height="30">
                    </button>
                </div>
            </div>
        `;
        this.addEventListeners();
    }

    addEventListeners() {
        const box = document.getElementById("container");
        const header = document.getElementById("header");
        this.querySelector('.card-delete-button').addEventListener('click', () => this.deleteCard());
        this.querySelector('.edit').addEventListener('click', () => {
            this.editCard();
            box.style.display = "none";
            header.innerHTML = "Edit Task";
        });

        this.addEventListener('dragstart', (event) => this.dragStartHandler(event));
    }

    deleteCard() {
        const newTasks = tasks.get().filter(task => task.id !== this.task.id);
        tasks.set(newTasks);
    }

    editCard() {
        document.body.appendChild(new TaskCardPopup(statuses.get().find(status => status.id === this.task.status), this.task));
    }

    dragStartHandler(event) {
        event.dataTransfer.setData('application/card-id', this.task.id);
        event.dataTransfer.setData('application/column-id', this.task.status);
        event.dataTransfer.dropEffect = 'move';
    }
}
