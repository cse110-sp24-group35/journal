import { journals, getJournal } from '../database/stores/journal.js';
import { marked } from 'marked';

class JournalEditor extends HTMLElement {
    constructor() {
        super(); // Inherit everything from HTMLElement

        const shadow = this.attachShadow({mode: "open"});

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
        }

        #markdown-editor {
            width: 100%;
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
    }

    /**
     * Checks if the editor is currently editing a journal.
     *
     * @returns {boolean} True if the editor has a journal being edited, otherwise false.
     */
    hasJournal() {
        return this.shadowRoot.path !== null;
    }
    
    /**
     * Saves current journal to local storage.
     */
    save() {
        const shadow = this.shadowRoot;
        
        // sanity check
        if (this.shadowRoot.path === null) {
            console.warn("Unable to save: no journal is selected");
            return;
        }

        console.log('Saving journal');
        
        // Use get() so we have an array to set as the new journal
        //    after we have done our changes.
        const journalArray = journals.get();
        const journalIndex = journalArray.findIndex(j => j.path === shadow.path);
        const entry = journalArray[journalIndex];

        entry.title   = shadow.getElementById('journal-title').value;
        entry.content = shadow.getElementById('text-editor').value;
        const tags = shadow.getElementById('journal-tags');
        entry.tags = tags.value.split(',').map(str => str.trim());
        entry.modifiedAt = Date.now();
        
        journals.set(journalArray);
    }

    connectedCallback() {
        const shadow = this.shadowRoot;

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
        
        function debounce(func, timeout = 1000) {
            let timer;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => { func.apply(this, args); }, timeout);
            };
        }
        
        const inputElements = [
            shadow.getElementById('text-editor'),
            shadow.getElementById('journal-title'),
            shadow.getElementById('journal-tags'),
        ];
        
        const processChange = debounce(() => this.save());
        for (let element of inputElements) {
            element.addEventListener('input', processChange);
        }
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
     * Sets journal path of journal being edited
     * (controls whether editor is hidden or not)
    * @param {string} path - journal path
     */
    set path(path) {
        const entry = getJournal(path);
        const validPath = (entry !== undefined);

        // Make sure to save before switching entries
        if (this.shadowRoot.path) this.save();

        this.shadowRoot.path = validPath ? path : null;

        if (validPath) {
            this.setData(entry);
        }
        
        // Hide all the input stuff if we have an invalid path
        this.changeInputVisibility(!validPath);
    }

    /**
     * Changes the `hidden` property of input elements
     * @param {boolean} hide - true if we should show input elements
     */
    changeInputVisibility(hide) {
        const form = this.shadowRoot.querySelector('form');
        form.childNodes.forEach(element => {
            if (element.nodeType === Node.ELEMENT_NODE) {
                element.hidden = hide;
            }
        });

        this.shadowRoot.getElementById("text-editor").hidden = hide;
        this.shadowRoot.getElementById("markdown-preview").hidden = hide;

        if (hide) {
            if (!this.shadowRoot.querySelector('#no-journal-message')) {
                form.style.display = 'none';
                const message = document.createElement('p');
                message.id = 'no-journal-message';
                message.innerText = "No journal selected";
                this.shadowRoot.appendChild(message);
            }
        } else {
            form.style.display = 'flex';
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
    setData(journal) {
        const textarea = this.shadowRoot.getElementById('text-editor');
        textarea.value = journal.content;
        this.updatePreview(journal.content);

        const title = this.shadowRoot.getElementById("journal-title");
        title.value = journal.title;

        const tags = this.shadowRoot.getElementById('journal-tags');
        tags.value = journal.tags.join(', ');
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