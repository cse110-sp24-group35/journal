window.addEventListener("DOMContentLoaded", init);

function init(){
    let journals = getJournalsFromStorage(); //function need to be written

    addJournalsToDocument(journals); //function needs to be written
    initFormHandler();
}
function saveJournalsToStorage(journals) {
	localStorage.setItem('journals', JSON.stringify(journals));
}

/*
    * initFormHandler is a function to be called when journal page is opened to 
    * collect any journals from local storage that were previously there 
    * and eventually add in others 
    * Code is formmated and based off code from Lab 7
    * Amount of hours lost trying to figure some dumb shit out: 1.15
*/

function initFormHandler() {
	// B2. TODO - Get a reference to the <form> element
	const form = document.querySelector('form');
	// B3. TODO - Add an event listener for the 'submit' event, which fires when the 
	//            submit button is clicked
	form.addEventListener('submit', (event) => {
		event.preventDefault();
	
	// B4. TODO - Create a new FormData object from the <form> element reference above
		const formData = new FormData(form);

		const newJournal=createJournal(formData.get("#title"),formData.get("#path"),formData.get("#tags"))
        
		const main = document.querySelector('main');
    	main.appendChild(newJournal);

		let journals = JSON.parse(localStorage.getItem('journals'));
    	journals.push(newJournal);
    	saveJournalsToStorage(recipes);
  	});
}

function getJournalsFromStorage() {
	return JSON.parse(localStorage.getItem('journals')) || [];
}