import { expect } from 'chai';
import { statuses } from '../../scripts/database/stores/kanban.js';

describe("Kanban statuses", () => {
    it("Kanban statuses initialized properly", () => {
        expect(statuses.get().length).eq(4);
    });
});