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
        <nav>
            <input id="journalTitle" type="text" placeholder="Title" autofocus/>
            <input id="journalDeadline" type="datetime-local"/>
            <input id="journalTags" type="text" placeholder="Tags"/>
            <button>Toggle Side View</button>
            <section id="journalContent">
                <div id="markdownEditor"></div>
            </section>
        </nav>
        `

        const script = document.createElement('script');
        script.src = "https://www.unpkg.com/wysimark-standalone/dist/javascript/index.cjs.js";
        script.onload = () => { this.setupMarkdownEditor(); };
        shadow.appendChild(script);

        const style = document.createElement("style");
        style.innerHTML = `
        nav {
            display: flex;
            gap: 0.5rem;
            flex-direction: column;
        }
        
        #journalTitle {
            font-size: 2.5rem;
        }

        #journalTags, #journalDeadline {
            font-size: 1.0rem;
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
        `
        shadow.appendChild(style);
    }

    setupMarkdownEditor() {
        const container = (USE_SHADOW_ROOT ? this.shadowRoot : document)
            .getElementById('markdownEditor');

        this.wysimark = createWysimark(container, {
            initialMarkdown: '# Heading 1\n## Heading 2\nhello world',
            onChange: (markdown) => {
                if (this.sideBySide) {
                    const textarea = document.querySelector('textarea');
                    textarea.value = markdown;
                }
            },
        });
    }

    connectedCallback() {
        // Side View Button functionality
        const shadow = (USE_SHADOW_ROOT ? this.shadowRoot : document);
        const button = shadow.querySelector('button');
        button.addEventListener('click', () => {
            const content = shadow.getElementById('journalContent');
            const editor = shadow.getElementById('markdownEditor');
            if (this.sideBySide) {
                content.removeChild(shadow.querySelector('textarea'));
                editor.style.width = "100%";
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = this.wysimark.getMarkdown();
                textarea.addEventListener('input', () => {
                    this.wysimark.setMarkdown(textarea.value);
                });
                content.appendChild(textarea);
                editor.style.width = "50%";
                textarea.style.width = "50%";
            }
            this.sideBySide = !this.sideBySide;
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