import { tasks, createTask, getTask, deleteTask } from '../../scripts/database/stores/task';
import { expect } from 'chai';

describe("Task Stores", () => {
    it("Task db initialized properly and empty", () => {
        expect(tasks.get().length).eq(0);
    });

    it("Create task", () => {
        createTask("1", "Sample Task", "This is a sample task", "High", "PLANNED", Date.now() + 1000 * 60 * 60);

        const content = tasks.get();

        expect(content.length).eq(1);

        const task = content[0];
        expect(task.id).eq("1");
        expect(task.title).eq("Sample Task");
        expect(task.description).eq("This is a sample task");
        expect(task.priority).eq("High");
        expect(task.status).eq("PLANNED");
        expect(task.dueAt).to.be.a('number');
    });

    it("Create duplicate task", () => {
        expect(
            () => createTask("1", "Sample Task", "This is a sample task", "High", "PLANNED", Date.now() + 1000 * 60 * 60)
        ).to.throw();
    });

    it("Get valid task", () => {
        const task = getTask("1");

        expect(task).not.null;

        expect(task.id).eq("1");
        expect(task.title).eq("Sample Task");
        expect(task.description).eq("This is a sample task");
        expect(task.priority).eq("High");
        expect(task.status).eq("PLANNED");
        expect(task.dueAt).to.be.a('number');
    });

    it("Get invalid task", () => {
        const task = getTask("999");

        expect(task).is.undefined;
    });

    it("Delete existing task", () => {
        expect(deleteTask("1")).to.eq(true);

        expect(tasks.get().length).eq(0);
    });

    it("Delete non-existing task", () => {
        expect(deleteTask("999")).to.eq(false);
    });
});
