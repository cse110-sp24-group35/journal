import { statuses } from '../../database/stores/kanban.js';
import { tasks } from '../../database/stores/task.js';

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
    customElements.define('modal-card-popup', ModalCardPopup);
    customElements.define('modal-card-popup-column', ModalCardPopupColumn);
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
        this.status = this.columnId = status;

        this.innerHTML = `
            <section class="task-column" data-column-id="${this.status}">
                <div class="task-column-header">
                    <h2 class="column-title" name="task-column-title">${this.status}</h2>
                </div>
                <button class="task-column-delete-button">X</button>
                <div class="content">
                    <div class="task-card-container"></div>
                </div>
                <div class="add-button">
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
            document.body.appendChild(new ModalCardPopup(this.status));
            box.style.display = "none";
            header.innerHTML = "Add a Task";
        });

        const columnNameInput = this.querySelector('[name="task-column-title"]');
        columnNameInput.addEventListener('input', (event) => {
            this.updateStatus(event.target.value);
        });

        const columnSection = this.querySelector('.task-column');
        columnSection.addEventListener('dragover', (event) => this.dragOverHandler(event));
        columnSection.addEventListener('drop', (event) => this.dropHandler(event));

        this.updatePlaceholder();
    }

    dragOverHandler(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    dropHandler(event) {
        event.preventDefault();
        const taskId = event.dataTransfer.getData('application/card-id');
        if (taskId) {
            this.moveCardToColumn(taskId, this.columnId);
        }
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
        currentStatuses = currentStatuses.filter(status => status !== this.columnId);
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
    }

    connectedCallback() {
        const box = document.getElementById("container");
        const header = document.getElementById("header");
        const addCardButton = this.querySelector('.add-task-column-button');
        addCardButton.addEventListener('click', () => {
            document.body.appendChild(new ModalCardPopupColumn());
            box.style.display = "none";
            header.innerHTML = "Add a Column";
        });
    }
}

class ModalCardPopupColumn extends HTMLElement {
    constructor() {
        super();

        this.innerHTML = `
            <dialog class="modal-card-popup">
                <div class="modal-card-popup-header">
                    <button class="modal-card-popup-close-button">X</button>
                </div>
                <form class="modal-card-popup-body">
                    <label for="columnName">Column Name<br>
                        <input type="text" class="inputs" name="columnName" required/><br>
                    </label>
                    <div class="modal-card-popup-footer">
                        <button type="submit" class="modal-card-popup-save-button">Add Column</button>
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
        this.querySelector('.modal-card-popup-close-button').addEventListener('click', () => {
            this.closePopup();
            box.style.display = "flex";
            header.innerHTML = "Task Lists";
        });

        this.querySelector('.modal-card-popup-save-button').addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default form submission

            if (this.querySelector('form').checkValidity()) {
                const columnName = this.querySelector('[name="columnName"]').value;

                if (statuses.get().includes(columnName)) {
                    alert("There is already a column with same name! Please pick a different name :)");
                } else {
                    this.saveColumnName();
                    box.style.display = "flex";
                    header.innerHTML = "Task Lists";
                }
            } else {
                this.querySelector('form').reportValidity(); // Show validation errors
            }
        });
    }

    closePopup() {
        this.remove();
    }

    saveColumnName() {
        const columnName = this.querySelector('[name="columnName"]').value;

        if (columnName) {
            const currentStatuses = statuses.get();
            statuses.set([...currentStatuses, columnName]);
        }

        this.closePopup();
    }
}

// ModalCardPopup class
class ModalCardPopup extends HTMLElement {
    constructor(status, task = {}) {
        super();
        this.status = status;
        this.task = task;

        const isEditing = !!task.id; // Determine if we are editing an existing task

        this.innerHTML = `
            <dialog class="modal-card-popup">
                ${isEditing ? '<img id="orange-cat" src="public/images/orange-cat.png" alt="cat sitting" width="140" height="110">' : '<img id="cat" src="public/images/cat.png" alt="cat sitting" width="140" height="110">'}
                <div class="modal-card-popup-header">
                    <button class="modal-card-popup-close-button">X</button>
                </div>
                <form class="modal-card-popup-body">
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
                    <div class="modal-card-popup-footer">
                        <button type="submit" class="modal-card-popup-save-button" id="saveButton">${isEditing ? 'Edit Task' : 'Add Task'}</button>
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

        this.querySelector('.modal-card-popup-close-button').addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default form submission
            box.style.display = "flex";
            header.innerHTML = "Task Lists";

            this.closePopup();
        });

        this.querySelector('.modal-card-popup-save-button').addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default form submission

            if (this.querySelector('form').checkValidity()) {
                this.saveCard();
                box.style.display = "flex";
                header.innerHTML = "Task Lists";
                this.closePopup();
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
        const date = this.querySelector('[name="dueDate"]').value; // Ensure this is a valid date string
        const tags = this.querySelector('[name="tags"]').value;
        const journal = this.querySelector('[name="journal"]').value;

        // Convert date to local time midnight
        const dueDate = new Date(date + 'T00:00:00');

        const newTask = {
            id: this.task.id || `task-${Date.now()}`,
            title,
            description,
            date, // Keep the local date string for display
            tags,
            journal,
            status: this.status, // Use the current status ID
            createdAt: this.task.createdAt || Date.now(),
            dueAt: dueDate.getTime() // Convert the date to a timestamp in local time
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
        // Convert timestamp to locale date string
        const dueDate = new Date(task.dueAt).toLocaleDateString();
        this.innerHTML = `
            <div class="task-card" draggable="true" id="${task.id}">
                <div class="card-content">
                    <p class="card-title">${task.title}</p>
                    <p class="card-description">${task.description}</p>
                    <p class="due-date">Due ${dueDate}</p>
                    <img class="orange-blob" src="public/images/orange-blob.png" alt="Orange Blob" width="65" height="40">
                    <img class="gray-blob" src="public/images/gray-blob.png" alt="Gray Blob" width="50" height="45">
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
        document.body.appendChild(new ModalCardPopup(statuses.get().find(status => status === this.task.status), this.task));
    }

    dragStartHandler(event) {
        event.dataTransfer.setData('application/card-id', this.task.id);
        event.dataTransfer.setData('application/column-id', this.task.status);
        event.dataTransfer.dropEffect = 'move';
    }
}