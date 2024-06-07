import { tasks } from '../database/stores/task.js';

document.addEventListener('DOMContentLoaded', function() {
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
        // Zero out the time part for accurate comparison
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
