import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import { expect } from 'chai';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Sidebar E2E Tests', () => {
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
            port: 1002
        });

        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        page = await browser.newPage();
        await page.goto("http://localhost:1002/index.html"); // Adjust the path to your HTML file
    }, 30000);

    afterAll(async () => {
        await browser.close();
        await server.close();
    });

    test('should load the overview page and highlight the overview button', async () => {
        const overviewButtonClass = await page.$eval('sidebar-layout >>> button:nth-of-type(1)', el => el.className);
        const overviewButtonDisabled = await page.$eval('sidebar-layout >>> button:nth-of-type(1)', el => el.disabled);
        expect(overviewButtonClass).to.contain('active');
        expect(overviewButtonDisabled).to.be.true;
    });

    test('should navigate to calendar page and highlight the calendar button', async () => {
        await page.click('sidebar-layout >>> button:nth-of-type(2)');
        await page.waitForSelector('.calendar-container', { visible: true, timeout: 0 });
        //await page.waitForNavigation({ waitUntil: 'networkidle2',  timeout: 3000 });

        const url = await page.url();
        expect(url).to.match(/calendar.html$/);

        await page.waitForSelector('sidebar-layout >>> button:nth-of-type(2).active');
        const calendarButtonClass = await page.$eval('sidebar-layout >>> button:nth-of-type(2)', el => el.className);
        const calendarButtonDisabled = await page.$eval('sidebar-layout >>> button:nth-of-type(2)', el => el.disabled);
        expect(calendarButtonClass).to.contain('active');
        expect(calendarButtonDisabled).to.be.true;
    });

    test('should navigate to tasks page and highlight the tasks button', async () => {
        await page.click('sidebar-layout >>> button:nth-of-type(3)');
        await page.waitForSelector('#container', { visible: true, timeout: 0 });
        //await page.waitForNavigation({ waitUntil: 'networkidle2',  timeout: 3000 });

        const url = await page.url();
        expect(url).to.match(/tasks.html$/);

        await page.waitForSelector('sidebar-layout >>> button:nth-of-type(3).active');
        const tasksButtonClass = await page.$eval('sidebar-layout >>> button:nth-of-type(3)', el => el.className);
        const tasksButtonDisabled = await page.$eval('sidebar-layout >>> button:nth-of-type(3)', el => el.disabled);
        expect(tasksButtonClass).to.contain('active');
        expect(tasksButtonDisabled).to.be.true;
    });

    test('should navigate to journal page and highlight the journal button', async () => {
        await page.click('sidebar-layout >>> button:nth-of-type(4)');
        await page.waitForSelector('#resizable-box', { visible: true, timeout: 0 });
        //await page.waitForNavigation({ waitUntil: 'networkidle2',  timeout: 3000 });

        const url = await page.url();
        expect(url).to.match(/journal.html$/);

        await page.waitForSelector('sidebar-layout >>> button:nth-of-type(4).active');
        const journalButtonClass = await page.$eval('sidebar-layout >>> button:nth-of-type(4)', el => el.className);
        const journalButtonDisabled = await page.$eval('sidebar-layout >>> button:nth-of-type(4)', el => el.disabled);
        expect(journalButtonClass).to.contain('active');
        expect(journalButtonDisabled).to.be.true;
    });

    test('should persist the active button state across reloads', async () => {
        await page.click('sidebar-layout >>> button:nth-of-type(3)');
        //await page.waitForNavigation({ waitUntil: 'networkidle2',  timeout: 3000 });

        await page.reload({ waitUntil: 'networkidle2' });

        const url = await page.url();
        expect(url).to.match(/tasks.html$/);

        await page.waitForSelector('sidebar-layout >>> button:nth-of-type(3).active');
        const tasksButtonClass = await page.$eval('sidebar-layout >>> button:nth-of-type(3)', el => el.className);
        const tasksButtonDisabled = await page.$eval('sidebar-layout >>> button:nth-of-type(3)', el => el.disabled);
        expect(tasksButtonClass).to.contain('active');
        expect(tasksButtonDisabled).to.be.true;
    });
});
