/**
 * Imports the required functions and variables from the journal database.
 * @module journal
 */
import { journals, deleteJournal } from '../../database/stores/journal.js';

journals.listen(() => populateTreeView());

document.addEventListener('DOMContentLoaded', function() {
    loadTreeView();
});

/**
 * Loads and sets up the tree view with event listeners for resizing, collapsing, and expanding the tree view.
 * Also initializes buttons for creating and deleting journals.
 * @function
 */
export function loadTreeView() {
    const resizer = document.getElementById('resizer'); // Black bar on the right of the tree-view window. Can be dragged.
    const treeViewer = document.getElementById('resizable-box'); // Tree view window container
    const journalViewer = document.getElementById('journal-view'); // Journal view (Right of tree-view)
    const collapseButton = document.getElementById('collapse-button'); // Button in the center of the resizer
    const expandButton = document.getElementById('expand-button'); // Also button in the center of the resizer
    const sidebar = document.getElementById('sidebar'); // PLACEHOLDER menu (left of tree-view)
    const deleteJournalButton = document.getElementById('delete-journal'); // Button to delete a journal

    // Calls the functions for resizing the tree-view width
    resizer.addEventListener('mousedown', (e) => startResize(e, treeViewer, journalViewer, sidebar));
    // Buttons to collapse and expand the tree view
    collapseButton.addEventListener('click', () => collapseTreeView(treeViewer, journalViewer, collapseButton, expandButton));
    expandButton.addEventListener('click', () => expandTreeView(treeViewer, journalViewer, collapseButton, expandButton));
    // Buttons to create/delete journals (fake journals for now)
    deleteJournalButton.addEventListener('click', deleteSelectedJournal); // Deletes selected journal

    populateTreeView(); // Populates the tree view with all journals on load
}

/**
 * Deletes the selected journal and clears the journal viewer.
 * @function
 */
export function deleteSelectedJournal() {
    const selected = document.querySelector('.selected > button'); //Selected journal (if any)
    const journalViewer = document.getElementById('journal-view'); // Journal view (Right of tree-view)
    journalViewer.innerHTML = ""; // CLEAR whatever was just deleted
    const newJournalEditor = document.createElement("journal-editor"); // Create a new journal editor
    if (selected) { // If a journal is selected
        deleteJournal(selected.id.slice(5)); //Slices the tree/ from the id to get the path
    }
    journalViewer.appendChild(newJournalEditor); // Add the new journal editor to the journal viewer
}

/**
 * Populates the entire tree-view with all journals.
 * @function
 */
export function populateTreeView() {
    const contentContainer = document.getElementById('content'); // Container for individual items of the tree
    contentContainer.innerHTML = ""; // CLEARS tree view before loading it in again.
    const journalViewer = document.getElementById('journal-view'); // Journal view (Right of tree-view)
    // Get an array containing ALL paths to journals
    const allPaths = journals.get().map(journal => journal.path);

    const tree = buildTree(allPaths);
    const treeArray = convertTreeToArray(tree);

    populateButtons(treeArray, contentContainer, "tree", journalViewer);
}

/**
 * Handles the start of the resizing event for the tree-view.
 * @function
 * @param {MouseEvent} e - The mousedown event.
 * @param {HTMLElement} treeViewer - The tree view element.
 * @param {HTMLElement} journalViewer - The journal view element.
 * @param {HTMLElement} sidebar - The sidebar element.
 */
export function startResize(e, treeViewer, journalViewer, sidebar) {
    e.preventDefault(); // Prevent text from being selected while mouse is held down to resize tree-view
    if (!treeViewer.classList.contains('collapsed')) { // Makes sure that you can't drag to resize while the tree view is collapsed
        const resizeListener = (event) => resize(event, treeViewer, journalViewer, sidebar);
        const stopResizeListener = () => stopResize(resizeListener, stopResizeListener);
        document.addEventListener('mousemove', resizeListener); // Calls resize to make tree-view width change according to cursor position
        document.addEventListener('mouseup', stopResizeListener); // Stops changing tree-view width according to cursor position
    }
}

/**
 * Resizes the tree-view based on the mouse position.
 * @function
 * @param {MouseEvent} e - The mousemove event.
 * @param {HTMLElement} treeViewer - The tree view element.
 * @param {HTMLElement} journalViewer - The journal view element.
 * @param {HTMLElement} sidebar - The sidebar element.
 */
export function resize(e, treeViewer, journalViewer, sidebar) {
    let sidebarWidth = sidebar.offsetWidth; // INEFFICIENT? (Accounts for window-width changing)
    const newWidth = e.clientX - sidebarWidth; // Subtract sidebar width from calculation
    const windowWidth = window.innerWidth;
    const newWidthPercentage = (newWidth / windowWidth) * 100; // Width of the screen that the tree-view should take up

    // Limits the width of the tree-view during resizing
    if (newWidthPercentage >= 5 && newWidthPercentage <= 85) {
        treeViewer.style.width = newWidthPercentage + '%';
        journalViewer.style.left = (newWidthPercentage + 15) + '%';
    } else if (newWidthPercentage < 5) {
        treeViewer.style.width = 5 + '%';
        journalViewer.style.left = 20 + '%';
    } else if (newWidthPercentage > 85) {
        treeViewer.style.width = 85 + '%';
        journalViewer.style.left = (85 + sidebarWidth) + '%';
    }
}

/**
 * Stops the resizing of the tree-view.
 * @function
 * @param {Function} resizeListener - The resize event listener.
 * @param {Function} stopResizeListener - The stop resize event listener.
 */
export function stopResize(resizeListener, stopResizeListener) {
    document.removeEventListener('mousemove', resizeListener); // Calculates where the bar should be every time the mouse moves while the bar is clicked down
    document.removeEventListener('mouseup', stopResizeListener);
    document.body.style.userSelect = ''; // Allow text to be selected again when resizing ends
}

/**
 * Collapses the tree-view to a width of 0%.
 * @function
 * @param {HTMLElement} treeViewer - The tree view element.
 * @param {HTMLElement} journalViewer - The journal view element.
 * @param {HTMLElement} collapseButton - The collapse button element.
 * @param {HTMLElement} expandButton - The expand button element.
 */
export function collapseTreeView(treeViewer, journalViewer, collapseButton, expandButton) {
    treeViewer.style.width = '0%'; // Change width to 0% when collapsed
    journalViewer.style.left = '15%'; // Makes the journal viewer take up the space the tree view was using
    treeViewer.classList.add('collapsed'); // Marks the treeViewer as collapsed
    collapseButton.style.display = 'none'; // Hides the collapse button (<<)
    expandButton.style.display = 'block'; // Shows the expand button (>>)
}

/**
 * Expands the tree-view to its default width of 15%.
 * @function
 * @param {HTMLElement} treeViewer - The tree view element.
 * @param {HTMLElement} journalViewer - The journal view element.
 * @param {HTMLElement} collapseButton - The collapse button element.
 * @param {HTMLElement} expandButton - The expand button element.
 */
export function expandTreeView(treeViewer, journalViewer, collapseButton, expandButton) {
    treeViewer.style.width = '15%'; // Makes the treeViewer take up its default (15%) portion of the window
    journalViewer.style.left = (30) + '%'; // Makes the journal viewer change its width accordingly
    treeViewer.classList.remove('collapsed'); // Unmarks the treeViewer as collapsed
    collapseButton.style.display = 'block'; // Shows the collapse button (<<)
    expandButton.style.display = 'none'; // Hides the expand button (>>)
}

/**
 * Splits a journal path into an array of its components.
 * @function
 * @param {string} path - The journal path.
 * @returns {string[]} An array of path components.
 */
export function splitPath(path) {
    return path.split('/');
}

/**
 * Builds a tree structure from an array of paths.
 * @function
 * @param {string[]} paths - An array of journal paths.
 * @returns {Object} A tree structure representing the paths.
 */
export function buildTree(paths) {
    const tree = {};

    paths.forEach(path => {
        const parts = splitPath(path);
        let current = tree;

        parts.forEach(part => {
            if (!current[part]) {
                current[part] = { name: part, children: {} };
            }
            current = current[part].children;
        });
    });

    return tree;
}

/**
 * Converts a tree structure into an array.
 * @function
 * @param {Object} tree - The tree structure.
 * @returns {Object[]} An array representation of the tree.
 */
export function convertTreeToArray(tree) {
    function traverse(node) {
        const children = Object.values(node.children).map(traverse);
        return {
            name: node.name,
            children: children.length ? children : undefined
        };
    }
    return Object.values(tree).map(traverse);
}

/**
 * Hides the display of all files inside the folder.
 * @function
 * @param {HTMLElement} folder - The folder element.
 */
export function closeFolder(folder) {
    for (let i = 1; i < folder.children.length; i++)
        folder.children[i].classList.add("parent-folder-closed");
}

/**
 * Shows the display of all files inside the folder.
 * @function
 * @param {HTMLElement} folder - The folder element.
 */
export function openFolder(folder) {
    for (let i = 1; i < folder.children.length; i++)
        folder.children[i].classList.remove("parent-folder-closed");
}

/**
 * Sets the journal viewer to display the journal with the given path.
 * @function
 * @param {string} path - The path of the journal to display.
 */
export function setJournalViewer(path) {
    document.querySelector('journal-editor').path = path;
}

/**
 * Recursively loads all files into the HTML as buttons in the tree-view.
 * @function
 * @param {Object[]} parentChildren - An array of child elements of the parent path.
 * @param {HTMLElement} parentElement - The parent element to append the buttons to.
 * @param {string} treePath - The current path in the tree.
 * @param {HTMLElement} journalViewer - The journal view element.
 */
export function populateButtons(parentChildren, parentElement, treePath, journalViewer) {
    for (let i = 0; i < parentChildren.length; i++) { // For each direct child of the parent path
        const fileDiv = document.createElement("div"); // Container for the button. Path children are appended to this
        const fileButton = document.createElement("button"); // Button for the folder/journal
        fileDiv.classList.add("tree-element"); // tree-element class for CSS
        fileButton.id = treePath + "/" + parentChildren[i].name; // Makes the ID of each button element match the path in the database
        if (treePath !== "tree") // IF THIS FILE IS NOT AT THE TOPMOST LAYER
            fileDiv.classList.add("parent-folder-closed"); // Make this element hidden initially
        if (parentChildren[i].children) { // If the path has children, it is a folder
            fileButton.innerHTML = `${"+ " + `<img src="public/icons/journal/folder.svg" alt="Folder"/> ` + parentChildren[i].name}`; // + indicates a closed folder
            fileDiv.classList.add("folder"); // Folders are put into the folder class for CSS

            // WHEN THIS BUTTON IS CLICKED
            fileButton.addEventListener('click', () => {
                if (fileButton.innerHTML[0] === '+') { // If the folder is CURRENTLY CLOSED, then open it
                    fileButton.innerHTML = '-' + fileButton.innerHTML.slice(1); // Changes + to - (Folder opened)
                    openFolder(fileDiv);
                } else if (fileButton.innerHTML[0] === '-') { // If the folder is CURRENTLY OPEN, then close it
                    fileButton.innerHTML = '+' + fileButton.innerHTML.slice(1); // Changes - to + (Folder closed)
                    closeFolder(fileDiv);
                }
            });
        } else { // If the path has no children, the file is a journal not a folder.
            fileButton.innerHTML = `${`<img src="public/icons/journal/text.svg" alt="file"/> ` + parentChildren[i].name}`; // Distinctly marks journal buttons (Probably will change later)

            fileButton.classList.add("journal-button"); // Marks journal buttons as journal-button for CSS
            fileButton.addEventListener('click', () => { // When a JOURNAL button is clicked
                            //Clear the .selected class of all elements
                let selectedOnTree = document.querySelectorAll('.selected');
                selectedOnTree.forEach((element) => {
                    element.classList.remove('selected');
                });
                fileDiv.classList.add("selected"); // Marks the selected journal as selected for CSS

                setJournalViewer(fileButton.id.slice(5)); // Sets the journal viewer to display the journal with the corresponding path
            });
        }

        // Adds the elements into the HTML dynamically
        fileDiv.appendChild(fileButton);
        parentElement.appendChild(fileDiv);

        if (parentChildren[i].children) // Checks if this path has children
            populateButtons(parentChildren[i].children, fileDiv, treePath + "/" + parentChildren[i].name, journalViewer); // Recursively creates buttons for children files
    }
}
