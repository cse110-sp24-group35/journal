import { statuses } from '../database/stores/kanban.js';
import { tasks } from '../database/stores/task.js';

// Listen for changes to the statuses and tasks
statuses.listen(() => renderKanbanBoard());
tasks.listen(() => renderKanbanBoard());

// Define the Kanban board and its elements
document.addEventListener("DOMContentLoaded", () => {
    defineCustomElements();
    renderKanbanBoard();
});

function defineCustomElements() {
    customElements.define('kanban-column', KanbanColumn);
    customElements.define('task-card', KanbanCard);
    customElements.define('add-kanban-column', AddKanbanColumn);
    customElements.define('task-card-popup', KanbanCardPopup);
}

function renderKanbanBoard() {
    const main = document.querySelector('main');
    main.innerHTML = ''; // Clear the board before re-rendering

    // Render kanban columns
    statuses.get().forEach(status => {
        const column = new KanbanColumn(status);
        main.appendChild(column);
    });

    // Add the "Add Column" button
    main.appendChild(new AddKanbanColumn());
}

// KanbanColumn class
class KanbanColumn extends HTMLElement {
    constructor(status) {
        super();
        this.status = status;
        this.columnId = status.id; // Unique ID for the column element

        this.innerHTML = `
            <section class="kanban-column" data-column-id="${this.columnId}">
                <div class="kanban-column-header">
                    <h2 class="column-title" name="kanban-column-title">${status.name}</h2>
                </div>
                <button class="kanban-column-delete-button">X</button>
                <div class="content">
                    <div class="kanban-card-container"></div>
                </div>
                <div class="addBtn">
                    <button class="add-kanban-card-button">
                        <img src="public/images/paw.png" alt="Cat Paw" width="30" height="30"> <span>Add a task</span>
                    </button>
                </div>
            </section>
        `;

        this.addEventListeners();
        this.renderCards();
    }

    addEventListeners() {
        const deleteButton = this.querySelector('.kanban-column-delete-button');
        deleteButton.addEventListener('click', () => this.deleteColumn());
        const box = document.getElementById("container");

        const addCardButton = this.querySelector('.add-kanban-card-button');
        addCardButton.addEventListener('click', () => {
            document.body.appendChild(new KanbanCardPopup(this.status));
            box.style.display = "none";
        });

        const columnNameInput = this.querySelector('[name="kanban-column-title"]');
        columnNameInput.addEventListener('input', (event) => {
            this.updateStatus(event.target.value);
        });

        const cardContainer = this.querySelector('.kanban-card-container');
        cardContainer.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        });

        cardContainer.addEventListener('drop', (event) => {
            event.preventDefault();
            const taskId = event.dataTransfer.getData('application/card-id');
            this.moveCardToColumn(taskId, this.columnId);
        });
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
        const cardContainer = this.querySelector('.kanban-card-container');
        cardContainer.innerHTML = '';

        tasks.get().filter(task => task.status === this.columnId).forEach(task => {
            const card = new KanbanCard(task);
            cardContainer.appendChild(card);
        });
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

// AddKanbanColumn class
class AddKanbanColumn extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <button class="add-kanban-column-button" role="button">
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

// KanbanCardPopup class
class KanbanCardPopup extends HTMLElement {
    constructor(status, task = {}) {
        super();
        this.status = status;
        this.task = task;

        this.innerHTML = `
            <dialog class="task-card-popup">
                <div class="kanban-card-popup-header">
                    <button class="kanban-card-popup-close-button">X</button>
                </div>
                <div class="kanban-card-popup-body">
                    <label for="taskName">Task Name<br> 
                        <input class="inputs" name="taskName" value="${task.title || ''}" required/><br>
                    </label>
                    <label for="dueDate">Due Date<br>
                        <input class="inputs" name="dueDate" value="${task.date || ''}" required/><br>
                    </label>
                    <label for="taskDesc">Task Description<br>
                        <input class="inputs" name="taskDesc" value="${task.description || ''}" required/><br>
                    </label>
                    <label for="journal">Link to Journal<br>
                        <input class="inputs" name="journal" value="${task.journal || ''}" required/><br>
                    </label>
                    <label for="tags">Tags<br>
                        <input class="inputs" name="tags" value="${task.tags || ''}" required/><br>
                    </label>
                </div>
                <div class="kanban-card-popup-footer">
                    <button class="kanban-card-popup-save-button">Add Task</button>
                </div>
            </dialog>
        `;

        this.querySelector('dialog').show();
        this.addEventListeners();
    }

    addEventListeners() {
        const box = document.getElementById("container");
        this.querySelector('.kanban-card-popup-close-button').addEventListener('click', () => {
            this.closePopup();
            box.style.display = "flex";
        });
        this.querySelector('.kanban-card-popup-save-button').addEventListener('click', () => {
            this.saveCard();
            box.style.display = "flex";
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

// KanbanCard class
class KanbanCard extends HTMLElement {
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
                        <img class="pencil" src="public/images/pencil.png" alt="remove" width="30" height="30">
                    </button>
                </div>
            </div>
        `;
        this.addEventListeners();
    }

    addEventListeners() {
        const box = document.getElementById("container");
        this.querySelector('.card-delete-button').addEventListener('click', () => this.deleteCard());
        this.querySelector('.edit').addEventListener('click', () => {
            this.editCard();
            box.style.display = "none";
        });

        this.addEventListener('dragstart', (event) => this.dragStartHandler(event));
        this.addEventListener('dragover', (event) => this.dragOverHandler(event));
        this.addEventListener('drop', (event) => this.dropHandler(event));
    }

    deleteCard() {
        const newTasks = tasks.get().filter(task => task.id !== this.task.id);
        tasks.set(newTasks);
    }

    editCard() {
        document.body.appendChild(new KanbanCardPopup(statuses.get().find(status => status.id === this.task.status), this.task));
    }

    dragStartHandler(event) {
        event.dataTransfer.setData('application/card-id', this.task.id);
        event.dataTransfer.setData('application/column-id', this.task.status);
        event.dataTransfer.dropEffect = 'move';
    }

    dragOverHandler(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    dropHandler(event) {
        event.preventDefault();
        const cardId = event.dataTransfer.getData('application/card-id');

        const draggedTask = tasks.get().find(task => task.id === cardId);
        draggedTask.status = this.task.status;

        tasks.set([...tasks.get().filter(task => task.id !== cardId), draggedTask]);
    }
}