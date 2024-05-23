
class JournalEditor extends HTMLElement {
    constructor() {
        super(); // Inherit everything from HTMLElement

        const shadow = this.attachShadow({ mode: "open" });
        //const input = document.createElement("input");
        //input.type = "textarea";
        const style = document.createElement("style");
        style.innerHTML = `
        nav {
            display: flex;
            flex-direction: column;
        }
        `;
        
        shadow.innerHTML = `
        <nav>
        <label>
        Entry Title
        <input type="text"/>
        </label>
        
        <label>
        Deadline
        <input type="datetime"/>
        </label>
        
            <label>
            Tags
            <input type="datetime"/>
            </label>
            
            <label>
            <input type="checkbox"/>
            Side view
            </label>
            </nav>
            
            <textarea id="editor"></textarea>
            `

            shadow.appendChild(style);
        }
    }
    
    customElements.define("journal-editor", JournalEditor);