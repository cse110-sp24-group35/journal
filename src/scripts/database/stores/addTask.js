class NewTasks extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({mode: 'open'});
        const span = document.createElement('span');
        const style = document.createElement('style');
        style.innerHTML = `
        /*for shadowroot*/
        /*Oval Information*/
        article {
            font-size:20px;
            flex: 1 1 auto;
            background-color: white;
            padding-left: 20px;
            padding-top: 15px;
            padding-bottom: 40px;
            margin-left: 20px;
            margin-right: 20px;
            margin-top: 20px;
            width: 240px;
            height: 70px;
            position: absolute;
            border-radius: 60px;
        }
        /*name & description*/
        article > p {
            text-align: left;
            position: relative;
            background-color: white;
            margin: 0;
            width: 200px;
        }
        
        /*due date*/
        article > pre{
            left: 100px;
            position: absolute;
            text-align: right;
            background-color: white;
            width: 100px;
            border: none;
        }
        
        /* remove button*/
        .remove {
            border: none;
            background-color: white;
            cursor: pointer;
            position: absolute;
            bottom: 32px;
            right: 13px;
        }
        
        /* edit button*/
        .edit {
            border: none;
            background-color: white;
            cursor: pointer;
            position: absolute;
            top: 32px;
            right: 13px;
        }`;

        shadowRoot.appendChild(article);
		shadowRoot.appendChild(style);
    }

    setdata(data) {
        if (!data) {
            alert("Nothing has been entered")
            return;
        }
        const shadowArticle = this.shadowRoot.querySelector('article');

        let taskName = document.createElement("p"); 
        taskName.innerHTML = data.taskName; //fix
        shadowArticle.appendChild(taskName); // add p to shadowRoot
        let taskDesc = document.createElement("p"); 
        taskDesc.innerHTML = data.taskDesc; // fix
        shadowArticle.appendChild(taskDesc); // add p to shadowRoot
        let taskDate = document.createElement("pre"); 
        taskDate.innerHTML = data.taskDate;
        shadowArticle.appendChild(taskDate); // add pre to shadowRoot
        let editBtn = document.createElement("button"); 
        editBtn.classList.add("edit"); 
        editBtn.innerHTML = `<img src="styles\images\pencil.jpg" alt="remove" width="20" height="20"></img>`;
        // add image to button
        shadowArticle.appendChild(editBtn); // add edit button to shadowRoot
        let delBtn = document.createElement("button");
        delBtn.classList.add("remove"); // add remove class to delete button
        delBtn.innerHTML = `<img src="styles\images\close.jpg" alt="edit" width="20" height="20">`;
        shadowArticle.appendChild(delBtn); // add delete button to shadowRoot
    }
}

customElements.define("added-task", NewTasks);

window.addEventListener('DOMContentLoaded', init);

function init() {
    let addButton0 =  document.getElementsByClassName("add")[0];
    let addButton1 =  document.getElementsByClassName("add")[1];
    let addButton2 =  document.getElementsByClassName("add")[2];
    let addButton3 =  document.getElementsByClassName("add")[3];
    let modal = document.getElementById("modalBlock");
    let box = document.getElementById("boxes");

    addButton0.onclick = function() {
        modal.style.display = "block";
        box.style.display = "none";
    };

    addButton1.onclick = function() {
        modal.style.display = "block";
        box.style.display = "none";
    };

    addButton2.onclick = function() {
        modal.style.display = "block";
        box.style.display = "none";
    };

    addButton3.onclick = function() {
        modal.style.display = "block";
        box.style.display = "none";
    };

    //close module button
    const x = document.getElementsByClassName("close")[0];

    x.onclick = function() {
        modal.style.display = "none";
        box.style.display = "flex";
    }
}