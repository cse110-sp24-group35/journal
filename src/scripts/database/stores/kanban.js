import { persistentAtom } from '@nanostores/persistent';

export const statuses = persistentAtom("kanban-statuses", [], {
    encode: JSON.stringify,
    decode: JSON.parse
});