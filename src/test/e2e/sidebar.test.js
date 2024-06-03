const puppeteer = require('puppeteer');
const Fastify = require('fastify');
const staticPlugin = require('@fastify/static');
const path = require('path');

describe('MySidebar E2E Tests', () => {
    let browser;
    let page;
    let server;

    const fastify = Fastify();

    beforeAll(async () => {
        fastify.register(staticPlugin, {
            root: path.join(__dirname, '../../..'),
            prefix: '/',
        });

        server = await fastify.listen({ port: 4321 });

        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
        await page.goto('http://localhost:4321/src/index.html');
    }, 30000); // Increased timeout for server and browser setup

    afterAll(async () => {
        await browser.close();
        await fastify.close();
    });

    test('should load the overview page and highlight the overview button', async () => {
        const overviewButtonClass = await page.$eval('my-sidebar >>> button:nth-of-type(1)', el => el.className);
        const overviewButtonDisabled = await page.$eval('my-sidebar >>> button:nth-of-type(1)', el => el.disabled);
        expect(overviewButtonClass).toContain('active');
        expect(overviewButtonDisabled).toBe(true);
    });

    test('should navigate to calendar page and highlight the calendar button', async () => {
        await page.click('my-sidebar >>> button:nth-of-type(2)');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        const url = await page.url();
        expect(url).toMatch(/calendar.html$/);

        const calendarButtonClass = await page.$eval('my-sidebar >>> button:nth-of-type(2)', el => el.className);
        const calendarButtonDisabled = await page.$eval('my-sidebar >>> button:nth-of-type(2)', el => el.disabled);
        expect(calendarButtonClass).toContain('active');
        expect(calendarButtonDisabled).toBe(true);
    }, 10000);

    test('should navigate to tasks page and highlight the tasks button', async () => {
        await page.click('my-sidebar >>> button:nth-of-type(3)');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        const url = await page.url();
        expect(url).toMatch(/tasks.html$/);

        const tasksButtonClass = await page.$eval('my-sidebar >>> button:nth-of-type(3)', el => el.className);
        const tasksButtonDisabled = await page.$eval('my-sidebar >>> button:nth-of-type(3)', el => el.disabled);
        expect(tasksButtonClass).toContain('active');
        expect(tasksButtonDisabled).toBe(true);
    }, 10000);

    test('should navigate to journal page and highlight the journal button', async () => {
        await page.click('my-sidebar >>> button:nth-of-type(4)');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        const url = await page.url();
        expect(url).toMatch(/journal.html$/);

        const journalButtonClass = await page.$eval('my-sidebar >>> button:nth-of-type(4)', el => el.className);
        const journalButtonDisabled = await page.$eval('my-sidebar >>> button:nth-of-type(4)', el => el.disabled);
        expect(journalButtonClass).toContain('active');
        expect(journalButtonDisabled).toBe(true);
    }, 10000);

    test('should persist the active button state across reloads', async () => {
        await page.click('my-sidebar >>> button:nth-of-type(3)');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        await page.reload();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        const url = await page.url();
        expect(url).toMatch(/tasks.html$/);

        const tasksButtonClass = await page.$eval('my-sidebar >>> button:nth-of-type(3)', el => el.className);
        const tasksButtonDisabled = await page.$eval('my-sidebar >>> button:nth-of-type(3)', el => el.disabled);
        expect(tasksButtonClass).toContain('active');
        expect(tasksButtonDisabled).toBe(true);
    }, 10000);
});
