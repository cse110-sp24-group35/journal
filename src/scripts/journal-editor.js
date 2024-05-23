class JournalEditor extends HTMLElement {
    constructor() {
        super(); // Inherit everything from HTMLElement

        //const shadow = this.attachShadow({ mode: "open" });
        //const input = document.createElement("input");
        //input.type = "textarea";
        const style = document.createElement("style");
        style.innerHTML = `
        nav {
            display: flex;
            flex-direction: column;
        }
        `;

        this.innerHTML = `
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
                <button>Toggle Side View</button>
                </label>
            </nav>
                
            <div id="markdown-editor"></div>
            `

        this.appendChild(style);
        
        const container = document.getElementById("markdown-editor")
        // createWysimark is available on window now
        const wysimark = createWysimark(container, {
            initialMarkdown: `# Heading 1
## Heading 2
hello world`,
        })
    }
}

customElements.define("journal-editor", JournalEditor);