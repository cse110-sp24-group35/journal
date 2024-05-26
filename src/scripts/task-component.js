class TaskComponent extends HTMLElement {
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
        const taskData = this.getTaskFromLocalStorage(taskId);    
        if (taskData) {
            this.taskText.textContent = taskData.text;
            this.checkbox.checked = taskData.completed;
            this.updateTaskClass(taskData.completed);
        }
    }
    
    getTaskFromLocalStorage(taskId) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        return tasks.find(task => task.id === taskId);
    }
    updateTaskStatus() {
        const taskId = this.getAttribute('data-id');
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const taskIndex = tasks.findIndex(task => task.id === taskId);   
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = this.checkbox.checked;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            this.updateTaskClass(this.checkbox.checked);
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
    }
    
    connectedCallback() {
        this.update();
        window.addEventListener('storage', () => {
            this.update();
            location.reload();
        });
    }
    
    update() {
        this.shadowRoot.innerHTML = '';
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];    
        tasks.forEach(task => {
            const taskElement = document.createElement('task-component');
            taskElement.setAttribute('data-id', task.id);
            this.shadowRoot.appendChild(taskElement);
        });
    }
}
customElements.define('task-component', TaskComponent);
customElements.define('task-list', TaskList);

// change this later but for manual testing
localStorage.setItem('tasks', JSON.stringify([
    { id: '1', text: 'Task 1 dsjbfnaskdnfkljsdafjasndvkl dsfnasd f asf sf ads df asdf  asdfasdf asdf ads', completed: true },
    { id: '2', text: 'Task 2', completed: true },
    { id: '3', text: 'Task 3', completed: false },
    { id: '4', text: 'Task 4', completed: true },
    { id: '6', text: 'Task 6', completed: true },
    { id: '7', text: 'Task 7', completed: true },
    { id: '8', text: 'Task 8', completed: true },
    { id: '9', text: 'Task 9', completed: true },
    { id: '10', text: 'Task 10', completed: true },
    { id: '11', text: 'Task 11', completed: true },
    { id: '12', text: 'Task 12', completed: true },
    { id: '13', text: 'Task 13', completed: true },

]));