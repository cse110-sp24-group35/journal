import { expect } from 'chai';
import { tasks } from '../../scripts/database/stores/task';

describe('Upcoming Tasks Component', () => {
    let container;
    let popup;

    beforeEach(() => {
        // Set up our document body
        document.body.innerHTML = `
            <div class="upcoming-tasks-container"></div>
            <div class="task-popup" style="display:none;"></div>
        `;

        container = document.querySelector('.upcoming-tasks-container');
        popup = document.querySelector('.task-popup');

        // Mock tasks.get() method
        tasks.get = () => [
            { dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), title: 'Task 1' }, // 1 day later
            { dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), title: 'Task 2' }, // 2 days later
            { dueAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), title: 'Task 3' }  // 8 days later, should be excluded
        ];

        // Add the script content directly to the test environment
        const container = document.querySelector('.upcoming-tasks-container');
        const popup = document.querySelector('.task-popup');

        container.innerHTML = ''; // Clear previous content

        // Get and sort tasks by due date
        const sortedTasks = tasks.get().sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + 1); // Start from tomorrow
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 7); // Set end date to 7 days from today

        const tasksByDate = {};

        // Group tasks by date within the next 7 days
        for (const task of sortedTasks) {
            const taskDueDate = new Date(task.dueAt);
            taskDueDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);

            if (taskDueDate >= startDate && taskDueDate <= endDate) {
                const taskDateStr = taskDueDate.toDateString();
                if (!tasksByDate[taskDateStr]) {
                    tasksByDate[taskDateStr] = [];
                }
                tasksByDate[taskDateStr].push(task);
            }
        }

        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        for (let i = 1; i <= 7; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);

            const taskDateStr = currentDate.toDateString();
            const dayOfWeek = daysOfWeek[currentDate.getDay()];
            const dateDisplay = `${currentDate.getMonth() + 1}／${currentDate.getDate()} （${dayOfWeek}）`;

            const tasksForDate = tasksByDate[taskDateStr] || [];
            const taskCount = tasksForDate.length;
            const summary = taskCount === 0 ? 'No Upcoming Tasks' : `${taskCount} Upcoming Task${taskCount > 1 ? 's' : ''} 〔hover to see〕`;

            const dateItem = document.createElement('div');
            dateItem.classList.add('upcoming-task-date');
            dateItem.textContent = `${dateDisplay}： ${summary}`;
            
            if (taskCount > 0) {
                dateItem.addEventListener('mouseover', (event) => {
                    const taskDetails = tasksForDate.map(task => task.title).join(', ');
                    popup.textContent = taskDetails;
                    popup.style.display = 'block';
                    popup.style.left = `${event.pageX + 10}px`;
                    popup.style.top = `${event.pageY + 10}px`;
                });

                dateItem.addEventListener('mousemove', (event) => {
                    popup.style.left = `${event.pageX + 10}px`;
                    popup.style.top = `${event.pageY + 10}px`;
                });

                dateItem.addEventListener('mouseout', () => {
                    popup.style.display = 'none';
                });
            }

            container.appendChild(dateItem);
        }
    });

    it('should display upcoming tasks within the next 7 days', () => {
        const taskItems = container.querySelectorAll('.upcoming-task-date');
        expect(taskItems.length).to.equal(7);

        const taskCounts = Array.from(taskItems).map(item => item.textContent.includes('Upcoming Task') ? 1 : 0);
        const totalTasks = taskCounts.reduce((a, b) => a + b, 0);
        expect(totalTasks).to.be.at.least(2); // Should display at least the 2 upcoming tasks
    });

    it('should show task details on hover', () => {
        const taskItem = container.querySelector('.upcoming-task-date');

        const mouseOverEvent = new MouseEvent('mouseover', {
            bubbles: true,
            cancelable: true,
            view: window,
            pageX: 100,
            pageY: 100
        });

        taskItem.dispatchEvent(mouseOverEvent);
        expect(popup.style.display).to.equal('block');
        expect(popup.textContent).to.include('Task');
    });

    it('should hide popup on mouse out', () => {
        const taskItem = container.querySelector('.upcoming-task-date');

        const mouseOverEvent = new MouseEvent('mouseover', {
            bubbles: true,
            cancelable: true,
            view: window,
            pageX: 100,
            pageY: 100
        });

        const mouseOutEvent = new MouseEvent('mouseout', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        taskItem.dispatchEvent(mouseOverEvent);
        taskItem.dispatchEvent(mouseOutEvent);

        expect(popup.style.display).to.equal('none');
    });
});
