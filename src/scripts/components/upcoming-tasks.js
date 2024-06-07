import * as taskStore from './task.js';

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.upcoming-tasks-container');
    const popup = document.querySelector('.task-popup');

    container.innerHTML = ''; // Clear previous content

    // Get and sort tasks by due date
    const sortedTasks = tasks.get().sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 1); // Start from tomorrow
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7); // Set end date to 7 days from today

    const tasksByDate = {};

    // Group tasks by date within the next 7 days
    for (const task of sortedTasks) {
        const taskDueDate = new Date(task.dueAt);
        if (taskDueDate >= startDate && taskDueDate <= endDate) {
            const taskDateStr = taskDueDate.toDateString();
            if (!tasksByDate[taskDateStr]) {
                tasksByDate[taskDateStr] = [];
            }
            tasksByDate[taskDateStr].push(task);
        }
    }

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    for (let i = 1; i <= 7; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        const taskDateStr = currentDate.toDateString();
        const dayOfWeek = daysOfWeek[currentDate.getDay()];
        const dateDisplay = `${currentDate.getMonth() + 1}／${currentDate.getDate()} （${dayOfWeek}）`;

        const tasksForDate = tasksByDate[taskDateStr] || [];
        const taskCount = tasksForDate.length;
        const summary = taskCount === 0 ? 'No Upcoming Tasks' : `${taskCount} Upcoming Task${taskCount > 1 ? 's' : ''} 〔hover to see〕`;

        const dateItem = document.createElement('div');
        dateItem.classList.add('upcoming-task-date');
        dateItem.textContent = `${dateDisplay}： ${summary}`;
        
        this.checkbox = this.shadowRoot.querySelector('input');
        this.taskText = this.shadowRoot.querySelector('span');
        this.taskContainer = this.shadowRoot.querySelector('.task');
        
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
            task.status = task.status === "COMPLETED" ? "ONGOING" : "COMPLETED";
            taskStore.updateTask(taskId, {
                status: task.status
            });

            this.updateTaskClass(task.status === "COMPLETED");
        }
    }

    updateTaskClass(completed) {
        if (completed) {
            this.taskContainer.classList.add('completed');
        } else {
            this.taskContainer.classList.remove('completed');
        }
    }
}

class UpcomingTaskList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.update(taskStore.tasks);
    }

    connectedCallback() {
        taskStore.tasks.listen((val) => {
            this.update(val);
        });
    }

    update(val) {
        this.shadowRoot.innerHTML = '';
        val.get().forEach(task => {
            const taskElement = document.createElement('upcoming-task-component');
            taskElement.setAttribute('data-id', task.id);
            this.shadowRoot.appendChild(taskElement);
        });
    }
}

customElements.define('upcoming-task-component', UpcomingTaskComponent);
customElements.define('upcoming-task-list', UpcomingTaskList);
