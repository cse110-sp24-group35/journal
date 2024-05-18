import { persistentAtom } from '@nanostores/persistent';

export const journals = persistentAtom("journals", [], {
    encode: JSON.stringify,
    decode: JSON.parse
});