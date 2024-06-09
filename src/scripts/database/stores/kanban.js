import { persistentAtom } from '@nanostores/persistent';

/**
 * The global variable that stores all kanban statuses, default to ["PLANNED", "ONGOING", "COMPLETED", "ABANDONED"]
 * @type {WritableAtom<string[]>}
 */
export const statuses = persistentAtom("kanban-statuses", ["PLANNED", "ONGOING", "COMPLETED", "ABANDONED"], {
    encode: JSON.stringify,
    decode: JSON.parse
});