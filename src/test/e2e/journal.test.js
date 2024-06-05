import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import { expect } from 'chai';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Journal Page", () => {
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
            port: 1000
        });

        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        page = await browser.newPage();
        await page.goto("http://localhost:1000/journal.html"); // Adjust the path to your HTML file
    }, 10000);

    afterAll(async () => {
        await browser.close();
        await server.close();
    });

    it("should display the modal upon clicking add new task", async () => {
        // Check if the modal is visible
        const isModalVisible = await page.evaluate(() => {
            const journalBody = document.querySelector("body");
            const newModal = document.createElement("modal-journal");
            journalBody.appendChild(newModal);
            const shadow = document.querySelector("modal-journal");
            const modal = shadow.shadowRoot.querySelector('.modal');
            const style = window.getComputedStyle(modal);
            return style.display !== 'none';
        });

        expect(isModalVisible).to.equal(true);

        await page.evaluate(() => {
            const shadow = document.querySelector("modal-journal");
            shadow.remove();
        });
    });
});