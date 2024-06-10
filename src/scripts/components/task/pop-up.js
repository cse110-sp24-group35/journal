class TaskModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                /* Modal Styles */
                .modal {
                    display: none; 
                    position: fixed; 
                    z-index: 1; 
                    padding-top: 100px; 
                    left: 0;
                    top: 0;
                    width: 100%; 
                    height: 100%; 
                    overflow: auto; 
                    background-color: rgb(0,0,0); 
                    background-color: rgba(0,0,0,0.4); 
                }

                .modal-content {
                    background-color: #fefefe;
                    margin: auto;
                    padding: 20px;
                    border: 1px solid #888;
                    width: 80%;
                }

                .close {
                    color: #aaa;
                    float: right;
                    font-size: 28px;
                    font-weight: bold;
                }

                .close:hover,
                .close:focus {
                    color: black;
                    text-decoration: none;
                    cursor: pointer;
                }
            </style>
            <div id="taskModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Task Details</h2>
                    <p id="taskTitle"></p>
                    <p id="taskDescription"></p>
                    <p id="taskPriority"></p>
                    <p id="taskStatus"></p>
                    <p id="taskDueAt"></p>
                </div>
            </div>
        `;

        this.shadowRoot.getElementById('taskModal').addEventListener('click', (event) => {
            if (event.target === this.shadowRoot.getElementById('taskModal')) {
                this.closeModal();
            }
        });
    }

    connectedCallback() {
        this.shadowRoot.querySelector('.close').addEventListener('click', this.closeModal.bind(this));
        window.addEventListener('click', (event) => {
            if (event.target === this.shadowRoot.getElementById('taskModal')) {
                this.closeModal();
            }
        });
    }

    openModal(task) {
        this.shadowRoot.getElementById('taskTitle').textContent = `Task: ${task.title}`;
        this.shadowRoot.getElementById('taskDescription').textContent = `Description: ${task.description}`;
        this.shadowRoot.getElementById('taskPriority').textContent = `Priority: ${task.priority}`;
        this.shadowRoot.getElementById('taskStatus').textContent = `Status: ${task.status}`;
        this.shadowRoot.getElementById('taskDueAt').textContent = `Due At: ${new Date(task.dueAt)}`;
        this.shadowRoot.getElementById('taskModal').style.display = 'block';
    }

    closeModal() {
        this.shadowRoot.getElementById('taskModal').style.display = 'none';
    }
}

customElements.define('task-modal', TaskModal);
