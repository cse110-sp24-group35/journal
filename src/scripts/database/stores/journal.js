import { persistentAtom } from '@nanostores/persistent';

/**
 * @typedef Journal
 * @type {object}
 * @property {string} path - The journal path / location
 * @property {string} title - The journal title
 * @property {string} content - The journal content (in raw Markdown)
 * @property {string[]} tags - The journal tag list
 * @property {number} createdAt - The timestamp when journal has been created
 * @property {number} modifiedAt - The latest timestamp when the journal has been modified in any way
 */

/**
 * The global variable that stores all journals
 * @type {WritableAtom<Journal>}
 */
export const journals = persistentAtom("journals", [], {
    encode: JSON.stringify,
    decode: JSON.parse
});

/**
 * Gets a journal by a path (or undefined if journal doesn't exist)
 * @param {string} path - The journal path / location (typically in a format of folder1/folder2/file)
 * @returns {Journal | undefined} - The journal object or undefined if there is no such journal with given path
 */
export function getJournal(path) {
    for (let journal of journals.get()) {
        if (journal.path === path) return journal;
    }

    return undefined;
}

/**
 * Removes a journal by a path
 * @param {string} path - The journal path / location (typically in a format of folder1/folder2/file)
 * @returns {boolean} - Whether the journal has been deleted successfully or not (true / false)
 */
export function deleteJournal(path) {
    const before = journals.get();

    const removed = journals.get().filter(val => {
        return val.path !== path;
    });

    if (removed.length === before.length) return false;

    journals.set([
        ...removed
    ]);

    return true;
}

/**
 * Creates a journal with given path
 * @param {string} title - The journal title
 * @param {string} path - The journal path
 * @param {string} content - The journal content
 * @param {string[]} tags - The journal tag list
 * @return {Journal} - The created journal (if any)
 * @throws {Error} - When there is already a journal with specified path
 */
export function createJournal(title, path, content, tags) {
    if (getJournal(path)) throw new Error(`Journal with path ${path} already exists!`);

    while (!!path && path.startsWith("/")) {
        path = path.slice(1);
    }

    if (!path.length) throw new Error("The path is not valid!");

    const journal = {
        title,
        path,
        content,
        tags,
        createdAt: Date.now()
    };

    journals.set([
        ...journals.get(),
        journal
    ]);

    return journal;
}


