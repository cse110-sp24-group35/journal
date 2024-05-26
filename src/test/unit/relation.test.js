import { expect } from 'chai';
import { tasks, createTask } from '../../scripts/database/stores/task';
import { journals, createJournal } from '../../scripts/database/stores/journal';
import { taskJournalMappings, linkTaskToJournal, unlinkTaskFromJournal, getJournalsForTask, getTasksForJournal } from '../../scripts/database/stores/relation';

describe("Task-Journal Mapping", () => {
    beforeEach(() => {
        tasks.set([]);
        journals.set([]);
        taskJournalMappings.set([]);
    });

    it("Link task to journal", () => {
        createTask("1", "Sample Task", "This is a sample task", "High", "PLANNED", Date.now() + 1000 * 60 * 60);
        createJournal("Sample Journal", "journal-1", "Journal Content", ["tag1", "tag2"]);

        linkTaskToJournal("1", "journal-1");

        const mappings = taskJournalMappings.get();
        expect(mappings.length).eq(1);
        expect(mappings[0]).to.deep.equal({ taskId: "1", journalId: "journal-1" });
    });

    it("Link non-existing task to journal should throw error", () => {
        createJournal("Sample Journal", "journal-1", "Journal Content", ["tag1", "tag2"]);

        expect(() => linkTaskToJournal("999", "journal-1")).to.throw(`Task with ID 999 does not exist!`);
    });

    it("Link task to non-existing journal should throw error", () => {
        createTask("1", "Sample Task", "This is a sample task", "High", "PLANNED", Date.now() + 1000 * 60 * 60);

        expect(() => linkTaskToJournal("1", "journal-999")).to.throw(`Journal with ID journal-999 does not exist!`);
    });

    it("Unlink task from journal", () => {
        createTask("1", "Sample Task", "This is a sample task", "High", "PLANNED", Date.now() + 1000 * 60 * 60);
        createJournal("Sample Journal", "journal-1", "Journal Content", ["tag1", "tag2"]);

        linkTaskToJournal("1", "journal-1");
        expect(taskJournalMappings.get().length).eq(1);

        const result = unlinkTaskFromJournal("1", "journal-1");
        expect(result).to.eq(true);
        expect(taskJournalMappings.get().length).eq(0);
    });

    it("Unlink non-existing mapping should return false", () => {
        createTask("1", "Sample Task", "This is a sample task", "High", "PLANNED", Date.now() + 1000 * 60 * 60);
        createJournal("Sample Journal", "journal-1", "Journal Content", ["tag1", "tag2"]);

        const result = unlinkTaskFromJournal("1", "journal-1");
        expect(result).to.eq(false);
    });

    it("Get journals for a task", () => {
        createTask("1", "Sample Task", "This is a sample task", "High", "PLANNED", Date.now() + 1000 * 60 * 60);
        createJournal("Sample Journal", "journal-1", "Journal Content", ["tag1", "tag2"]);
        linkTaskToJournal("1", "journal-1");

        const journals = getJournalsForTask("1");
        expect(journals.length).eq(1);
        expect(journals[0].title).eq("Sample Journal");
        expect(journals[0].path).eq("journal-1");
    });

    it("Get tasks for a journal", () => {
        createTask("1", "Sample Task", "This is a sample task", "High", "PLANNED", Date.now() + 1000 * 60 * 60);
        createJournal("Sample Journal", "journal-1", "Journal Content", ["tag1", "tag2"]);
        linkTaskToJournal("1", "journal-1");

        const tasks = getTasksForJournal("journal-1");
        expect(tasks.length).eq(1);
        expect(tasks[0].id).eq("1");
        expect(tasks[0].title).eq("Sample Task");
    });

    it("Get journals for a task with no links", () => {
        createTask("1", "Sample Task", "This is a sample task", "High", "PLANNED", Date.now() + 1000 * 60 * 60);

        const journals = getJournalsForTask("1");
        expect(journals.length).eq(0);
    });

    it("Get tasks for a journal with no links", () => {
        createJournal("Sample Journal", "journal-1", "Journal Content", ["tag1", "tag2"]);

        const tasks = getTasksForJournal("journal-1");
        expect(tasks.length).eq(0);
    });
});
