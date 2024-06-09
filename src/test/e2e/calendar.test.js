import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import { expect } from 'chai';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//CALENDAR TESTS
describe("Calendar View", () => {
    let browser;
    let page;
    let server;

    const fastify = Fastify();

    beforeAll(async function () {
        fastify.register(staticPlugin, {
            root: path.join(__dirname, "../../") // Adjust the path to your project's root if needed
        });

        server = fastify;
        await server.listen({
            port: 1007
        });

        browser = await puppeteer.launch({
            headless: true,
            slowMo: 250,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        page = await browser.newPage();
        await page.goto("http://localhost:1007/calendar.html"); // Adjust the path to your HTML file
    }, 10000);

    afterAll(async () => {
        await browser.close();
        await server.close();
    });

    it('Should load in 28, 35, or 42 day squares', async () => {
        let daySquares = await page.$$('.calendar-day');
        expect(daySquares.length).to.be.oneOf([28,35,42]);
    });

    it('Clicking on a day square should create a .selected-day element', async () => {
        let selectedSquares = await page.$$('.selected-day');
        expect(selectedSquares.length).to.eq(0); //There should be no selected days initially

        const daySquare = await page.$('.calendar-day');
        await daySquare.click();

        selectedSquares = await page.$$('.selected-day');
        expect(selectedSquares.length).to.eq(1); //There should be one selected day after clicking
    });

    it('Pressing escape should get rid of the selected day', async () => {
        await page.keyboard.press('Escape');

        const selectedSquares = await page.$$('.selected-day');
        expect(selectedSquares.length).to.eq(0); //There should once again be no selected days
    });

    it('Creating a task should increase the amount of .day-task-item s', async () => {
        let dayTaskItems = await page.$$('.day-task-item');
        expect(dayTaskItems.length).to.eq(0); //There should be no tasks initially

        await page.evaluate(async () => {
            const helper = await import("./scripts/database/stores/task.js");
            helper.createTask("myID", "myTitle", "myDescription", "High", "PLANNED", Date.now());
        });

        dayTaskItems = await page.$$('.day-task-item');
        expect(dayTaskItems.length).to.eq(1); //There should be one task now
    });

    it('Creating more than 3 tasks on the same day should limit the tasks shown on that day to 3, and create a button to show more', async () => {
        let moreText = await page.$$('.more-text');
        expect(moreText.length).to.eq(0); //There should not be a button to show more tasks

        await page.evaluate(async () => {
            const helper = await import("./scripts/database/stores/task.js");
            helper.createTask("myID2", "myTitle", "myDescription", "High", "PLANNED", Date.now());
            helper.createTask("myID3", "myTitle", "myDescription", "High", "PLANNED", Date.now());
            helper.createTask("myID4", "myTitle", "myDescription", "High", "PLANNED", Date.now());
            helper.createTask("myID5", "myTitle", "myDescription", "High", "PLANNED", Date.now());
        });

        let dayTaskItems = await page.$$('.day-task-item');
        expect(dayTaskItems.length).to.eq(3); //There should only be 3 tasks shown
        
        moreText = await page.$$('.more-text');
        expect(moreText.length).to.eq(1); //There should be a button to show more tasks
    });

    it('Clicking on the navigation buttons should change the month', async () => {
        let monthYear = await page.$('#month-year');
        let monthYearTextInitial = await monthYear.evaluate(node => node.textContent);

        let navigationButton = await page.$('#next-month');
        await navigationButton.click();

        monthYear = await page.$('#month-year');
        let monthYearTextAfter = await monthYear.evaluate(node => node.textContent);

        expect(monthYearTextInitial).to.not.eq(monthYearTextAfter); //There should not be a button to show more tasks
    });

    it('Clicking on a task should open the modal with the correct task details', async () => {
        await page.evaluate(async () => {
            const helper = await import("./scripts/database/stores/task.js");
            helper.createTask("modalTestID", "Test Task", "Test Description", "High", "PLANNED", Date.now());
        });

        await page.reload();

        let taskItem = await page.$('.day-task-item');
        await taskItem.click();

        const modal = await page.$('task-modal');
        const modalStyle = await page.evaluate(modal => {
            const shadowRoot = modal.shadowRoot;
            return window.getComputedStyle(shadowRoot.querySelector('.modal')).display;
        }, modal);

        expect(modalStyle).to.eq('block'); // Modal should be visible

        const taskTitle = await page.evaluate(modal => {
            const shadowRoot = modal.shadowRoot;
            return shadowRoot.querySelector('#taskTitle').textContent;
        }, modal);

        expect(taskTitle).to.eq('Task: myTitle');

        const taskDescription = await page.evaluate(modal => {
            const shadowRoot = modal.shadowRoot;
            return shadowRoot.querySelector('#taskDescription').textContent;
        }, modal);

        expect(taskDescription).to.eq('Description: myDescription');
    });

    it('Clicking the close button on the modal should close the modal', async () => {
        await page.evaluate(async () => {
            const helper = await import("./scripts/database/stores/task.js");
            helper.createTask("modalTestID3", "Test Task 3", "Test Description 3", "High", "PLANNED", Date.now());
        });

        const taskItem = await page.$('.day-task-item');
        await taskItem.click();

        const modal = await page.$('task-modal');

        // Click the close button inside the modal's shadow DOM
        await page.evaluate(modal => {
            const shadowRoot = modal.shadowRoot;
            const closeButton = shadowRoot.querySelector('.close');
            closeButton.click();
        }, modal);

        const modalStyle = await page.evaluate(modal => {
            const shadowRoot = modal.shadowRoot;
            return window.getComputedStyle(shadowRoot.querySelector('.modal')).display;
        }, modal);

        expect(modalStyle).to.eq('none'); // Modal should be hidden
    });

    it('Clicking outside the modal should also close the modal', async () => {
        await page.evaluate(async () => {
            const helper = await import("./scripts/database/stores/task.js");
            helper.createTask("modalTestID2", "Test Task 2", "Test Description 2", "High", "PLANNED", Date.now());
        });

        let taskItem = await page.$('.day-task-item');
        await taskItem.click();

        const modal = await page.$('task-modal');

        await page.mouse.click(10, 10); // Click outside the modal

        const modalStyle = await page.evaluate(modal => {
            const shadowRoot = modal.shadowRoot;
            return window.getComputedStyle(shadowRoot.querySelector('.modal')).display;
        }, modal);

        expect(modalStyle).to.eq('none'); // Modal should be hidden
    });
});
