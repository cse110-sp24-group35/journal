import { tasks } from '../../database/stores/task.js';

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.upcoming-tasks-container');
    const popup = document.querySelector('.task-popup');

    container.innerHTML = ''; // Clear previous content

    // Convert UTC date string to local date
    function convertToLocalDate(utcDateStr) {
        const utcDate = new Date(utcDateStr);
        return new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
    }

    // Get and sort tasks by due date
    const sortedTasks = tasks.get().sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zero out the time part
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 1); // Start from tomorrow
    startDate.setHours(0, 0, 0, 0); // Zero out the time part
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7); // Set end date to 7 days from today
    endDate.setHours(23, 59, 59, 999); // Set the end of the day

    const tasksByDate = {};

    // Group tasks by date within the next 7 days
    for (const task of sortedTasks) {
        const taskDueDate = convertToLocalDate(task.dueAt);
        taskDueDate.setHours(0, 0, 0, 0); // Zero out the time part for accurate comparison

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
        currentDate.setHours(0, 0, 0, 0); // Zero out the time part

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
