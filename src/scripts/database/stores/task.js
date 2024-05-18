import { persistentAtom } from '@nanostores/persistent';

export const tasks = persistentAtom("journals", [], {
    encode: JSON.stringify,
    decode: JSON.parse
});