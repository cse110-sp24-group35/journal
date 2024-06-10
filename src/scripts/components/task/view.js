import * as taskStore from '../../database/stores/task.js';
import { updateTask } from '../../database/stores/task.js';

class TaskView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });        
        this.shadowRoot.innerHTML = `
            <style>
                .task {
                    display: flex;
                    align-items: center;
                    margin: 20px 0;
                }
                .task:first-of-type {
                    margin-top: 0;
                }
                .task.completed span {
                    text-decoration: line-through;
                }
            </style>
            <div class="task">
                <input type="checkbox">
                <span></span>
            </div>
        `;
        
        this.checkbox = this.shadowRoot.querySelector('input');
        this.taskText = this.shadowRoot.querySelector('span');
        this.taskContainer = this.shadowRoot.querySelector('.task');
        // for status to change based on check boxes
        this.checkbox.addEventListener('change', () => this.updateTaskStatus());
    }
    
    connectedCallback() {
        this.updateTask();
    }
    
    static get observedAttributes() {
        return ['data-id'];
    }
    
    attributeChangedCallback() {
        this.updateTask();
    }

    updateTask() {
        const taskId = this.getAttribute('data-id');
        const task = taskStore.getTask(taskId);

        if (task) {
            this.taskText.textContent = task.description;
            this.checkbox.checked = task.status === "COMPLETED";
            this.updateTaskClass(this.checkbox.checked);
        }
    }

    updateTaskStatus() {
        const taskId = this.getAttribute('data-id');
        const task = taskStore.getTask(taskId);

        if (task) {
            task.status = task.status === "COMPLETED" ? "ONGOING" : "COMPLETED"; // If user unchecks a completed task, we fall back to ONGOING
            updateTask(taskId, {
                status: task.status
            });

            this.updateTaskClass(task.status === "COMPLETED");
        }
    }
    // to make sure boxes are checked based on local storage call backs are used
    updateTaskClass(completed) {
        if (completed) {
            this.taskContainer.classList.add('completed');
        } else {
            this.taskContainer.classList.remove('completed');
        }
    }
}

class TaskList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.update(taskStore.tasks);

        /*
        taskStore.tasks.listen((val) => {
           this.update(val);
        });
         */
    }

    update(val) {
        this.shadowRoot.innerHTML = '';
        val.get().forEach(task => {
            const taskElement = document.createElement('task-component');
            taskElement.setAttribute('data-id', task.id);
            this.shadowRoot.appendChild(taskElement);
        });
    }
}
customElements.define('task-component', TaskView);
customElements.define('task-list', TaskList);