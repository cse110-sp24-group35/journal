class MySidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        const container = document.createElement('div');
        container.setAttribute('class', 'sidebar');

        const buttonNames = ['Overview', 'Calendar', 'Tasks', 'Journal', 'Login'];

        buttonNames.forEach(name => {
            const button = document.createElement('button');
            button.textContent = name;
            button.classList.add('sidebar-button');
            container.appendChild(button);
        });

        const style = document.createElement('style');
        style.textContent = `
            .sidebar {
                position: fixed;
                top: 0;
                left: 0;
                width: 15%;
                height: 100%;
                background-color: #f4f4f4;
                box-shadow: 2px 0 5px rgba(0,0,0,0.1);
                display: flex;
                flex-direction: column;
                padding: 20px;
                box-sizing: border-box;
            }
            .sidebar-button {
                background-color: #ffffff;
                border: 1px solid #ccc;
                border-radius: 5px;
                margin: 5px 0;
                padding: 10px;
                text-align: left;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            .sidebar-button:hover {
                background-color: #ddd;
            }
        `;

        this.shadowRoot.append(style, container);
    }
}

customElements.define('my-sidebar', MySidebar);
