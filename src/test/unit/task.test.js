import { tasks, createTask, getTask, deleteTask, updateTask } from '../../scripts/database/stores/task';
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

    it("Update existing task", () => {
        createTask("1", "Sample Task", "This is a sample task", "High", "PLANNED", Date.now() + 1000 * 60 * 60);
        const updateData = {
            title: "Updated Task",
            description: "This is an updated task",
            priority: "Medium",
            status: "ONGOING",
            dueAt: Date.now() + 1000 * 60 * 120,
        };
        expect(updateTask("1", updateData)).to.eq(true);

        const task = getTask("1");
        expect(task.title).eq("Updated Task");
        expect(task.description).eq("This is an updated task");
        expect(task.priority).eq("Medium");
        expect(task.status).eq("ONGOING");
        expect(task.dueAt).to.be.a('number');
    });

    it("Update non-existing task", () => {
        const updateData = {
            title: "Non-existing Task",
            description: "This task does not exist",
            priority: "Low",
            status: "PLANNED",
            dueAt: Date.now() + 1000 * 60 * 60,
        };
        expect(updateTask("999", updateData)).to.eq(false);
    });
});