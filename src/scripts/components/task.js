// Run the init() function when the page has loaded
window.addEventListener("DOMContentLoaded", init);

// Starts the program, all function calls trace back here
function init() {

	let addButton0 =  document.getElementsByClassName("add")[0];
    let addButton1 =  document.getElementsByClassName("add")[1];
    let addButton2 =  document.getElementsByClassName("add")[2];
    let addButton3 =  document.getElementsByClassName("add")[3];
    let modal = document.getElementById("modalBlock");
    let box = document.getElementById("container");
    
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

	// Get the recipes from localStorage
	let tasks = getRecipesFromStorage();
	// Add each recipe to the <main> element
	addRecipesToDocument(tasks);
	// Add the event listeners to the form elements
	initFormHandler();
}

/**
 * Reads 'recipes' from localStorage and returns an array of
 * all of the recipes found (parsed, not in string form). If
 * nothing is found in localStorage for 'recipes', an empty array
 * is returned.
 * @returns {Array<Object>} An array of recipes found in localStorage
 */
function getRecipesFromStorage() {
	// A9. TODO - Complete the functionality as described in this function
	//           header. It is possible in only a single line, but should
	//           be no more than a few lines.
	return JSON.parse(localStorage.getItem('tasks')) || [];
}

/**
 * Takes in an array of recipes and for each recipe creates a
 * new <recipe-card> element, adds the recipe data to that card
 * using element.data = {...}, and then appends that new recipe
 * to <main>
 * @param {Array<Object>} tasks An array of recipes
 */
function addRecipesToDocument(tasks) {
	// A10. TODO - Get a reference to the <main> element
	const taskList = document.getElementById("plan");
	
	// A11. TODO - Loop through each of the recipes in the passed in array,
	//            create a <recipe-card> element for each one, and populate
	//            each <recipe-card> with that recipe data using element.data = ...
	//            Append each element to <main>
	tasks.forEach(task => {
		const taskCard = document.createElement('added-task');
		taskCard.data = task;
		taskList.appendChild(taskCard);
	});

}

/**
 * Takes in an array of recipes, converts it to a string, and then
 * saves that string to 'recipes' in localStorage
 * @param {Array<Object>} tasks An array of recipes
 */
function saveRecipesToStorage(tasks) {
	// EXPLORE - START (All explore numbers start with B)
	// B1. TODO - Complete the functionality as described in this function
	//            header. It is possible in only a single line, but should
	//            be no more than a few lines.
	localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Adds the necessary event handlers to <form> and the clear storage
 * <button>.
 */
function initFormHandler() {
	// B2. TODO - Get a reference to the <form> element
	const survey = document.querySelector("form");
	// B3. TODO - Add an event listener for the 'submit' event, which fires when the
	//            submit button is clicked	
	survey.addEventListener("submit", () => {
	
	// Steps B4-B9 will occur inside the event listener from step B3
	// B4. TODO - Create a new FormData object from the <form> element reference above
	const formData = new FormData(survey);

	// B5. TODO - Create an empty object (we'll refer to this object as recipeObject to
	//            make this easier to read), and then extract the keys and corresponding
	//            values from the FormData object and insert them into recipeObject
	let taskObject = new Object();
	for (let [key, value] of formData.entries()) {
		taskObject[key] = value;
	}
		
	// B6. TODO - Create a new <recipe-card> element
	let newTaskCard = document.createElement('added-task')
	// B7. TODO - Add the recipeObject data to <recipe-card> using element.data
	newTaskCard.data = taskObject;
	// B8. TODO - Append this new <recipe-card> to <main>
	const mainPage = document.getElementById("plan");
	mainPage.appendChild(newTaskCard);
	// B9. TODO - Get the recipes array from localStorage, add this new recipe to it, and
	//            then save the recipes array back to localStorage
	let tasks = JSON.parse(localStorage.getItem('tasks')) || []; 
	tasks.push(taskObject);
    localStorage.setItem('tasks', JSON.stringify(tasks));
	});
	// B10. TODO - Get a reference to the "Clear Local Storage" button
	
}