import { expect } from 'chai';
import { formatDate } from '../../scripts/helper.js';

describe('formatDate', () => {
    it('should format the date correctly', () => {
        const date = new Date(2024, 5, 9, 14, 45, 30); // Month is 0-indexed, so 5 is June
        const formattedDate = formatDate(date);
        expect(formattedDate).to.equal('06/09/2024 14:45:30');
    });

    it('should pad single digit month, day, hours, minutes, and seconds with zeros', () => {
        const date = new Date(2024, 0, 1, 8, 5, 9); // January 1st, 08:05:09
        const formattedDate = formatDate(date);
        expect(formattedDate).to.equal('01/01/2024 08:05:09');
    });
});