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

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
        unselectAllDays();
    }
});
export function initializeTask() {
    tasks.set([]);
    createTask("1", "Sample Task", "This is a sample task", "High", "PLANNED", Date.now() + 1000 * 32 * 60);
    createTask("2", "Sample 2", "This is a sample task", "High", "PLANNED", Date.now() + 2000 * 60 * 60);
    createTask("3", "Sample 3", "This is a sample task", "High", "PLANNED", Date.now() + 700000 * 57 * 60);
    createTask("4", "Sample 3", "This is a sample task", "High", "PLANNED", Date.now() + -100000 * 60 * 60);
    createTask("5", "Sample 5", "This is a sample task", "High", "PLANNED", Date.now() + 2000 * 57 * 60);
    createTask("6", "Sample 6", "This is a sample task", "High", "PLANNED", Date.now() + 3000 * 57 * 60);
    createTask("7", "Sample 7", "This is a sample task", "High", "PLANNED", Date.now() + 2000 * 57 * 60);
    createTask("8", "Sample 8", "This is a sample task", "High", "PLANNED", Date.now() + 3000 * 57 * 60);
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

export function unselectAllDays() {
    const selectedDays = document.querySelectorAll('.selected-day');
    selectedDays.forEach(day => {
        day.remove();
    });

}

export function addTasksToDay(dayDiv, year, month, day, allTasks) {
    const dayName = new Date(year, month, day).toLocaleDateString('en-US', { weekday: 'long' });
    const dayNameP = document.createElement('p');
    dayNameP.classList.add('expanded-day', 'day-number');
    dayNameP.textContent = dayName;
    dayDiv.appendChild(dayNameP);

    const dayNumber = document.createElement('div');
    dayNumber.classList.add('day-number');
    dayNumber.textContent = day;
    dayDiv.appendChild(dayNumber);

    const addTaskButton = document.createElement('button');
    addTaskButton.classList.add('add-task-button', 'expanded-day');
    addTaskButton.innerHTML = 'Create New Task';
    dayDiv.appendChild(addTaskButton);

    const taskList = document.createElement('ul');
    taskList.classList.add('task-list');

    const calendarContainer = document.querySelector('.calendar-container');

    const date = new Date(year, month, day).setHours(0, 0, 0, 0);

    let appendedTasks = 0;
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
            if(appendedTasks >= 3) {
                taskItem.classList.add('expanded-day');
            } 
            taskList.appendChild(taskItem);
            appendedTasks++;
        }
    });

    if(appendedTasks > 3) {
        const moreText = document.createElement('p');
        moreText.innerHTML = `+${appendedTasks - 3} more`;
        moreText.classList.add('shrunk-day', 'more-text');
        taskList.appendChild(moreText);
    }

    //Creates the expanded day view upon clicking a day
    if(!dayDiv.classList.contains('selected-day')) { //Prevents reselecting a selected day
        dayDiv.addEventListener('click', () => {
            unselectAllDays();
            const dayDivClone = dayDiv.cloneNode(true);
            dayDivClone.classList.add('selected-day');
            dayDivClone.classList.remove('calendar-day', 'previous-month', 'next-month');
            dayDivClone.innerHTML = '';
            addTasksToDay(dayDivClone, year, month, day, allTasks);
            const dayDivRect = dayDiv.getBoundingClientRect();
            dayDivClone.style.left = `${dayDivRect.left}px`;
            dayDivClone.style.top = `${dayDivRect.top}px`;
            dayDivClone.addEventListener('mouseleave', () => {
                dayDivClone.remove();
            });
            calendarContainer.appendChild(dayDivClone);
            const dayDivCloneRect = dayDivClone.getBoundingClientRect();
            dayDivClone.style.left = `${dayDivRect.left - (dayDivCloneRect.width - dayDivRect.width)/2}px`;
            dayDivClone.style.top = `${dayDivRect.top - (dayDivCloneRect.height - dayDivRect.height)/2}px`;
            adjustPosition(dayDivClone);
        });
    }




    dayDiv.appendChild(taskList);
}

function adjustPosition(day) {
    const rect = day.getBoundingClientRect();
    let offsetX = 0, offsetY = 0;
  
    const leftBoundary = window.innerWidth * 0.15;
  
    if (rect.left < leftBoundary) offsetX = leftBoundary - rect.left;
    if (rect.top < 0) offsetY = -rect.top;
    if (rect.right > window.innerWidth) offsetX = window.innerWidth - rect.right;
    if (rect.bottom > window.innerHeight) offsetY = window.innerHeight - rect.bottom;

    let newLeft = rect.left + offsetX;
    let newTop = rect.top + offsetY;
  
    day.style.left = `${newLeft}px`;
    day.style.top = `${newTop}px`;
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
