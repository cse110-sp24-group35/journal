class CalendarDay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    disconnectedCallback() {
        this.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    handleMouseMove(event) {
        const box = this.shadowRoot.querySelector('.box');
        box.style.left = `${event.clientX}px`;
        box.style.top = `${event.clientY}px`;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .box {
                    position: absolute;
                    width: 200px;
                    height: 200px;
                    background-color: #f0f0f0;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    display: none;
                }
            </style>
            <div class="box"></div>
        `;
    }
}

customElements.define('calendar-day', CalendarDay);