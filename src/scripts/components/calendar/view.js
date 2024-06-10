import { tasks } from "../../database/stores/task.js";

tasks.listen(() => renderCalendar());

let currentDate = new Date(); // The current date being displayed on the calendar
let monthYear;
let calendarGrid;
let prevMonthBtn;
let nextMonthBtn;

document.addEventListener('DOMContentLoaded', () => {
    monthYear = document.getElementById('month-year');
    calendarGrid = document.getElementById('calendar-grid');
    prevMonthBtn = document.getElementById('prev-month');
    nextMonthBtn = document.getElementById('next-month');

    renderCalendar();
    addMonthNavigationListeners();
});

// Adds event listener to close the selected day when the escape key is pressed
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
        unselectAllDays();
    }
});

            
// Adds event listener to close the selected day when the user clicks outside of the selected day
let primedToDeselect = false;
document.addEventListener('click', function(event) {
    const modal = document.querySelector('task-modal');
    const taskModal = modal.shadowRoot.getElementById('taskModal');
    //alert(taskModal.style.display);
    if (!taskModal.style.display || taskModal.style.display == 'none') {
        const selectedDay = document.querySelector('.selected-day');
        if(primedToDeselect) {
            if (selectedDay && !selectedDay.contains(event.target)) {
                primedToDeselect = false;
                unselectAllDays();
            }
        }
        else {
            primedToDeselect = true;
        }
    }
    else {
        primedToDeselect = false;
    }
});

/**
 * Renders the calendar for the current month.
 * This function populates the calendar grid with days from the current month,
 * as well as relevant tasks for each day.
 */
export function renderCalendar() {
    calendarGrid.innerHTML = ''; //CLEARS the calendar grid
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const lastDayOfWeek = new Date(year, month + 1, 0).getDay();

    //Gets all tasks and sorts them by due date
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

    // Fill in the next month's days (Until the row is complete)
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day', 'next-month');
        addTasksToDay(dayDiv, year, month + 1, i, allTasks);
        calendarGrid.appendChild(dayDiv);
    }
}

/**
 * Unselects all currently selected days in the calendar.
 * This function removes the 'selected-day' class from all days.
 */
export function unselectAllDays() {
    const selectedDays = document.querySelectorAll('.selected-day');
    selectedDays.forEach(day => {
        day.remove();
    });
}

/**
 * Adds tasks to a specific day in the calendar.
 * 
 * @param {HTMLElement} dayDiv - The div element representing the day.
 * @param {number} year - The year of the day.
 * @param {number} month - The month of the day (0-indexed).
 * @param {number} day - The day of the month.
 * @param {Array<Object>} allTasks - The list of all tasks.
 */
export function addTasksToDay(dayDiv, year, month, day, allTasks) {
    const isSelected = (dayDiv.classList.contains('selected-day') || dayDiv.classList.contains('hovered-day')); // Checks if the day is selected (expanded)

    // If the day is selected, show the day's name on top of the number
    if (isSelected) {
        const dayName = new Date(year, month, day).toLocaleDateString('en-US', { weekday: 'long' });
        const dayNameP = document.createElement('p');
        dayNameP.classList.add('day-number');
        dayNameP.textContent = dayName;
        dayDiv.appendChild(dayNameP);
    }

    // Create the day number
    const dayNumber = document.createElement('div');
    dayNumber.classList.add('day-number');
    dayNumber.textContent = day;
    dayDiv.appendChild(dayNumber);

    // Create the task list
    const taskList = document.createElement('ul');
    taskList.classList.add('task-list');

    const date = new Date(year, month, day).setHours(0, 0, 0, 0);

    let appendedTasks = 0; // Counter for how many tasks have been added to this day's task list
    allTasks.forEach(task => {  // Iterates through all tasks to find tasks that are due on this day 
        const taskDueDate = new Date(task.dueAt).setHours(0, 0, 0, 0);

        //If the task is due on the same day as the current day, add it to the task list for that day's square
        if (taskDueDate === date) {
            const taskItem = document.createElement('button');
            if (!isSelected) //If the element being generated is being generated because the user clicked on a day to see more details
                taskItem.classList.add('day-task-item');
            else
                taskItem.classList.add('expanded-day-task-item');

            // Convert task.dueAt to a Date object and format the time
            const taskDueTime = new Date(task.dueAt);
            const formattedTime = taskDueTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            // Alert w/ task info. REPLACE WITH TASK POP-UP MODAL
            taskItem.addEventListener('click', () => {
                //alert(`Task: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nStatus: ${task.status}\nDue At: ${formattedTime}`); // Replace with modal
                const taskModal = document.querySelector('task-modal');
                taskModal.openModal(task);
            });

            // Set the button text content to the formatted time and task title
            taskItem.textContent = `${formattedTime} - ${task.title}`;
            if (appendedTasks < 3 || isSelected) { //Prevents more than 3 tasks from being shown in the non-expanded view
                if(task.status == "COMPLETED")
                    taskItem.style.textDecoration = "line-through";
                taskList.appendChild(taskItem);
            }

            appendedTasks++;
        }
    });

    // If there are more than 3 tasks, add a +more text (in the non-expanded view)
    if (appendedTasks > 3 && !isSelected) {
        const moreText = document.createElement('p');
        moreText.innerHTML = `+${appendedTasks - 3} more`;
        moreText.classList.add('more-text');
        taskList.appendChild(moreText);
    }

    // Creates the expanded day view upon clicking a day
    if (!isSelected) { // Prevents reselecting a selected day
        dayDiv.addEventListener('click', () => {
            primedToDeselect = false;
            unselectAllDays(); 

            hoverOrSelectDay(false,dayDiv, year, month, day, allTasks);
        });

        dayDiv.addEventListener('mouseenter', () => {
            hoverOrSelectDay(true,dayDiv, year, month, day, allTasks);
        });

        dayDiv.addEventListener('mouseleave', () => {
            const hoveredDays = document.querySelectorAll('.hovered-day');
            for (let i = 0; i < hoveredDays.length; i++) {
                hoveredDays[i].remove();
            }
        });
    }

    dayDiv.appendChild(taskList);
}

/**
 * Handles creating an expanded view when hovering over or selecting a day.
 * 
 * @param {boolean} hover - Whether the day is being hovered over.
 * @param {HTMLElement} dayDiv - The div element representing the day.
 * @param {number} year - The year of the day.
 * @param {number} month - The month of the day (0-indexed).
 * @param {number} day - The day of the month.
 * @param {Array<Object>} allTasks - The list of all tasks.
 */
export function hoverOrSelectDay(hover,dayDiv, year, month, day, allTasks) {
    const calendarContainer = document.querySelector('.calendar-container'); // Gets the calendar container

    // Creates a clone of the dayDiv and adds it to the calendar container
    const dayDivClone = dayDiv.cloneNode(true);
    if(hover)
        dayDivClone.classList.add('hovered-day');
    else
        dayDivClone.classList.add('selected-day');
    dayDivClone.classList.remove('calendar-day', 'previous-month', 'next-month');
    dayDivClone.innerHTML = '';
    addTasksToDay(dayDivClone, year, month, day, allTasks);

    // Makes sure that the positioning of the expanded day view is initially correct
    const dayDivRect = dayDiv.getBoundingClientRect();
    dayDivClone.style.left = `${dayDivRect.left}px`;
    dayDivClone.style.top = `${dayDivRect.top}px`;
    calendarContainer.appendChild(dayDivClone);

    // Adjusts the position of the expanded day view to be centered on the day and within the window
    const dayDivCloneRect = dayDivClone.getBoundingClientRect();
    dayDivClone.style.left = `${dayDivRect.left - (dayDivCloneRect.width - dayDivRect.width) / 2}px`;
    dayDivClone.style.top = `${dayDivRect.top - (dayDivCloneRect.height - dayDivRect.height) / 2}px`;
    adjustPosition(dayDivClone);
}

/**
 * Adjusts the position of the expanded day view to fit within the window.
 * 
 * @param {HTMLElement} day - The day element to adjust the position of.
 */
function adjustPosition(day) {
    const rect = day.getBoundingClientRect();
    let offsetX = 0, offsetY = 0;

    const leftBoundary = window.innerWidth * 0.15;

    // If the pop-up is out of bounds in any way
    if (rect.left < leftBoundary) offsetX = leftBoundary - rect.left;
    if (rect.top < 0) offsetY = -rect.top;
    if (rect.right > window.innerWidth) offsetX = window.innerWidth - rect.right;
    if (rect.bottom > window.innerHeight) offsetY = window.innerHeight - rect.bottom;

    let newLeft = rect.left + offsetX;
    let newTop = rect.top + offsetY;

    day.style.left = `${newLeft}px`;
    day.style.top = `${newTop}px`;
}

/**
 * Adds event listeners to the buttons for navigating to the previous and next months.
 * These buttons will update the `currentDate` and re-render the calendar.
 */
export function addMonthNavigationListeners() {
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}
