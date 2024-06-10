class SidebarLayout extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }); // Attach a shadow DOM to this element

        const container = document.createElement('div'); // Create a container div
        container.setAttribute('class', 'sidebar'); // Set the class of the container to 'sidebar'

        // Define button names, corresponding actions (URLs), and SVG icons
        const buttonNames = ['Overview', 'Calendar', 'Tasks', 'Journal'];
        this.buttonActions = {
            'Overview': 'index.html',
            'Calendar': 'calendar.html',
            'Tasks': 'tasks.html',
            'Journal': 'journal.html'
        };

        this.svgIcons = {
            'Overview': 'public/icons/overview-icon.svg',
            'Calendar': 'public/icons/calender-icon.svg',
            'Tasks': 'public/icons/tasks-icon.svg',
            'Journal': 'public/icons/journal-icon.svg'
        };

        this.buttons = {}; // Object to store references to the buttons
        // Retrieve the active button from session storage or default to 'Overview'
        this.activeButton = sessionStorage.getItem('activeButton') || 'Overview';

        // Create buttons for each name in buttonNames
        buttonNames.forEach(name => {
            const button = document.createElement('button');
            const buttonText = document.createElement('span');
            buttonText.textContent = name; // Set button text to the current name
            buttonText.setAttribute('id', `${name.toLowerCase()}-label`); // Set an ID for the span element
            button.classList.add('sidebar-button'); // Add 'sidebar-button' class to the button
            // Create SVG icon for the button
            const icon = document.createElement('img');
            icon.src = this.svgIcons[name];
            icon.setAttribute('aria-labelledby', `${name.toLowerCase()}-label`); // Link the icon to the span element
            icon.classList.add('sidebar-icon');

            button.appendChild(icon); // Append the SVG icon to the button
            button.appendChild(buttonText); // Append the text span to the button

            // Add click event listener to the button
            button.addEventListener('click', () => this.handleButtonClick(name));
            this.buttons[name] = button; // Store reference to the button
            container.appendChild(button); // Append the button to the container
        });

        const style = document.createElement('style'); // Create a style element
        // Set the CSS styles for the sidebar, buttons, and icons
        style.textContent = `
            .sidebar {
                position: fixed;
                top: 0;
                left: 0;
                width: 15%;
                height: 100%;
                background-color: #FFF5ED;
                box-shadow: 2px 0 5px rgba(0,0,0,0.1);
                display: flex;
                flex-direction: column;
                padding: 20px;
                box-sizing: border-box;
            }
            .sidebar-button {
                background-color: #fff;
                border: 1px solid #ccc;
                border-radius: 5px;
                margin: 5px 0;
                padding: 10px;
                text-align: left;
                cursor: pointer;
                transition: background-color 0.3s ease;
                text-color: black;
                display: flex;
                align-items: center;
                background-color: #F3E2D5;
                color: #594F4F;
            }
            .sidebar-button:hover {
                background-color: #ddd;
            }
            .sidebar-button.active {
                background-color: #FF914D;
                cursor: default;
                color: black;
            }
            .sidebar-icon {
                display: none;
                width: 24px;
                height: 24px;
                margin-right: 10px;
            }
            @media (max-width: 700px) {
                .sidebar {
                    width: 80px;
                }
                .sidebar-button {
                    justify-content: center;
                    padding: 10px 0;
                }
                .sidebar-button img {
                    display: block;
                    margin: 0 auto;
                }
                .sidebar-button span {
                    display: none;
                }
            }
        `;

        // Append the style and container to the shadow root
        this.shadowRoot.append(style, container);

        // Set the active button on initial load
        this.updateButtonState(this.activeButton);
    }

    // Handle button click events
    handleButtonClick(name) {
        if (this.activeButton === name) { // If the clicked button is already active, do nothing
            return;
        }

        this.activeButton = name; // Update the active button
        sessionStorage.setItem('activeButton', name); // Store the active button in session storage
        window.location.href = this.buttonActions[name]; // Navigate to the corresponding URL
    }

    // Update the state of the buttons based on the active button
    updateButtonState(activeButton) {
        Object.keys(this.buttons).forEach(key => {
            const button = this.buttons[key];
            if (key === activeButton) { // If this button is the active button
                button.classList.add('active'); // Add 'active' class
                button.setAttribute('disabled', 'true'); // Disable the button
            } else {
                button.classList.remove('active'); // Remove 'active' class
                button.removeAttribute('disabled'); // Enable the button
            }
        });
    }
}

// Define the custom element
customElements.define('sidebar-layout', SidebarLayout);
