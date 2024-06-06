import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import { expect } from 'chai';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tell linter these functions exist.
/*global beforeAll, afterAll, expect*/
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
            port: 6790
        });

        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        page = await browser.newPage();
        await page.goto("http://localhost:6790/journal.html"); // Adjust the path to your HTML file
    }, 30000);

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
  
    test("should not have any journal to display", async () => {
        // Check that no journal is displayed
        const noJournalMessage = await page.evaluate(() => {
            const editor = document.querySelector("journal-editor");
            const message = editor.shadowRoot.querySelector('p');
            return message.innerText == 'No journal selected';
        });

        expect(noJournalMessage).to.equal(true);
    });
    
    test("should open editor when selected in tree view", async () => {
        // Click on a journal entry
        // !NOTE: this depends on create-journal button creating a hello world entry
        await page.$('button#create-journal'  )?.then(button => button.click());
        await page.$('button[id="tree/hello"]')?.then(button => button.click());

        const openEditor = await page.evaluate(() => {
            document.getElementById('tree/hello/world').click();
            
            // Check if editor has the journal we selected
            const editor = document.querySelector("journal-editor");
            return editor.hasJournal() && editor.shadowRoot.getElementById('journal-title').value === "Hello World";
        });

        expect(openEditor).to.equal(true);
    })
    
    test("editor should autosave after edit", async () => {
        const editor = await page.$('journal-editor');
        const shadowRoot = await editor.evaluateHandle(el => el.shadowRoot);
        const text = await shadowRoot.$('#text-editor');

        await text.type('\nhello');

        // Wait for an autosave
        const delay = (time) => new Promise(resolve => setTimeout(resolve, time));
        await delay(1000);

        await page.reload();

        // Go to entry we changed
        await page.$('[id="tree/hello"]'      )?.then(button => button.click());
        await page.$('[id="tree/hello/world"]')?.then(button => button.click());

        const content = await page.evaluate(() => {
            const editor = document.querySelector("journal-editor");
            return editor.shadowRoot.getElementById('text-editor').value;
        });

        expect(content).to.equal("Hello World\nhello");
    })
});