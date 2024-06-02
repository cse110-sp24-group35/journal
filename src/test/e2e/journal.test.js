import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Test if modal appears", () => {
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
            headless: true
        });
        page = await browser.newPage();
        await page.goto("http://localhost:1000/journal.html"); // Adjust the path to your HTML file
    }, 30000);

    afterAll(async () => {
        await browser.close();
        await server.close();
    });

    test("should display the modal", async () => {
        // Check if the modal is visible
        const isModalVisible = await page.evaluate(() => {
            const shadow = document.querySelector("modal-journal");
            const modal = shadow.shadowRoot.querySelector('.modal');
            const style = window.getComputedStyle(modal);
            return style.display !== 'none';
        });

        expect(isModalVisible).toBe(true);
    });
    
    test("should not have any journal to display", async () => {
        // Check if the modal is visible
        const noJournalMessage = await page.evaluate(() => {
            const editor = document.querySelector("journal-editor");
            const message = editor.shadowRoot.querySelector('p');
            return message.innerText == 'No journal selected';
        });

        expect(noJournalMessage).toBe(true);
    });
});
