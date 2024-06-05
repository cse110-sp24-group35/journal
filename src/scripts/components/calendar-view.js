import { tasks, createTask, getTask, deleteTask } from "../database/stores/task.js";

document.addEventListener('DOMContentLoaded', () => {
    const monthYear = document.getElementById('month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    initializeTask();

    let currentDate = new Date();

    renderCalendar(currentDate, monthYear, calendarGrid);
    addMonthNavigationListeners(currentDate, monthYear, calendarGrid, prevMonthBtn, nextMonthBtn);
});

export function initializeTask() {
    tasks.set([]);
    createTask("1", "Sample Task", "This is a sample task", "High", "PLANNED", Date.now() + 1000 * 32 * 60);
    createTask("2", "Sample 2", "This is a sample task", "High", "PLANNED", Date.now() + 2000 * 60 * 60);
    createTask("3", "Sample 3", "This is a sample task", "High", "PLANNED", Date.now() + 700000 * 57 * 60);
    createTask("4", "Sample 3", "This is a sample task", "High", "PLANNED", Date.now() + -100000 * 60 * 60);
}

export function renderCalendar(date, monthYear, calendarGrid) {
    calendarGrid.innerHTML = '';
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const lastDayOfWeek = new Date(year, month + 1, 0).getDay();

    const allTasks = tasks.get().slice().sort((a, b) => a.dueAt - b.dueAt);

    const prevLastDate = new Date(year, month, 0).getDate();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYear.textContent = `${monthNames[month]} ${year}`;

    // Fill in the previous month's days
    for (let i = firstDayOfWeek; i > 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day', 'previous-month');
        const dayNum = prevLastDate - i + 1;
        addTasksToDay(dayDiv, year, month - 1, dayNum, allTasks);
        calendarGrid.appendChild(dayDiv);
    }

    // Fill in the current month's days
    for (let day = 1; day <= lastDate; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        addTasksToDay(dayDiv, year, month, day, allTasks);
        calendarGrid.appendChild(dayDiv);
    }

    // Fill in the next month's days
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day', 'next-month');
        addTasksToDay(dayDiv, year, month + 1, i, allTasks);
        calendarGrid.appendChild(dayDiv);
    }
}

export function addTasksToDay(dayDiv, year, month, day, allTasks) {
    const dayNumber = document.createElement('div');
    dayNumber.classList.add('day-number');
    dayNumber.textContent = day;

    const taskList = document.createElement('ul');
    taskList.classList.add('task-list');

    const date = new Date(year, month, day).setHours(0, 0, 0, 0);

    allTasks.forEach(task => {
        const taskDueDate = new Date(task.dueAt).setHours(0, 0, 0, 0);
        if (taskDueDate === date) {
            const taskItem = document.createElement('button');
            taskItem.classList.add('day-task-item');

            // Convert task.dueAt to a Date object and format the time
            const taskDueTime = new Date(task.dueAt);
            const formattedTime = taskDueTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            // Add a click event listener to the task item to show the task popup modal
            taskItem.addEventListener('click', () => {
                alert(`Task: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nStatus: ${task.status}\nDue At: ${formattedTime}`); //Replace with modal
            });

            // Set the button text content to the formatted time and task title
            taskItem.textContent = `${formattedTime} - ${task.title}`;
            taskList.appendChild(taskItem);
        }
    });

    dayDiv.addEventListener('click', () => {
        let selectedDay = document.querySelectorAll('.selected-day');
        selectedDay.forEach((element) => {
            element.classList.remove('selected-day');
        });
        dayDiv.classList.add('selected-day');
    });

    dayDiv.appendChild(dayNumber);
    dayDiv.appendChild(taskList);
}

export function addMonthNavigationListeners(currentDate, monthYear, calendarGrid, prevMonthBtn, nextMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate, monthYear, calendarGrid);
    });
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate, monthYear, calendarGrid);
    });
}
