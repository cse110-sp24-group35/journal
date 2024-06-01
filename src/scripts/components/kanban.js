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
    customElements.define('kanban-card', KanbanCard);
    customElements.define('add-kanban-column', AddKanbanColumn);
    customElements.define('kanban-card-popup', KanbanCardPopup);
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

        this.innerHTML = `
            <section class="kanban-column">
                <div class="kanban-column-header">
                    <h2><input name="kanban-column-title" value="${status}"></input></h2>
                    <button class="kanban-column-delete-button">x</button>
                </div>
                <div class="kanban-card-container"></div>
                <div>
                    <button class="add-kanban-card-button">+ Add Card</button>
                </div>
            </section>
        `;

        this.addEventListeners();
        this.renderCards();
    }

    addEventListeners() {
        const deleteButton = this.querySelector('.kanban-column-delete-button');
        deleteButton.addEventListener('click', () => this.deleteColumn());

        const addCardButton = this.querySelector('.add-kanban-card-button');
        addCardButton.addEventListener('click', () => {
            document.body.appendChild(new KanbanCardPopup(this.status));
        });

        const columnNameInput = this.querySelector('[name="kanban-column-title"]');
        columnNameInput.addEventListener('input', (event) => {
            this.status = event.target.value;
            this.updateStatus();
        });

        const cardContainer = this.querySelector('.kanban-card-container');
        cardContainer.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        });

        cardContainer.addEventListener('drop', (event) => {
            event.preventDefault();
            const taskId = event.dataTransfer.getData('application/card-id');
            this.moveCardToColumn(taskId, this.status);
        });
    }

    moveCardToColumn(taskId, newStatus) {
        const updatedTasks = tasks.get().map((task) => {
            if (task.id === taskId) {
                return { ...task, status: newStatus };
            }
            return task;
        });
        tasks.set(updatedTasks);
    }

    renderCards() {
        const cardContainer = this.querySelector('.kanban-card-container');
        cardContainer.innerHTML = '';

        tasks.get().filter(task => task.status === this.status).forEach(task => {
            const card = new KanbanCard(task);
            cardContainer.appendChild(card);
        });
    }

    deleteColumn() {
        const newStatuses = statuses.get().filter(s => s !== this.status);
        statuses.set(newStatuses);
    }

    updateStatus() {
        const currentStatuses = statuses.get();
        const newStatuses = currentStatuses.map(s => s === this.status ? this.status : s);
        statuses.set(newStatuses);
    }
}

// AddKanbanColumn class
class AddKanbanColumn extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <button class="add-kanban-column-button" role="button">
                <p>Add Column</p>
            </button>
        `;

        this.addEventListener('click', () => {
            const newStatus = prompt("Enter new column name:");
            if (newStatus) {
                const currentStatuses = statuses.get();
                statuses.set([...currentStatuses, newStatus]);
            }
        });
    }
}

// KanbanCardPopup class
class KanbanCardPopup extends HTMLElement {
    constructor(status) {
        super();
        this.status = status;
        this.innerHTML = `
            <dialog class="kanban-card-popup">
                <div class="kanban-card-popup-header">
                    <h2><input name="kanban-card-title" value="New Card"></input></h2>
                    <button class="kanban-card-popup-close-button">x</button>
                </div>
                <div class="kanban-card-popup-body">
                    <textarea name="kanban-card-description">New Card Description</textarea>
                    <div>
                        <label for="kanban-card-priority">Priority: </label>
                        <select name="kanban-card-priority">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>
                <div class="kanban-card-popup-footer">
                    <button class="kanban-card-popup-save-button">Save</button>
                </div>
            </dialog>
        `;

        this.querySelector('dialog').show();
        this.addEventListeners();
    }

    addEventListeners() {
        this.querySelector('.kanban-card-popup-close-button').addEventListener('click', () => this.closePopup());
        this.querySelector('.kanban-card-popup-save-button').addEventListener('click', () => this.saveCard());
    }

    closePopup() {
        this.remove();
    }

    saveCard() {
        const title = this.querySelector('[name="kanban-card-title"]').value;
        const description = this.querySelector('[name="kanban-card-description"]').value;
        const priority = this.querySelector('[name="kanban-card-priority"]').value;

        const newTask = {
            id: `task-${Date.now()}`,
            title,
            description,
            priority,
            status: this.status,
            createdAt: Date.now(),
            dueAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // Example due date: one week later
        };

        tasks.set([...tasks.get(), newTask]);
        this.closePopup();
    }
}

// KanbanCard class
class KanbanCard extends HTMLElement {
    constructor(task) {
        super();
        this.task = task;
        this.innerHTML = `
            <div class="kanban-card" draggable="true" id="${task.id}">
                <span class="priority-bar priority-${task.priority}"></span>
                <div class="card-content">
                    <div class="card-header">
                        <h3 class="card-title">${task.title}</h3>
                        <button class="card-delete-button">x</button>
                    </div>
                    <p class="card-description">${task.description}</p>
                </div>
            </div>
        `;

        this.addEventListeners();

    }

    addEventListeners() {
        this.querySelector('.card-delete-button').addEventListener('click', () => this.deleteCard());
        this.querySelector('.card-content').addEventListener('click', () => this.editCard());

        this.addEventListener('dragstart', (event) => this.dragStartHandler(event));
        this.addEventListener('dragover', (event) => this.dragOverHandler(event));
        this.addEventListener('drop', (event) => this.dropHandler(event));
    }

    deleteCard() {
        const newTasks = tasks.get().filter(task => task.id !== this.task.id);
        tasks.set(newTasks);
    }

    editCard() {
        document.body.appendChild(new KanbanCardPopup(this.task.status, this.task.title, this.task.description, this.task.priority, this.task.id));
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
