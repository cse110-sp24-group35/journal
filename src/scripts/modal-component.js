class ModalComponent extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const modalWrapper = document.createElement('div');
        modalWrapper.setAttribute('class', 'modal');

        const modalContent = document.createElement('div');
        modalContent.setAttribute('class', 'modal-content');

        const style = document.createElement('style');
        style.textContent = `
            .modal {
                display: block; 
                position: fixed;
                z-index: 1;
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
                margin: 15% auto;
                padding: 20px;
                border: 1px solid #888;
                width: 80%;
            }
        `;

        const h2 = document.createElement('h2');
        h2.textContent = 'Create Journal';

        const form = document.createElement('form');

        form.innerHTML = `
            <label for="title">Title:</label>
            <input type="text" id="title" name="title">
            <br>
            <label for="due">Due:</label>
            <input type="date" id="due" name="due">
            <br>
            <label for="tags">Tags:</label>
            <input type="text" id="tags" name="tags">
        `;

        modalContent.appendChild(h2);
        modalContent.appendChild(form);
        modalWrapper.appendChild(modalContent);
        shadow.appendChild(style);
        shadow.appendChild(modalWrapper);
    }
}

customElements.define('modal-component', ModalComponent);
