class TaskCard extends HTMLElement {
	// Called once when document.createElement('recipe-card') is called, or
	// the element is written into the DOM directly as <recipe-card>
	constructor() {
		super(); // Inherit everything from HTMLElement

		// EXPOSE - START (All expose numbers start with A)
		// A1. TODO - Attach the shadow DOM to this Web Component (leave the mode open)
		const shadowRoot = this.attachShadow({ mode: 'open' });
		// A2. TODO - Create an <article> element - This will hold our markup once our data is set
		const article = document.createElement("article");
		// A3. TODO - Create a style element - This will hold all of the styles for the Web Component
		const style = document.createElement("style");
		style.innerHTML = `  
        * {
        font-family: "biski"; 
        color:#594F4F;
        }

		.inside {
            font-size:20px;
            flex: 1 1 auto;
            background-color: white;
            padding-left: 30px;
            padding-top: 15px;
            padding-bottom: 40px;
            margin-left: 20px;
            margin-right: 20px;
            margin-top: 20px;
            width: 240px;
            height: 80px;
            /*change this to make them fly else where*/
            position: relative;
            border-radius: 80px;
        }
        /*name & description*/
        .inside p {
            text-align: left;
            position: relative;
            background-color: white;
            margin: 0;
            width: 200px;
        }
    
        /*due date*/
        .inside pre{
            left: 90px;
            position: absolute;
            text-align: right;
            background-color: white;
            width: 100px;
            margin:0;
            border: none;
        }
    
        .orangeBlob{
            top: 0;
            position: absolute;
            background-color: transparent;
        }
    
        .grayBlob {
            position: absolute;
            background-color: transparent;
            left: 45px;
            bottom: 0;
        }
    
        /* remove button*/
        .edit {
            border: none;
            background-color: white;
            cursor: pointer;
            position: absolute;
            bottom: 30px;
            right: 13px;
            transform: scaleX(-1);
        }
    
        /* edit button*/
        .remove {
            border: none;
            background-color: white;
            cursor: pointer;
            position: absolute;
            top: 30px;
            right: 13px;
        }
    
        .pencil {
            background-color: white;
        }`;

		// A4. TODO - Insert all of the styles from cardTemplate.html into the <style> element you just made (copy everything INSIDE the <style> tag>)
		shadowRoot.appendChild(article);
		shadowRoot.appendChild(style);
	}

	/**
	 * Called when the .data property is set on this element.
	 *
	 * For example:
	 * let recipeCard = document.createElement('recipe-card'); // Calls constructor()
	 * recipeCard.data = { foo: 'bar' } // Calls set data({ foo: 'bar' })
	 *
	 * @param {Object} data - The data to pass into the <recipe-card> must be of the
	 *                        following format:
	 *                        {
	 *                          "imgSrc": "string",
	 *                          "imgAlt": "string",
	 *                          "titleLnk": "string",
	 *                          "titleTxt": "string",
	 *                          "organization": "string",
	 *                          "rating": number,
	 *                          "numRatings": number,
	 *                          "lengthTime": "string",
	 *                          "ingredients": "string"
	 *                        }	
	 */
	set data(data) {
        if (!data) {
            alert("Nothing has been entered")
            return;
        }
        const shadowArticle = this.shadowRoot.querySelector('article');

        shadowArticle.classList.add("inside");
        let taskName = document.createElement("p"); 
        taskName.innerHTML = data.taskName; // replace with dynamic data
        shadowArticle.appendChild(taskName);
        let taskDesc = document.createElement("p"); 
        taskDesc.innerHTML = data.taskDesc; // replace with dynamic data
        shadowArticle.appendChild(taskDesc);
        let taskDate = document.createElement("pre"); 
        taskDate.innerHTML = data.dueDate; // replace with dynamic data
        shadowArticle.appendChild(taskDate);
        
        let orangeBlob = document.createElement("img");
        orangeBlob.src = "public/images/orangeBlob.png";
        orangeBlob.alt = "Orange Blob"
        orangeBlob.height = "40";
        orangeBlob.width = "65";
        orangeBlob.classList.add("orangeBlob");
        shadowArticle.appendChild(orangeBlob);
        let grayBlob = document.createElement("img");
        grayBlob.src = "public/images/grayBlob.png";
        grayBlob.alt = "Gray Blob"
        grayBlob.height = "45";
        grayBlob.width = "50";
        grayBlob.classList.add("grayBlob");
        shadowArticle.appendChild(grayBlob);

        let editBtn = document.createElement("button"); 
        editBtn.innerHTML = `<img class="pencil" src="public/images/pencil.png" alt="remove" width="30" height="30">`;
        editBtn.classList.add("edit"); 
        shadowArticle.appendChild(editBtn);
        let delBtn = document.createElement("button");
        delBtn.innerHTML = `<img src="public/images/close.jpg" alt="edit" width="23" height="23">`;
        delBtn.classList.add("remove"); 
        delBtn.addEventListener("click", () => {
            shadowArticle.remove();
        });
        shadowArticle.appendChild(delBtn);
	}
}
// A8. TODO - Define the Class as a customElement so that you can create
//           'recipe-card' elements

customElements.define("added-task", TaskCard);