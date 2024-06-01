import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import { expect } from 'chai';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import assert from 'assert';

describe("Overview Page", () => {
    let browser;
    let page;
    let server;

    const fastify = new Fastify();

    beforeAll(async () => {
        fastify.register(staticPlugin, {
            root: path.join(__dirname, "../../"),
            prefix: "/",
        });

        server = fastify;
        await server.listen({
            port: 4321
        });

        browser = await puppeteer.launch({
            headless: true,
            slowMo: 125
        });
        page = await browser.newPage();
        await page.goto("http://localhost:4321/index.html");
    }, 30000);

    afterAll(async () => {
        await browser.close();
        await server.close();
    });

    it("Should initialize with no tasks", async () => {
        const tasks = await page.$$('task-component');
        expect(tasks.length).to.equal(0);
    });

    it("Should create a task", async () => {
        const newTask = {
            id: "1",
            title: "Complete the project report",
            description: "Finish the final report for the project and submit it.",
            priority: "High",
            status: "ONGOING",
            createdAt: Date.now(),
            dueAt: Date.now() + 1000 * 60 * 60
        };

        await page.evaluate((newTask) => {
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            tasks.push(newTask);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            document.querySelector('task-list').update({ get: () => tasks });
        }, newTask);

        const tasks = await page.evaluate(() => {
            const taskList = document.querySelector('task-list');
            const shadowRoot = taskList.shadowRoot;
            return shadowRoot.querySelectorAll('task-component');
        });

        expect(Object.values(tasks).length).to.equal(1);

        const firstTaskDescription = await page.evaluate(() => {
            const taskList = document.querySelector('task-list');
            const shadowRoot = taskList.shadowRoot;
            const taskComponent = shadowRoot.querySelector('task-component');
            return taskComponent.shadowRoot.querySelector('span').textContent;
        });
        expect(firstTaskDescription).to.equal(newTask.description);
    });

    it("Should mark task as completed when checkbox is checked", async () => {
        const checkbox = await page.evaluateHandle(() => {
            const taskList = document.querySelector('task-list');
            const shadowRoot = taskList.shadowRoot;
            const taskComponent = shadowRoot.querySelector('task-component');
            return taskComponent.shadowRoot.querySelector('input');
        });

        await checkbox.click();

        const taskClass = await page.evaluate(() => {
            const taskList = document.querySelector('task-list');
            const shadowRoot = taskList.shadowRoot;
            const taskComponent = shadowRoot.querySelector('task-component');
            return taskComponent.shadowRoot.querySelector('.task').classList.contains('completed');
        });
        expect(taskClass).to.be.true;

        const taskStatus = await page.evaluate(() => {
            const taskStore = JSON.parse(localStorage.getItem('tasks'));
            return taskStore.find(task => task.id === '1').status;
        });
        expect(taskStatus).to.equal('COMPLETED');
    });

    it("Should unmark task as completed when checkbox is unchecked", async () => {
        const checkbox = await page.evaluateHandle(() => {
            const taskList = document.querySelector('task-list');
            const shadowRoot = taskList.shadowRoot;
            const taskComponent = shadowRoot.querySelector('task-component');
            return taskComponent.shadowRoot.querySelector('input');
        });

        await checkbox.click();

        const taskClass = await page.evaluate(() => {
            const taskList = document.querySelector('task-list');
            const shadowRoot = taskList.shadowRoot;
            const taskComponent = shadowRoot.querySelector('task-component');
            return taskComponent.shadowRoot.querySelector('.task').classList.contains('completed');
        });
        expect(taskClass).to.be.false;

        const taskStatus = await page.evaluate(() => {
            const taskStore = JSON.parse(localStorage.getItem('tasks'));
            return taskStore.find(task => task.id === '1').status;
        });
        expect(taskStatus).to.equal('ONGOING');
    });
});
