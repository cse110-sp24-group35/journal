import { journals, createJournal, getJournal, deleteJournal } from '../scripts/database/stores/journal.js';

document.addEventListener('DOMContentLoaded', function() {
    const resizer = document.getElementById('resizer'); //Black bar on the right of the tree-view window. Can be dragged.
    const treeViewer = document.getElementById('resizable-box'); //Tree view window container
    const journalViewer = document.getElementById('journal-view'); // Journal view (Right of tree-view)
    const collapseButton = document.getElementById('collapse-button'); //Button in the center of the resizer
    const expandButton = document.getElementById('expand-button'); //Also button in the center of th resizer
    const sidebar = document.getElementById('sidebar'); //PLACEHOLDER menu (left of tree-view)
    let sidebarWidth = sidebar.offsetWidth; 

    //Calls the functions for resizing the tree-view width
    resizer.addEventListener('mousedown', function(e) {
        e.preventDefault(); // Prevent text from being selected while mouse is held down to resize tree-view
        if (!treeViewer.classList.contains('collapsed')) { //Makes sure that you can't drag to resize while the tree view is collapsed
            document.addEventListener('mousemove', resize); //calls resize to make tree-view width change according to cursor position
            document.addEventListener('mouseup', stopResize); //stops changing tree-view width according to cursor position
        }
    });

    //Buttons to collapse and expand the tree view
    collapseButton.addEventListener('click', function() {
        treeViewer.style.width = '0%'; // Change width to 0% when collapsed
        journalViewer.style.left = 10 + '%'; // Makes the journal viewer take up the space the tree view was using
        treeViewer.classList.add('collapsed'); //Marks the treeViewer as collapsed
        collapseButton.style.display = 'none'; //hides the collapse button (<<)
        expandButton.style.display = 'block'; //Shows the expand button (>>)
    });

    // Checks for the expand button (>>) being clicked
    expandButton.addEventListener('click', function() {
        treeViewer.style.width = '15%'; // Makes the treeViewer take up its default (15%) portion of the window 
        journalViewer.style.left = (25) + '%'; // Makes the journal viewer change its with accordingly
        treeViewer.classList.remove('collapsed'); //Unmarks the treeViewer as collapsed
        collapseButton.style.display = 'block'; // Shows the collapse button (<<)
        expandButton.style.display = 'none'; // Hides the expand button (>>)
    });

    //Function called when dragging the resize bar on the tree-view
    function resize(e) {
        sidebarWidth = sidebar.offsetWidth; //INEFFICIENT? (Accounts for window-width changing)
        const newWidth = e.clientX - sidebarWidth; // Subtract sidebar width from calculation
        const windowWidth = window.innerWidth; 
        const newWidthPercentage = (newWidth / windowWidth) * 100;

        //Limits the width of the tree-view during resizing
        if (newWidthPercentage >= 5 && newWidthPercentage <= 85) { 
            treeViewer.style.width = newWidthPercentage + '%';
            journalViewer.style.left = (newWidthPercentage + 10) + '%';
        }
        
        //Makes it so that the bar doesn't get stuck when flicking the cursor beyond a boundary
        else if (newWidthPercentage < 5) {
            treeViewer.style.width = 5 + '%';
            journalViewer.style.left = 15 + '%';
        }
        else if (newWidthPercentage > 85) {
            treeViewer.style.width = 85 + '%';
            journalViewer.style.left = 95 + '%';
        }
    }

    function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        //Allow text to be selected again when resizing ends
        document.body.style.userSelect = '';
    }

    
    const contentContainer = document.getElementById('content');
    //const insideContent = document.getElementById('inside-content');
    //Dummy data to test for content overflow
    /*
    for (let i = 1; i <= 100; i++) {
        let contenta = `Line ${i}`;
        const contentElement = document.createElement("p");
        contentElement.classList.add("treeElement");
        contentElement.innerText=contenta;
        contentContainer.appendChild(contentElement);
    }
    */

    //Get an array containing ALL paths
    let allPaths = [];
    for(let i = 0;  i < journals.get().length; i++) {
        allPaths[i] = journals.get()[i].path;
    }

    //createJournal("Hello Second World", "hello/second/world", "Hello Second World", ["Hello", "Second", "World"]);


    //GPT Tree Generator (from path array) 
    function splitPath(path) {
        return path.split('/');
    }
    
    function buildTree(paths) {
        const tree = {};
    
        paths.forEach(path => {
            const parts = splitPath(path);
            let current = tree;
    
            parts.forEach((part, index) => {
                if (!current[part]) {
                    current[part] = {
                        name: part,
                        children: {}
                    };
                }
                current = current[part].children;
            });
        });
    
        return tree;
    }
    
    function convertTreeToArray(tree) {
        function traverse(node) {
            const children = Object.values(node.children).map(traverse);
            return {
                name: node.name,
                children: children.length ? children : undefined
            };
        }
    
        return Object.values(tree).map(traverse);
    }
    
    const tree = buildTree(allPaths);
    const treeArray = convertTreeToArray(tree);
    
    //insideContent.innerHTML = (JSON.stringify(treeArray, null, 2));

    const TESTButton = document.createElement("button");
    TESTButton.innerHTML = "YEAH";

    //HIDES the display of all buttons INSIDE the folder
    function closeFolder(folder) {
        for(let i = 1; i < folder.children.length; i++)
            folder.children[i].classList.add("parentFolderClosed");
    }

    //SHOWS the display of all buttons INSIDE the folder
    function openFolder(folder) {
        for(let i = 1; i < folder.children.length; i++)
            folder.children[i].classList.remove("parentFolderClosed");
    }

    //SHOW ALL and HIDE ALL buttons
    /*
    const showAllButton = document.createElement("button");
    showAllButton.innerHTML = "Show All";
    showAllButton.addEventListener("click", function() {
        const allFolders = document.querySelectorAll("folder");
        for(let i = 0; i < allFolders.length; i++);
            openFolder(allFolders[0]);
    });
    contentContainer.appendChild(showAllButton);
    */

    function populateButtons(parentChildren, parentElement, treePath){
        for(let i = 0;  i < parentChildren.length; i++) {
            const fileDiv = document.createElement("div");
            const fileButton = document.createElement("button");
            fileDiv.classList.add("treeElement");
            fileButton.id = treePath + "/" + parentChildren[i].name;
            if(treePath != "tree")
                fileDiv.classList.add("parentFolderClosed");
            if(!!parentChildren[i].children){ //If the path has children, it is a folder
                fileButton.innerHTML = "+ " + parentChildren[i].name;
                fileDiv.classList.add("folder");
                    

                //WHEN THIS BUTTON IS CLICKED
                fileButton.addEventListener("click",function() { 
                    if(this.innerHTML[0] == '+') {//If the folder is CURRENTLY CLOSED, then open it
                        this.innerHTML = '-' + this.innerHTML.slice(1); //Changes + to - (Folder opened)
                        openFolder(fileDiv);
                    } 
                    else if(this.innerHTML[0] == '-'){ //If the folder is CURRENTLY OPEN, then close it
                        this.innerHTML = '+' + this.innerHTML.slice(1); //Changes - to + (Folder closed)
                        closeFolder(fileDiv);
                    }
                });
            }
            else { //If the path has no children, the file is a journal not a folder.
                fileButton.innerHTML = "JOURNAL - " + parentChildren[i].name;
                fileButton.classList.add("journalButton");
                fileButton.addEventListener("click",function(){
                    journalViewer.innerHTML = "";
                    const journalToLoad = getJournal(fileButton.id.slice(5))
                    const journalTitle = document.createElement("h1");
                    journalTitle.innerHTML = journalToLoad.title;
                    journalViewer.appendChild(journalTitle);
                });
            }


            //Adds the elements into the HTML dynamically
            fileDiv.appendChild(fileButton);
            parentElement.appendChild(fileDiv);

            if(!!parentChildren[i].children) //Checks if this path has children
                populateButtons(parentChildren[i].children, fileDiv, treePath + "/" + parentChildren[i].name); //Recursively creates buttons for children files
        }
    }


    populateButtons(treeArray,contentContainer, "tree"); //1 refers to the layer of the buttons

    //Makes all buttons
    /*
    const allButtons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {

        });
        button.addEventListener('up', function() {

        });
    });
    */
});
