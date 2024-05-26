const USE_SHADOW_ROOT = 0;

class JournalEditor extends HTMLElement {
    constructor() {
        super(); // Inherit everything from HTMLElement

        if (USE_SHADOW_ROOT) {
            this.attachShadow({ mode: "open" });
            this.hack();
        }
        const shadow = (USE_SHADOW_ROOT ? this.shadowRoot : this);

        shadow.innerHTML = `
        <form>
            <input id="journalTitle" type="text" placeholder="Title" autofocus/>
            <input id="journalTags" type="text" placeholder="Tags"/>
            <input id="journalDeadline" type="datetime-local"/>
            <button type="button">Toggle Side View</button>
            <div id="journalContent">
                <div id="markdownEditor"></div>
                <textarea id="textEditor" hidden></textarea>
            </div>
        </form>
        `

        const script = document.createElement('script');
        script.src = "https://www.unpkg.com/wysimark-standalone/dist/javascript/index.cjs.js";
        script.onload = () => {
            this.setupMarkdownEditor();
        };
        shadow.appendChild(script);

        const style = document.createElement("style");
        style.innerHTML = `
        form {
            display: flex;
            gap: 0.5rem;
            flex-direction: column;
        }
        
        #journalTitle {
            font-size: 2.5rem;
            text-align: center;
        }
        
        #journalTags, #journalDeadline {
            font-size: 1.0rem;
            text-align: center;
        }
        
        #journalContent {
            display: flex;
        }
        
        #markdownEditor {
            width: 100%;
        }
        
        button {
            width: fit-content;
            align-self: end;
        }

        #textEditor {
            width: 50%;
        }
        `
        shadow.appendChild(style);
    }

    /**
     * Sets data from journal
     * @param {Journal} - A journal object
     */
    set data(journal) {
        const textareaElem = document.getElementById('textEditor');
        textareaElem.value = journal.content;
        this.wysimark.setMarkdown(journal.content);

        const titleElem = document.getElementById("journalTitle");
        titleElem.value = journal.title;

        const tagsElem = document.getElementById('journalTags');
        tagsElem.value = journal.tags.join(',');
    }

    /**
     * Gets journal title
     * @returns {string} - Journal title
     */
    get title() {
        const titleElem = document.getElementById("journalTitle");
        return titleElem.value;
    }

    /**
     * Gets journal's tags
     * @returns {string[]} - Array of tags as strings
     */
    get tags() {
        const tagsElem = document.getElementById('journalTags');
        return tagsElem.value.split(',').map(str => str.trim());
    }

    /**
     * Gets journal content
     * @returns {string} - Journal content
     */
    get content() {
        return this.wysimark.getMarkdown();
    }

    setupMarkdownEditor() {
        const container = (USE_SHADOW_ROOT ? this.shadowRoot : document)
            .getElementById('markdownEditor');

        this.wysimark = createWysimark(container, {
            initialMarkdown: "",
            onChange: (markdown) => {
                const textarea = document.getElementById('textEditor');
                textarea.value = markdown;
            },
        });
    }

    connectedCallback() {
        // Side View Button functionality
        const shadow = (USE_SHADOW_ROOT ? this.shadowRoot : document);
        const button = shadow.querySelector('button');
        const textarea = shadow.getElementById('textEditor');
        button.addEventListener('click', () => {
            const editor = shadow.getElementById('markdownEditor');
            if (this.sideBySide) {
                textarea.hidden = true;
                editor.style.width = "100%";
            } else {
                textarea.hidden = false;
                editor.style.width = "50%";
            }
            this.sideBySide = !this.sideBySide;
        });
        // Keep markdown editor in sync with textarea
        textarea.addEventListener('input', () => {
            this.wysimark.setMarkdown(textarea.value);
        });
    }

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