import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import assert from 'assert';

describe("Test if modal appears", () => {
    let browser;
    let page;
    let server;

    const fastify = new Fastify();

    before(async function () {
        this.timeout(10000);

        fastify.register(staticPlugin, {
            root: path.join(__dirname, "../../") // Adjust the path to your project's root if needed
        });

        server = fastify;
        await server.listen({
            port: 4321
        });

        browser = await puppeteer.launch({
            headless: true
        });
        page = await browser.newPage();
        await page.goto("http://localhost:4321/journal.html"); // Adjust the path to your HTML file
    });

    after(async () => {
        await browser.close();
        await server.close();
    });

    it("should display the modal", async () => {
        // Check if the modal is visible
        const isModalVisible = await page.evaluate(() => {
            const modal = document.querySelector('.modal');
            const style = window.getComputedStyle(modal);
            return style.display !== 'none';
        });

        console.log(`Modal is visible: ${isModalVisible}`);
        assert.strictEqual(isModalVisible, true, "The modal should be visible");
    });
});