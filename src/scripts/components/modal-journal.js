import { createJournal, getJournal } from "./database/stores/journal.js";
import { linkTaskToJournal } from "./database/stores/relation.js";

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
            input[type="text"],
            input[type="date"] {
                margin-top: 5px;
                padding: 8px;
                font-size: 16px;
                border: 1px solid #ccc;
                border-radius: 4px;
            }
            input[type="text"]:focus,
            input[type="date"]:focus {
                outline: none;
                border-color: #007BFF;
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
            <label for="path">Path:</label>
            <input type="text" id="path" name="path">
            <label for="tasks">Tasks:</label>
            <input type="text" id="tasks" name="tasks">
            <label for="tags">Tags:</label>
            <input type="text" id="tags" name="tags">
            <input type="submit" value="Create">
        `;

        form.addEventListener('submit', this.handleFormSubmit);

        modalContent.appendChild(h2);
        modalContent.appendChild(form);
        modalWrapper.appendChild(modalContent);
        shadow.appendChild(style);
        shadow.appendChild(modalWrapper);
    }

    /**
    * Handles the submission of a form, preventing the default submission event,
    * extracting form data, creating a journal entry, and linking tasks to the journal.
    *
    * @param {Event} event - The event object representing the form submission.
    * @fires Event#preventDefault
    * @returns {void}
    */
    handleFormSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        createJournal(formData.get('title'),formData.get('path'),formData.get('tags').split(", "));
        let tasks=formData.get("tasks").split(", ");
        tasks.forEach(element =>  {
            linkTaskToJournal(element,getJournal(formData.get('path')));
        });
            // Handle the form data as needed
        console.log('Journal created: ', getJournal(formData.get('path')));
    }

}

customElements.define('modal-journal', ModalJournal);
