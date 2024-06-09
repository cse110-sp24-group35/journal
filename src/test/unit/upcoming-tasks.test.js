import { expect } from 'chai';
import { tasks } from '../../scripts/database/stores/task';

describe('Upcoming Tasks Logic', () => {
    beforeEach(() => {
        // Mock tasks.get() method
        tasks.get = () => [
            { dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), title: 'Task 1' }, // 1 day later
            { dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), title: 'Task 2' }, // 2 days later
            { dueAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), title: 'Task 3' }  // 8 days later, should be excluded
        ];
    });

    function getUpcomingTasks() {
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
            if (taskDueDate >= startDate && taskDueDate <= endDate) {
                const taskDateStr = taskDueDate.toDateString();
                if (!tasksByDate[taskDateStr]) {
                    tasksByDate[taskDateStr] = [];
                }
                tasksByDate[taskDateStr].push(task);
            }
        }

        const upcomingTasks = [];
        for (let i = 1; i <= 7; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);

            const taskDateStr = currentDate.toDateString();
            const tasksForDate = tasksByDate[taskDateStr] || [];
            const taskCount = tasksForDate.length;
            const summary = taskCount === 0 ? 'No Upcoming Tasks' : `${taskCount} Upcoming Task${taskCount > 1 ? 's' : ''}`;

            upcomingTasks.push({
                date: taskDateStr,
                summary,
                tasks: tasksForDate
            });
        }
        return upcomingTasks;
    }

    it('should return upcoming tasks within the next 7 days', () => {
        const upcomingTasks = getUpcomingTasks();
        expect(upcomingTasks.length).to.equal(7);

        const taskSummaries = upcomingTasks.map(item => item.summary);
        const taskCount = taskSummaries.filter(summary => summary.includes('Upcoming Task')).length;

        expect(taskCount).to.be.at.least(2); // Should include at least the 2 upcoming tasks
    });

    it('should group tasks correctly by date', () => {
        const upcomingTasks = getUpcomingTasks();

        // Check if the task summaries contain the correct task count
        expect(upcomingTasks[0].summary).to.include('1 Upcoming Task');
        expect(upcomingTasks[1].summary).to.include('1 Upcoming Task');
        expect(upcomingTasks[2].summary).to.equal('No Upcoming Tasks');
    });

    it('should not include tasks beyond the 7 day range', () => {
        const upcomingTasks = getUpcomingTasks();

        // Ensure the task 8 days later is not included
        const taskTitles = upcomingTasks.flatMap(item => item.tasks.map(task => task.title));
        expect(taskTitles).to.not.include('Task 3');
    });
});
