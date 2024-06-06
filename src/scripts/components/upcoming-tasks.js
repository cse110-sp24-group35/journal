document.addEventListener('DOMContentLoaded', function() {
    const tasks = {
        'Sunday': { summary: 'No Upcoming Tasks', details: '' },
        'Monday': { summary: '2 Upcoming Tasks (hover to see)', details: 'Task 1, Task 2' },
        'Tuesday': { summary: '1 Upcoming Task (hover to see)', details: 'Task 1' },
        'Wednesday': { summary: '2 Upcoming Tasks (hover to see)', details: 'Task 1, Task 2' },
        'Thursday': { summary: 'No Upcoming Tasks', details: '' },
        'Friday': { summary: '2 Upcoming Tasks (hover to see)', details: 'Task 1, Task 2' },
        'Saturday': { summary: '2 Upcoming Tasks (hover to see)', details: 'Task 1, Task 2' }
    };

    const container = document.querySelector('.upcoming-tasks-container');
    const popup = document.querySelector('.task-popup');

    for (const [day, task] of Object.entries(tasks)) {
        const taskItem = document.createElement('div');
        taskItem.classList.add('upcoming-task-item');
        taskItem.textContent = `${day}: ${task.summary}`;

        if (task.details) {
            taskItem.addEventListener('mouseover', (event) => {
                popup.textContent = task.details;
                popup.style.display = 'block';
                popup.style.left = `${event.pageX + 10}px`;
                popup.style.top = `${event.pageY + 10}px`;
            });

            taskItem.addEventListener('mousemove', (event) => {
                popup.style.left = `${event.pageX + 10}px`;
                popup.style.top = `${event.pageY + 10}px`;
            });

            taskItem.addEventListener('mouseout', () => {
                popup.style.display = 'none';
            });
        }

        container.appendChild(taskItem);
    }
});
