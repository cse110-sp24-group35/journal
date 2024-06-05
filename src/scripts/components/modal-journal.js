class ModalJournal extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const modalWrapper = document.createElement('div');
        modalWrapper.setAttribute('class', 'modal');

        const modalContent = document.createElement('div');
        modalContent.setAttribute('class', 'modal-content');

        const style = document.createElement('style');
        style.innerHTML = `
            .modal {
                display: flex;
                justify-content: center;
                align-items: center;
                position: fixed;
                z-index: 1;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
            }
            .modal-content {
                background-color: #fff;
                border-radius: 8px;
                padding: 20px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                position: relative;
                animation: fadeIn 0.3s ease-in-out;
            }
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            .close-button {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: transparent;
                color: #000;
                border: none;
                font-size: 24px;
                cursor: pointer;
                transition: color 0.3s ease;
            }
            .close-button:hover {
                color: #ff0000;
            }
            h2 {
                margin-top: 0;
            }
            form {
                display: flex;
                flex-direction: column;
            }
            label {
                margin-top: 10px;
                font-weight: bold;
            }
            input[type="text"] {
                margin-top: 5px;
                padding: 8px;
                font-size: 16px;
                border: 1px solid #ccc;
                border-radius: 4px;
            }
            input[type="text"]:focus {
                outline: none;
                border-color: #007BFF;
            }
            select {
                margin-top: 5px;
                padding: 8px;
                font-size: 16px;
                border: 1px solid #ccc;
                border-radius: 4px;
                height: 100px;
            }
            input[type="submit"] {
                margin-top: 20px;
                padding: 10px;
                font-size: 16px;
                color: #fff;
                background-color: #007BFF;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            input[type="submit"]:hover {
                background-color: #0056b3;
            }
        `;

        const h2 = document.createElement('h2');
        h2.textContent = 'Create Journal';

        const form = document.createElement('form');
        form.innerHTML = `
            <label for="title">Title:</label>
            <input type="text" id="title" name="title">
            <label for="tasks">Tasks:</label>
            <select id="tasks" name="tasks" multiple></select>
            <label for="tags">Tags:</label>
            <input type="text" id="tags" name="tags">
            <input type="submit" value="Create">
        `;

        const closeButton = document.createElement('button');
        closeButton.setAttribute('class', 'close-button');
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => {
            modalWrapper.style.display = 'none';
        });

        modalContent.appendChild(closeButton);
        modalContent.appendChild(h2);
        modalContent.appendChild(form);
        modalWrapper.appendChild(modalContent);
        shadow.appendChild(style);
        shadow.appendChild(modalWrapper);
    }
}

customElements.define('modal-journal', ModalJournal);
