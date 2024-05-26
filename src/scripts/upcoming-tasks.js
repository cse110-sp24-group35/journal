class UpcomingTaskComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .task {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    margin: 20px 0;
                }
                .task:first-of-type {
                    margin-top: 0;
                }
            </style>
            <div class="task">
                <span class="day"></span>
                <span class="number"></span>
            </div>
        `;
        
        this.dayText = this.shadowRoot.querySelector('.day');
        this.numberText = this.shadowRoot.querySelector('.number');
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
            this.dayText.textContent = this.getDayName(taskData.day);
            this.numberText.textContent = taskData.number === 0 ? 'No Upcoming Tasks' : `${taskData.number} Upcoming Tasks`;
        }
    }
    
    getTaskFromLocalStorage(taskId) {
        const tasks = JSON.parse(localStorage.getItem('upcoming-tasks')) || [];
        return tasks.find(task => task.id === taskId);
    }
    
    getDayName(day) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[day] || '';
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
        const tasks = JSON.parse(localStorage.getItem('upcoming-tasks')) || [];    
        tasks.forEach(task => {
            const taskElement = document.createElement('task-component');
            taskElement.setAttribute('data-id', task.id);
            this.shadowRoot.appendChild(taskElement);
        });
    }
}
customElements.define('task-component', UpcomingTaskComponent);
customElements.define('task-list', TaskList);

// change this later but for manual testing
localStorage.setItem('upcoming-tasks', JSON.stringify([
    { id: '1', day: '0', number: 0 },
    { id: '2', day: '1', number: 2 },
    { id: '3', day: '2', number: 1 },
    { id: '4', day: '3', number: 2 },
    { id: '5', day: '4', number: 0 },
    { id: '6', day: '5', number: 2 },
    { id: '7', day: '6', number: 2 },
]));
