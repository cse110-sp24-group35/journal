import { journals, getJournal } from '../../database/stores/journal.js';
import { marked } from 'marked';
import { tasks } from '../../database/stores/task.js';
import {
    getTasksForJournal,
    linkTaskToJournal, unlinkTaskFromJournal
} from '../../database/stores/relation.js';
import { formatDate } from '../../helper.js';

class JournalEditor extends HTMLElement {
    constructor() {
        super(); // Inherit everything from HTMLElement

        const shadow = this.attachShadow({mode: "open"});

        shadow.innerHTML = `
        <form>
            <input id="journal-title" type="text" placeholder="Title" autofocus/>
            <input id="journal-tags" type="text" placeholder="Tags"/>
            <label for="tasks">Linked Tasks:</label>
            <select id="tasks" name="tasks" multiple>
                 ${tasks.get().map(task => {
            return `<option value=${task.id}>${task.title}</option>`
        })}
            </select>
            <input id="show-preview" type="button" value="Show live preview"/>
            <div id="journal-content">
                <textarea id="text-editor" rows=16></textarea>
                <div id="markdown-preview" class="preview"></div>
            </div>
            
            <div id="saving-status">
                <p>Auto Save Enabled</p>
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
            background-color: #FFF5ED;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            height: 100%;
        }

        input[type="text"], textarea {
            background-color: #F3E2D5;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 1rem;
        }
        
        #saving-status {
            text-align: right;
        }

        #journal-title {
            background-color: #F3E2D5;
            font-size: 2.5rem;
            text-align: center;
        }

        #journal-tags {
            font-size: 1rem;
            text-align: center;
        }

        #tasks {
            background-color: #F3E2D5;
        }

        /* Show Live Preview Button */
        #show-preview {
            align-self: flex-end;
            padding: 10px 20px;
            background-color: #F3E2D5;
            color: #594F4F;
            border: 1px solid #ccc;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1rem;
        }

        #show-preview:hover {
            background-color: #ddd;
        }
            
        #show-preview:active {
            background-color: #ccc;
        }

        /***** Journal Content *****/

        #journal-content {
            display: flex;
        }

        #markdown-editor {
            width: 100%;
        }

        #text-editor {
            background-color: #F3E2D5;
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 1rem;
            transition: 0.3s ease;
        }

        #markdown-preview {
            width: 100%;
            background-color: #F3E2D5;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            overflow-y: auto;
            transition: 0.3s ease;
        }
        `;
        shadow.appendChild(style);

        // Editor starts out with invalid path,
        //   so that a message can be displayed
        this.path = null;
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
            shadow.getElementById("tasks")
        ];

        // Add event listener for auto-saving
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

        // Initialize flex direction
        this.updateFlexDirection();
        // Add event listener for flex direction of journal content
        window.addEventListener('resize', () => this.updateFlexDirection());
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

        const savingStatus = shadow.getElementById("saving-status");

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

        const selectedTasks = Array.from(
            shadow.getElementById("tasks").selectedOptions
        ).map(option => option.value);

        // Force unlink all tasks from this journal first, then link only ones selected
        for (let task of tasks.get()) {
            unlinkTaskFromJournal(task, entry.path);
        }

        for (let task of selectedTasks) {
            linkTaskToJournal(task, entry.path);
        }

        journals.set(journalArray);

        savingStatus.innerHTML = `<p>Saved At: ${formatDate(new Date(entry.modifiedAt))}</p>`;
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
                message.style.fontSize = '3em';
                message.    style.textAlign = 'center';
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
     * Update the flex direction of journal content
     */
    updateFlexDirection() {
        const content = this.shadowRoot.getElementById('journal-content');
        if (window.innerWidth < 800) {
            content.style.flexDirection = 'column';
        } else {
            content.style.flexDirection = 'row';
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

        const linkedTasks = getTasksForJournal(journal.path);
        const tasksDropdown = this.shadowRoot.getElementById('tasks');

        // Iterate over the options and set the selected attribute for matching values
        Array.from(tasksDropdown.options).forEach(option => {
            if (linkedTasks.find(task => task.id === option.value)) {
                option.selected = true;
            }
        });
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
        if (preview.hidden) {
            preview.hidden = false;
            this.shadowRoot.getElementById('show-preview').value = "Hide live preview";
        } else {
            preview.hidden = true;
            this.shadowRoot.getElementById('show-preview').value = "Show live preview";
        }
    }
}

customElements.define("journal-editor", JournalEditor);