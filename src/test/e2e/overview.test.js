import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import { expect } from 'chai';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
            slowMo: 125,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();
        await page.goto("http://localhost:4321/index.html");
    }, 30000);

    afterAll(async () => {
        await browser.close();
        await server.close();
    });

    it("Should display the correct number of upcoming tasks", async () => {
        const newTask = {
            id: "2",
            day: "1",
            number: 2,
            tasks: ["cse110", "ece45"]
        };

        await page.evaluate((newTask) => {
            const tasks = JSON.parse(localStorage.getItem('upcoming-tasks') || '[]');
            tasks.push(newTask);
            localStorage.setItem('upcoming-tasks', JSON.stringify(tasks));
            const upcomingTaskList = document.querySelector('upcoming-task-list');
            if (upcomingTaskList && typeof upcomingTaskList.update === 'function') {
                upcomingTaskList.update({ get: () => tasks });
            } else {
                console.error('update method not found on upcomingTaskList');
            }
        }, newTask);

        const taskText = await page.evaluate(() => {
            const taskComponent = document.querySelector('upcoming-task-component[data-id="2"]');
            const shadowRoot = taskComponent ? taskComponent.shadowRoot : null;
            return shadowRoot ? shadowRoot.querySelector('.number').textContent : '';
        });

        expect(taskText).to.equal('2 Upcoming Tasks');
    });

    it("Should open and display the popup with task details when clicked", async () => {
        await page.evaluate(() => {
            const taskComponent = document.querySelector('upcoming-task-component[data-id="2"]');
            const shadowRoot = taskComponent ? taskComponent.shadowRoot : null;
            if (shadowRoot) {
                shadowRoot.querySelector('.task').click();
            }
        });

        const isVisible = await page.evaluate(() => {
            const taskComponent = document.querySelector('upcoming-task-component[data-id="2"]');
            const shadowRoot = taskComponent ? taskComponent.shadowRoot : null;
            return shadowRoot ? shadowRoot.querySelector('.popup').classList.contains('visible') : false;
        });
        expect(isVisible).to.be.true;

        const taskDetails = await page.evaluate(() => {
            const taskComponent = document.querySelector('upcoming-task-component[data-id="2"]');
            const shadowRoot = taskComponent ? taskComponent.shadowRoot : null;
            return shadowRoot ? Array.from(shadowRoot.querySelectorAll('.task-list li')).map(li => li.textContent) : [];
        });

        expect(taskDetails).to.deep.equal(["cse110", "ece45"]);
    });

    it("Should close the popup when the close button is clicked", async () => {
        await page.evaluate(() => {
            const taskComponent = document.querySelector('upcoming-task-component[data-id="2"]');
            const shadowRoot = taskComponent ? taskComponent.shadowRoot : null;
            if (shadowRoot) {
                shadowRoot.querySelector('.popup').classList.remove('visible');
            }
        });

        const isVisible = await page.evaluate(() => {
            const taskComponent = document.querySelector('upcoming-task-component[data-id="2"]');
            const shadowRoot = taskComponent ? taskComponent.shadowRoot : null;
            return !(shadowRoot ? shadowRoot.querySelector('.popup').classList.contains('visible') : false);
        });
        expect(isVisible).to.be.false;
    });
});
