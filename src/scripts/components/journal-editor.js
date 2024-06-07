import { marked } from 'marked';

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
                <div id="markdown-preview" class="preview"></div>
            </div>
        </form>
        `

        const style = document.createElement('style');
        style.innerHTML = `
        form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        input[type="text"], textarea {
            width: 100%;
            padding: 10px;
            margin: 5px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 1rem;
        }

        #journal-title {
            font-size: 2.5rem;
            text-align: center;
        }

        #journal-tags {
            font-size: 1rem;
            text-align: center;
        }

        /* Show Live Preview Button */
        #show-preview {
            align-self: flex-end;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1rem;
        }

        #show-preview:hover {
            background-color: #0056b3;
        }

        /***** Journal Content *****/

        #journal-content {
            display: flex;
            gap: 1rem;
        }

        #text-editor {
            width: 50%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 1rem;
            transition: width 0.3s ease;
        }

        #markdown-preview {
            width: 50%;
            background-color: #f4f4f4;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            overflow-y: auto;
            transition: width 0.3s ease;
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
        const textarea = this.shadowRoot.getElementById('text-editor');
        if (preview.hidden) {
            preview.hidden = false;
            textarea.style.width = "50%";
            this.shadowRoot.getElementById('show-preview').value = "Hide live preview";
        } else {
            preview.hidden = true;
            textarea.style.width = "100%";
            this.shadowRoot.getElementById('show-preview').value = "Show live preview";
        }
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
