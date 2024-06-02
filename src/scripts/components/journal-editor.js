class JournalEditor extends HTMLElement {
    constructor() {
        super(); // Inherit everything from HTMLElement

        const shadow = this.attachShadow({ mode: "open" });

        shadow.innerHTML = `
        <form>
            <input id="journalTitle" type="text" placeholder="Title" autofocus/>
            <input id="journalTags" type="text" placeholder="Tags"/>
            <input id="journalDeadline" type="datetime-local"/>
            <input id="journalSideView" type="button" value="Toggle Side View"/>
            <div id="journalContent">
                <div id="markdownEditor"></div>
                <textarea id="textEditor" hidden></textarea>
            </div>
        </form>
        `

        // Load Javascript script for Markdown editor
        //    (lets us use `createWysimark`)
        //const script = document.createElement('script');
        //script.src = "https://www.unpkg.com/wysimark-standalone/dist/javascript/index.cjs.js";
        //script.onload = () => {
        //    this.setupMarkdownEditor();
        //};
        //shadow.appendChild(script);

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "./styles/journal-editor.css";
        shadow.appendChild(link);

        this.path = null;
    }

    connectedCallback() {
        //const shadow = this.shadowRoot;

        // Side View Button functionality
        //const button = shadow.getElementById('journalSideView');
        //const textarea = shadow.getElementById('textEditor');
        //button.addEventListener('click', () => {
        //    const editor = shadow.getElementById('markdownEditor');
        //    if (this.sideBySide) {
        //        textarea.hidden = true;
        //        editor.style.width = "100%";
        //    } else {
        //        textarea.hidden = false;
        //        editor.style.width = "50%";
        //    }
        //    this.sideBySide = !this.sideBySide;
        //});

        // Keep markdown editor in sync with textarea
        //textarea.addEventListener('input', () => {
        //    this.wysimark.setMarkdown(textarea.value);
        //});
    }

    /**
     * Sets journal path (controls whether editor is hidden or not)
     * @param {string} path - journal path
     */
    set path(path) {
        this.shadowRoot.path = path;
        const form = this.shadowRoot.querySelector('form');
        
        const hide = !path;
        form.childNodes.forEach(element => {
            if (element.id != "textEditor")
                element.hidden = hide;
        });

        if (hide) {
            const message = document.createElement('p');
            message.innerText = "No journal selected";
            this.shadowRoot.appendChild(message);
        }
        else {
            const message = this.shadowRoot.querySelector("p");
            if (message) {
                this.shadowRoot.removeChild(message);
            }
        }
    }

    /**
     * Sets data from journal
     * @param {Journal} journal - journal to get data from.
     */
    set data(journal) {
        //const textareaElem = document.getElementById('textEditor');
        //textareaElem.value = journal.content;
        //this.wysimark.setMarkdown(journal.content);
        
        const title = this.shadowRoot.getElementById("journalTitle");
        title.value = journal.title;
        
        const tags = this.shadowRoot.getElementById('journalTags');
        tags.value = journal.tags.join(', ');
        
        // getFullYear, getMonth, getDate, getHours, getMinutes all return values of local time.
        const convertToDateTimeLocalString = (date) => {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        }
        
        const date = this.shadowRoot.getElementById('journalDeadline');
        date.value = convertToDateTimeLocalString(new Date(journal.createdAt));

        this.path = journal.path;
    }

    /**
     * Gets journal title
     * @returns {string} - Journal title
     */
    get title() {
        const title = document.getElementById("journalTitle");
        return title.value;
    }

    /**
     * Gets journal's tags
     * @returns {string[]} - Array of tags as strings
     */
    get tags() {
        const tags = document.getElementById('journalTags');
        return tags.value.split(',').map(str => str.trim());
    }

    /**
     * Gets journal content
     * @returns {string} - Journal content
     */
    get content() {
        return null;
        //return this.wysimark.getMarkdown();
    }

    setupMarkdownEditor() {
        const container = this.shadowRoot.getElementById('markdownEditor');

        this.wysimark = createWysimark(container, {
            initialMarkdown: "",
            onChange: (markdown) => {
                const textarea = document.getElementById('textEditor');
                textarea.value = markdown;
            },
        });
    }

    /*
    * Hack to get the styles to show up while using Shadow DOM.
    */
    hack() {
        this.styleObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(node => {
                        if (node?.getAttribute?.('data-emotion')) {
                            this.shadowRoot.appendChild(node.cloneNode(true));
                        }
                    })
                }
            })
        })

        this.styleObserver.observe(document.head, {
            attributes: true,
            childList: true,
            subtree: false,
            attributeFilter: ['data-emotion']
        });
    }
}

customElements.define("journal-editor", JournalEditor);