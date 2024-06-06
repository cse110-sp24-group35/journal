class JournalEditor extends HTMLElement {
    constructor() {
        super(); // Inherit everything from HTMLElement

        const shadow = this.attachShadow({ mode: "open" });

        shadow.innerHTML = `
        <form>
            <input id="journal-title" type="text" placeholder="Title" autofocus/>
            <input id="journal-tags" type="text" placeholder="Tags"/>
            <input id="show-preview" type="button" value="Show live preview"/>
            <div id="journal-content">
                <textarea id="text-editor" rows=16></textarea>
                <div id="markdown-preview" class="preview" hidden></div>
            </div>
        </form>
        `

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

        /* Show Live Preview Button */
        #show-preview {
            width: fit-content;
            align-self: end;
            background-color: transparent;
        }

        /***** Journal Content *****/

        #journal-content {
            display: flex;
            flex-direction: column;
        }

        #markdown-editor {
            width: 100%;
        }

        #text-editor {
            width: 100%;
            margin-bottom: 1rem;
        }

        #markdown-preview {
            width: 100%;
            background-color: #f4f4f4;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            overflow-y: auto;
        }
        `;
        shadow.appendChild(style);

        // Editor starts out with invalid path,
        //   so that a message can be displayed
        this.path = null;

        // Add event listener for live preview button
        const showPreviewButton = shadow.getElementById('show-preview');
        showPreviewButton.addEventListener('click', () => {
            this.togglePreview();
        });

        // Add event listener for live preview
        const textarea = shadow.getElementById('text-editor');
        textarea.addEventListener('input', () => {
            this.updatePreview(textarea.value);
        });
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
            if (element.nodeType === Node.ELEMENT_NODE) {
                element.hidden = hide;
            }
        });

        this.shadowRoot.getElementById("text-editor").hidden = hide;
        this.shadowRoot.getElementById("markdown-preview").hidden = hide;

        if (hide) {
            if (!this.shadowRoot.querySelector('#no-journal-message')) {
                const message = document.createElement('p');
                message.id = 'no-journal-message';
                message.innerText = "No journal selected";
                this.shadowRoot.appendChild(message);
            }
        } else {
            const message = this.shadowRoot.querySelector("#no-journal-message");
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
        this.updatePreview(journal.content);

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
    }

    updatePreview(markdown) {
        const preview = this.shadowRoot.getElementById('markdown-preview');
        preview.innerHTML = marked(markdown);
    }

    togglePreview() {
        const preview = this.shadowRoot.getElementById('markdown-preview');
        preview.hidden = !preview.hidden;
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

// Include the marked library
const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
script.onload = () => {
    console.log('Marked library loaded');
};
document.head.appendChild(script);
