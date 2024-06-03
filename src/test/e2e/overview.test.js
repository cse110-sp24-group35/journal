import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import assert from 'assert';

describe("MySidebar E2E Tests", () => {
    let browser;
    let page;
    let server;

    const fastify = new Fastify();

    before(async function () {
        this.timeout(10000); // Set timeout to 10 seconds for setup

        // Set up the Fastify server to serve static files
        fastify.register(staticPlugin, {
            root: path.join(__dirname, "../../public")
        });

        server = fastify;
        await server.listen({ port: 4321 });

        // Launch Puppeteer
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
        await page.goto("http://localhost:4321/index.html");
    });

    after(async () => {
        await browser.close();
        await server.close();
    });

    it('should load the overview page and highlight the overview button', async () => {
        // Check that the overview button is highlighted and disabled
        const overviewButtonClass = await page.$eval('my-sidebar >>> button:nth-of-type(1)', el => el.className);
        const overviewButtonDisabled = await page.$eval('my-sidebar >>> button:nth-of-type(1)', el => el.disabled);
        assert(overviewButtonClass.includes('active'), 'Overview button should be active');
        assert(overviewButtonDisabled, 'Overview button should be disabled');
    });

    it('should navigate to calendar page and highlight the calendar button', async () => {
        await page.click('my-sidebar >>> button:nth-of-type(2)');
        await page.waitForNavigation();

        // Check URL
        const url = await page.url();
        assert(url.endsWith('calendar.html'), 'URL should be calendar.html');

        // Check that the calendar button is highlighted and disabled
        const calendarButtonClass = await page.$eval('my-sidebar >>> button:nth-of-type(2)', el => el.className);
        const calendarButtonDisabled = await page.$eval('my-sidebar >>> button:nth-of-type(2)', el => el.disabled);
        assert(calendarButtonClass.includes('active'), 'Calendar button should be active');
        assert(calendarButtonDisabled, 'Calendar button should be disabled');
    });

    it('should navigate to tasks page and highlight the tasks button', async () => {
        await page.click('my-sidebar >>> button:nth-of-type(3)');
        await page.waitForNavigation();

        // Check URL
        const url = await page.url();
        assert(url.endsWith('tasks.html'), 'URL should be tasks.html');

        // Check that the tasks button is highlighted and disabled
        const tasksButtonClass = await page.$eval('my-sidebar >>> button:nth-of-type(3)', el => el.className);
        const tasksButtonDisabled = await page.$eval('my-sidebar >>> button:nth-of-type(3)', el => el.disabled);
        assert(tasksButtonClass.includes('active'), 'Tasks button should be active');
        assert(tasksButtonDisabled, 'Tasks button should be disabled');
    });

    it('should navigate to journal page and highlight the journal button', async () => {
        await page.click('my-sidebar >>> button:nth-of-type(4)');
        await page.waitForNavigation();

        // Check URL
        const url = await page.url();
        assert(url.endsWith('journal.html'), 'URL should be journal.html');

        // Check that the journal button is highlighted and disabled
        const journalButtonClass = await page.$eval('my-sidebar >>> button:nth-of-type(4)', el => el.className);
        const journalButtonDisabled = await page.$eval('my-sidebar >>> button:nth-of-type(4)', el => el.disabled);
        assert(journalButtonClass.includes('active'), 'Journal button should be active');
        assert(journalButtonDisabled, 'Journal button should be disabled');
    });

    it('should persist the active button state across reloads', async () => {
        await page.click('my-sidebar >>> button:nth-of-type(3)');
        await page.waitForNavigation();

        // Reload the page
        await page.reload();
        await page.waitForNavigation();

        // Check URL
        const url = await page.url();
        assert(url.endsWith('tasks.html'), 'URL should be tasks.html');

        // Check that the tasks button is still highlighted and disabled
        const tasksButtonClass = await page.$eval('my-sidebar >>> button:nth-of-type(3)', el => el.className);
        const tasksButtonDisabled = await page.$eval('my-sidebar >>> button:nth-of-type(3)', el => el.disabled);
        assert(tasksButtonClass.includes('active'), 'Tasks button should be active');
        assert(tasksButtonDisabled, 'Tasks button should be disabled');
    });
});
