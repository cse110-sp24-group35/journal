import { persistentAtom } from '@nanostores/persistent';

/**
 * @typedef Task
 * @type {object}
 * @property {string} id - The task id
 * @property {string} title - The task title
 * @property {string} description - The task description
 * @property {string} priority - The task priority
 * @property {string} status - Task status, can be one of "PLANNED", "ONGOING", "COMPLETED", "ABANDONED"
 * @property {number} createdAt - The timestamp when task has been created
 * @property {number} dueAt - The timestamp when a task is "due"
 */

/**
 * The global variable that stores all tasks
 * @type {WritableAtom<Task[]>}
 */
export const tasks = persistentAtom("tasks", [], {
    encode: JSON.stringify,
    decode: JSON.parse
});

/**
 * Gets a task by its ID (or undefined if task doesn't exist)
 * @param {string} id - The task ID
 * @returns {Task | undefined} - The task object or undefined if there is no such task with given ID
 */
export function getTask(id) {
    for (let task of tasks.get()) {
        if (task.id === id) return task;
    }
    return undefined;
}

/**
 * Removes a task by its ID
 * @param {string} id - The task ID
 * @returns {boolean} - Whether the task has been deleted successfully or not (true / false)
 */
export function deleteTask(id) {
    const before = tasks.get();

    const removed = tasks.get().filter(task => {
        return task.id !== id;
    });

    if (removed.length === before.length) return false;

    tasks.set([
        ...removed
    ]);

    return true;
}

/**
 * Creates a task with the given details
 * @param {string} id - The task ID
 * @param {string} title - The task title
 * @param {string} description - The task description
 * @param {string} priority - The task priority
 * @param {string} status - Task status, can be one of "PLANNED", "ONGOING", "COMPLETED", "ABANDONED"
 * @param {number} dueAt - The timestamp when a task is "due"
 * @throws {Error} - When there is already a task with the specified ID
 */
export function createTask(id, title, description, priority, status, dueAt) {
    if (getTask(id)) throw new Error(`Task with ID ${id} already exists!`);

    const task = {
        id,
        title,
        description,
        priority,
        status,
        createdAt: Date.now(),
        dueAt
    };

    tasks.set([
        ...tasks.get(),
        task
    ]);
}