import { journals, createJournal, getJournal, deleteJournal } from './database/stores/journal.js';

journals.listen(() => populateTreeView());

document.addEventListener('DOMContentLoaded', function() {
    loadTreeView();
});

export function loadTreeView() {
    const resizer = document.getElementById('resizer'); // Black bar on the right of the tree-view window. Can be dragged.
    const treeViewer = document.getElementById('resizable-box'); // Tree view window container
    const journalViewer = document.getElementById('journal-view'); // Journal view (Right of tree-view)
    const collapseButton = document.getElementById('collapse-button'); // Button in the center of the resizer
    const expandButton = document.getElementById('expand-button'); // Also button in the center of the resizer
    const sidebar = document.getElementById('sidebar'); // PLACEHOLDER menu (left of tree-view)

    // Calls the functions for resizing the tree-view width
    resizer.addEventListener('mousedown', (e) => startResize(e, treeViewer, journalViewer, sidebar));
    // Buttons to collapse and expand the tree view
    collapseButton.addEventListener('click', () => collapseTreeView(treeViewer, journalViewer, collapseButton, expandButton));
    expandButton.addEventListener('click', () => expandTreeView(treeViewer, journalViewer, collapseButton, expandButton));

    //createFakeJournals();
   
    populateTreeView();
}

export function createFakeJournals() {
    journals.set([]);
    deleteJournal("hello/world");
    createJournal("Hello World", "hello/world", "Hello World", ["Hello", "World"]);
    deleteJournal("hello/planet");
    createJournal("Hello Planet", "hello/planet", "Hello Planet", ["Hello", "Planet"]);
    deleteJournal("hello/far/away/world");
    createJournal("Hello Far Away World", "hello/far/away/world", "Hello Far Away World", ["Hello", "Far", "Away", "World"]);
    deleteJournal("goodbye/world");
    createJournal("Goodbye World", "goodbye/world", "Goodbye World", ["Goodbye", "World"]);
    deleteJournal("world");
    createJournal("World", "world", "World", ["World"]);
    for (let i = 0; i < 100; i++) {
        deleteJournal("entity" + i);
        createJournal("entity " + i, "entity" + i, "entity " + i, ["entity", i]);
    }
}

// Function populates entire tree-view without any arguments.
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

// Function called when dragging the resize bar on the tree-view
export function startResize(e, treeViewer, journalViewer, sidebar) {
    e.preventDefault(); // Prevent text from being selected while mouse is held down to resize tree-view
    if (!treeViewer.classList.contains('collapsed')) { // Makes sure that you can't drag to resize while the tree view is collapsed
        const resizeListener = (event) => resize(event, treeViewer, journalViewer, sidebar);
        const stopResizeListener = () => stopResize(resizeListener, stopResizeListener);
        document.addEventListener('mousemove', resizeListener); // Calls resize to make tree-view width change according to cursor position
        document.addEventListener('mouseup', stopResizeListener); // Stops changing tree-view width according to cursor position
    }
}

// Function called to resize the tree-view
export function resize(e, treeViewer, journalViewer, sidebar) {
    let sidebarWidth = sidebar.offsetWidth; // INEFFICIENT? (Accounts for window-width changing)
    const newWidth = e.clientX - sidebarWidth; // Subtract sidebar width from calculation
    const windowWidth = window.innerWidth;
    const newWidthPercentage = (newWidth / windowWidth) * 100; // Width of the screen that the tree-view should take up

    // Limits the width of the tree-view during resizing
    if (newWidthPercentage >= 5 && newWidthPercentage <= 85) {
        treeViewer.style.width = newWidthPercentage + '%';
        journalViewer.style.left = (newWidthPercentage + 10) + '%';
    } else if (newWidthPercentage < 5) {
        treeViewer.style.width = 5 + '%';
        journalViewer.style.left = 15 + '%';
    } else if (newWidthPercentage > 85) {
        treeViewer.style.width = 85 + '%';
        journalViewer.style.left = 95 + '%';
    }
}

// Function to stop resizing
export function stopResize(resizeListener, stopResizeListener) {
    document.removeEventListener('mousemove', resizeListener); // Calculates where the bar should be every time the mouse moves while the bar is clicked down
    document.removeEventListener('mouseup', stopResizeListener);
    document.body.style.userSelect = ''; // Allow text to be selected again when resizing ends
}

// Function to collapse the tree-view
export function collapseTreeView(treeViewer, journalViewer, collapseButton, expandButton) {
    treeViewer.style.width = '0%'; // Change width to 0% when collapsed
    journalViewer.style.left = '10%'; // Makes the journal viewer take up the space the tree view was using
    treeViewer.classList.add('collapsed'); // Marks the treeViewer as collapsed
    collapseButton.style.display = 'none'; // Hides the collapse button (<<)
    expandButton.style.display = 'block'; // Shows the expand button (>>)
}

// Function to expand the tree-view
export function expandTreeView(treeViewer, journalViewer, collapseButton, expandButton) {
    treeViewer.style.width = '15%'; // Makes the treeViewer take up its default (15%) portion of the window
    journalViewer.style.left = (25) + '%'; // Makes the journal viewer change its width accordingly
    treeViewer.classList.remove('collapsed'); // Unmarks the treeViewer as collapsed
    collapseButton.style.display = 'block'; // Shows the collapse button (<<)
    expandButton.style.display = 'none'; // Hides the expand button (>>)
}

// Function to parse individual path into an array
export function splitPath(path) {
    return path.split('/');
}

// Function to build tree from path array
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

// Function to convert tree to array
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

// Function to hide the display of all files inside the folder
export function closeFolder(folder) {
    for (let i = 1; i < folder.children.length; i++)
        folder.children[i].classList.add("parent-folder-closed");
}

// Function to show the display of all files inside the folder
export function openFolder(folder) {
    for (let i = 1; i < folder.children.length; i++)
        folder.children[i].classList.remove("parent-folder-closed");
}

// Function to recursively load all files into the HTML
export function populateButtons(parentChildren, parentElement, treePath, journalViewer) {
    for (let i = 0; i < parentChildren.length; i++) { // For each direct child of the parent path
        const fileDiv = document.createElement("div"); // Container for the button. Path children are appended to this
        const fileButton = document.createElement("button"); // Button for the folder/journal
        fileDiv.classList.add("tree-element"); // tree-element class for CSS
        fileButton.id = treePath + "/" + parentChildren[i].name; // Makes the ID of each button element match the path in the database
        if (treePath !== "tree") // IF THIS FILE IS NOT AT THE TOPMOST LAYER
            fileDiv.classList.add("parent-folder-closed"); // Make this element hidden initially
        if (parentChildren[i].children) { // If the path has children, it is a folder
            fileButton.innerHTML = "+ " + parentChildren[i].name; // + indicates a closed folder
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
            fileButton.innerHTML = "JOURNAL - " + parentChildren[i].name; // Distinctly marks journal buttons (Probably will change later)

            fileButton.classList.add("journal-button"); // Marks journal buttons as journal-button for CSS
            fileButton.addEventListener('click', () => { // When a JOURNAL button is clicked
                            //Clear the .selected class of all elements
                let selectedOnTree = document.querySelectorAll('.selected');
                selectedOnTree.forEach((element) => {
                    element.classList.remove('selected');
                });
                fileDiv.classList.add("selected"); // Marks the selected journal as selected for CSS

                journalViewer.innerHTML = ""; // CLEAR whatever is displayed to the right
                const journalToLoad = getJournal(fileButton.id.slice(5)); // Load in the corresponding journal from the database

                // Temporarily just displays the title as h1
                const journalTitle = document.createElement("h1");
                journalTitle.innerHTML = journalToLoad.title;
                journalViewer.appendChild(journalTitle);
            });
        }

        // Adds the elements into the HTML dynamically
        fileDiv.appendChild(fileButton);
        parentElement.appendChild(fileDiv);

        if (parentChildren[i].children) // Checks if this path has children
            populateButtons(parentChildren[i].children, fileDiv, treePath + "/" + parentChildren[i].name, journalViewer); // Recursively creates buttons for children files
    }
}
