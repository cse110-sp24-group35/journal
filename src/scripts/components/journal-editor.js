class JournalEditor extends HTMLElement {
    constructor() {
        super(); // Inherit everything from HTMLElement

        const shadow = this.attachShadow({ mode: "open" });

        shadow.innerHTML = `
        <form>
            <input id="journal-title" type="text" placeholder="Title" autofocus/>
            <input id="journal-tags" type="text" placeholder="Tags"/>
            <input id="journal-side-view" type="button" value="Toggle Side View"/>
            <div id="journal-content">
                <!--<div id="markdown-editor"></div>-->
                <textarea id="text-editor" rows=16></textarea>
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

        const style = document.createElement('style');
        style.innerHTML = `
        form {
            display: flex;
            gap: 0.5rem;
            flex-direction: column;
        }

        form > * {
            color: black;
        }

        #journal-title,
        #journal-tags,
        #journal-deadline {
            background-color: #00000010;
            border: none;
        }

        #journal-title {
            font-size: 2.5rem;
            text-align: center;
        }

        #journal-tags,
        #journal-deadline {
            font-size: 1.0rem;
            text-align: center;
        }

        /* Toggle Side View Button */
        #journal-side-view {
            width: fit-content;
            align-self: end;
            background-color: transparent;
        }

        /***** Journal Content *****/

        #journal-content {
        	display: flex;
        }

        #markdown-editor {
        	width: 100%;
        }

        #text-editor {
        /* Width is 100% for now, while not using markdown editor */
        	width: 100%;
        }
        `;
        shadow.appendChild(style);

        // Editor starts out with invalid path,
        //   so that a message can be displayed
        this.path = null;
    }

    connectedCallback() {
        //const shadow = this.shadowRoot;

        // Side View Button functionality
        //const button = shadow.getElementById('journal-side-view');
        //const textarea = shadow.getElementById('text-editor');
        //button.addEventListener('click', () => {
        //    const editor = shadow.getElementById('markdown-editor');
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

        // Hide all the input stuff if we have an invalid path
        const hide = !path;
        
        form.childNodes.forEach(element => {
            element.hidden = hide;
        });
        
        this.shadowRoot.getElementById("text-editor").hidden = hide;

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
        const textarea = this.shadowRoot.getElementById('text-editor');
        textarea.value = journal.content;
        //this.wysimark.setMarkdown(journal.content);

        const title = this.shadowRoot.getElementById("journal-title");
        title.value = journal.title;

        const tags = this.shadowRoot.getElementById('journal-tags');
        tags.value = journal.tags.join(', ');

        this.path = journal.path;
    }

    /**
     * Gets journal title
     * @returns {string} - Journal title
     */
    get title() {
        const title = this.shadowRoot.getElementById("journal-title");
        return title.value;
    }

    /**
     * Gets journal's tags
     * @returns {string[]} - Array of tags as strings
     */
    get tags() {
        const tags = this.shadowRoot.getElementById('journal-tags');
        return tags.value.split(',').map(str => str.trim());
    }

    /**
     * Gets journal content
     * @returns {string} - Journal content
     */
    get content() {
        return this.shadowRoot.getElementById('text-editor').value;
        //return this.wysimark.getMarkdown();
    }

    /**
     * Sets up Wysimark markdown editor
     */
    setupMarkdownEditor() {
        const container = this.shadowRoot.getElementById('markdown-editor');

        // Tell linter that this function will be available.
        /*global createWysimark*/

        this.wysimark = createWysimark(container, {
            initialMarkdown: "",
            onChange: (markdown) => {
                const textarea = document.getElementById('text-editor');
                textarea.value = markdown;
            },
        });
    }

    /**
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