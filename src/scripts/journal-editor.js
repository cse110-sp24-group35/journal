
class JournalEditor extends HTMLElement {
    constructor() {
        super(); // Inherit everything from HTMLElement

        const shadow = this.attachShadow({ mode: "open" });
        //const input = document.createElement("input");
        //input.type = "textarea";
        //const style = document.createElement("style");
        //style.innerHTML;
        //shadow.appendChild(style);
       // shadow.appendChild(input);

        shadow.innerHTML = `
        <label>
            Journal Editor
            <textarea rows="10" cols="33">hello</textarea>
        </label>
        `
    }
}

customElements.define("journal-editor", JournalEditor);