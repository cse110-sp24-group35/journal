import { expect } from 'chai';
import { getJournal } from '../../scripts/database/stores/journal.js';

// Mock createJournal function
let journalData;
const mockCreateJournal = (title, path, tags, due) => {
  journalData = { title, path, tags, due };
};
global.createJournal = mockCreateJournal;

describe('ModalJournal Logic', () => {
  it('should handle form submission and create journal data', () => {
    const mockFormData = new Map([
      ['title', 'Test Journal'],
      ['path', 'test/path'],
      ['due', '2023-12-31'],
      ['tags', 'test, journal']
    ]);
    
    const formData = {
      get: (key) => mockFormData.get(key)
    };

    const result = getJournal(formData);

    expect(result).to.deep.equal({
      title: 'Test Journal',
      path: 'test/path',
      due: '2023-12-31',
      tags: 'test, journal'
    });

    expect(journalData).to.deep.equal({
      title: 'Test Journal',
      path: 'test/path',
      due: '2023-12-31',
      tags: 'test, journal'
    });
  });
});
