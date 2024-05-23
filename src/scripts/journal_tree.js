document.addEventListener('DOMContentLoaded', function() {
    const resizer = document.getElementById('resizer');
    const resizableBox = document.getElementById('resizable-box');
    const collapseButton = document.getElementById('collapse-button');
    const expandButton = document.getElementById('expand-button');
    const sidebar = document.getElementById('sidebar');

    let sidebarWidth = sidebar.offsetWidth;

    //Calls the functions for resizing the tree-view width
    resizer.addEventListener('mousedown', function(e) {
        if (!resizableBox.classList.contains('collapsed')) {
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        }
    });

    //Buttons to collapse and expand the tree view
    collapseButton.addEventListener('click', function() {
        resizableBox.style.width = '0%'; // Change width to 2% when collapsed
        resizableBox.classList.add('collapsed');
        collapseButton.style.display = 'none';
        expandButton.style.display = 'block';
    });
    expandButton.addEventListener('click', function() {
        resizableBox.style.width = '15%';
        resizableBox.classList.remove('collapsed');
        collapseButton.style.display = 'block';
        expandButton.style.display = 'none';
    });

    //Function called when dragging the resize bar on the tree-view
    function resize(e) {
        //Prevent text from being selected while mouse is held down to resize tree-view
        e.preventDefault();
        const newWidth = e.clientX - sidebarWidth; // Subtract sidebar width
        const windowWidth = window.innerWidth;
        const newWidthPercentage = (newWidth / windowWidth) * 100;

        //Limits the width of the tree-view during resizing
        if (newWidthPercentage >= 5 && newWidthPercentage <= 85) { 
            resizableBox.style.width = newWidthPercentage + '%';
        }
        //Makes it so that the bar doesn't get stuck when flicking the cursor beyond a boundary
        else if (newWidthPercentage < 5) {
            resizableBox.style.width = 5 + '%';
        }
        else if (newWidthPercentage > 85) {
            resizableBox.style.width = 85 + '%';
        }
    }

    function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        //Allow text to be selected again when resizing ends
        document.body.style.userSelect = '';
    }

    //Dummy data to test for content overflow
    const scrollableDiv = document.getElementById('content');
    for (let i = 1; i <= 100; i++) {
        let content = `Line ${i}`;
        const contentElement = document.createElement("p");
        contentElement.classList.add("treeElement");
        contentElement.innerText=content;
        scrollableDiv.appendChild(contentElement);
    }

});
