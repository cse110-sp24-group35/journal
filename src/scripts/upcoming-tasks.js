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
                    cursor: pointer;
                }
                .task:first-of-type {
                    margin-top: 0;
                }
                .popup-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 9;
                }
                .popup-overlay.visible {
                    display: block;
                }
                .popup {
                    display: none;
                    position: fixed;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    width: 80%;
                    max-width: 600px;
                    background-color: #F3E2D5;
                    border: 1px solid #ccc;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    z-index: 10;
                }
                .popup.visible {
                    display: block;
                }
                .popup h3 {
                    margin-top: 0;
                }
                .popup .task-list {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 20px 0;
                }
                .popup .task-list li {
                    margin: 10px 0;
                    padding: 10px;
                    background: #fff;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }
                .popup .close-btn {
                    display: block;
                    margin: 0 auto;
                    padding: 10px 20px;
                    background: #ccc;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                .popup .close-btn:hover {
                    background: #bbb;
                }
            </style>
            <div class="task">
                <span class="day"></span>
                <span class="number"></span>
            </div>
            <div class="popup-overlay"></div>
            <div class="popup">
                <h3>Upcoming Tasks</h3>
                <ul class="task-list"></ul>
                <button class="close-btn">Close</button>
            </div>
        `;
        
        this.dayText = this.shadowRoot.querySelector('.day');
        this.numberText = this.shadowRoot.querySelector('.number');
        this.taskContainer = this.shadowRoot.querySelector('.task');
        this.popup = this.shadowRoot.querySelector('.popup');
        this.popupOverlay = this.shadowRoot.querySelector('.popup-overlay');
        this.taskList = this.shadowRoot.querySelector('.task-list');
        this.closeBtn = this.shadowRoot.querySelector('.close-btn');

        this.taskContainer.addEventListener('click', () => this.showPopup());
        this.closeBtn.addEventListener('click', () => this.hidePopup());
        this.popupOverlay.addEventListener('click', () => this.hidePopup());
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
            this.dayText.textContent = this.getDayName(parseInt(taskData.day, 10));
            this.numberText.textContent = taskData.number === 0 ? 'No Upcoming Tasks' : `${taskData.number} Upcoming Tasks`;
            this.taskData = taskData;
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

    showPopup() {
        if (this.taskData && this.taskData.number > 0) {
            this.taskList.innerHTML = '';
            this.taskData.tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = task;
                this.taskList.appendChild(li);
            });
            this.popup.classList.add('visible');
            this.popupOverlay.classList.add('visible');
        }
    }

    hidePopup() {
        this.popup.classList.remove('visible');
        this.popupOverlay.classList.remove('visible');
    }
}

class UpcomingTaskList extends HTMLElement {
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
            const taskElement = document.createElement('upcoming-task-component');
            taskElement.setAttribute('data-id', task.id);
            this.shadowRoot.appendChild(taskElement);
        });
    }
}

customElements.define('upcoming-task-component', UpcomingTaskComponent);
customElements.define('upcoming-task-list', UpcomingTaskList);


// change this later but for manual testing
localStorage.setItem('upcoming-tasks', JSON.stringify([
    { id: '1', day: '0', number: 0, tasks: [] },
    { id: '2', day: '1', number: 2, tasks: ['cse110', 'ece45'] },
    { id: '3', day: '2', number: 1, tasks: ['cse110'] },
    { id: '4', day: '3', number: 2, tasks: ['cse110', 'ece45'] },
    { id: '5', day: '4', number: 0, tasks: [] },
    { id: '6', day: '5', number: 2, tasks: ['cse110', 'ece45'] },
    { id: '7', day: '6', number: 2, tasks: ['cse110', 'ece45'] },
]));
