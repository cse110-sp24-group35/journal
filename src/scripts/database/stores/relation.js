import { persistentAtom } from '@nanostores/persistent';
import { getTask } from './task.js';
import { getJournal } from './journal.js';

/**
 * @typedef Mapping
 * @type {object}
 * @property {string} taskId - The ID of the task
 * @property {string} journalId - The ID of the journal
 */

/**
 * The global variable that stores all task-journal mappings
 * @type {WritableAtom<Mapping[]>}
 */
export const taskJournalMappings = persistentAtom("taskJournalMappings", [], {
    encode: JSON.stringify,
    decode: JSON.parse
});

/**
 * Links a task to a journal
 * @param {string} taskId - The ID of the task
 * @param {string} journalId - The ID of the journal
 * @throws {Error} - If either the task or journal does not exist
 */
export function linkTaskToJournal(taskId, journalId) {
    const task = getTask(taskId);
    const journal = getJournal(journalId);

    if (!task) throw new Error(`Task with ID ${taskId} does not exist!`);
    if (!journal) throw new Error(`Journal with ID ${journalId} does not exist!`);

    taskJournalMappings.set([
        ...taskJournalMappings.get(),
        { taskId, journalId }
    ]);
}

/**
 * Unlinks a task from a journal
 * @param {string} taskId - The ID of the task
 * @param {string} journalId - The ID of the journal
 * @returns {boolean} - Whether the unlink operation was successful
 */
export function unlinkTaskFromJournal(taskId, journalId) {
    const before = taskJournalMappings.get();

    const removed = before.filter(mapping => {
        return !(mapping.taskId === taskId && mapping.journalId === journalId);
    });

    if (removed.length === before.length) return false;

    taskJournalMappings.set([
        ...removed
    ]);

    return true;
}

/**
 * Gets all journals linked to a specific task
 * @param {string} taskId - The ID of the task
 * @returns {Journal[]} - An array of journals linked to the task
 */
export function getJournalsForTask(taskId) {
    const mappings = taskJournalMappings.get().filter(mapping => mapping.taskId === taskId);
    return mappings.map(mapping => getJournal(mapping.journalId)).filter(journal => journal !== undefined);
}

/**
 * Gets all tasks linked to a specific journal
 * @param {string} journalId - The ID of the journal
 * @returns {Task[]} - An array of tasks linked to the journal
 */
export function getTasksForJournal(journalId) {
    const mappings = taskJournalMappings.get().filter(mapping => mapping.journalId === journalId);
    return mappings.map(mapping => getTask(mapping.taskId)).filter(task => task !== undefined);
}