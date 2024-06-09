import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import { expect } from 'chai';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//TREE VIEW TESTS
describe("Tree View", () => {
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
            port: 1001
        });

        browser = await puppeteer.launch({
            headless: true,
            slowMo: 250,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        page = await browser.newPage();
        await page.goto("http://localhost:1001/journal.html"); // Adjust the path to your HTML file
    }, 30000);

    afterAll(async () => {
        await browser.close();
        await server.close();
    });

    it('should populate the tree view on load', async () => {
        let treeElements = await page.$$('#content > .tree-element');
        expect(treeElements.length).to.equal(0); // The tree view should be empty if no journals exist
        await page.evaluate(async () => {
            const helper = await import("./scripts/database/stores/journal.js");
            helper.createJournal("Test Journal", "folder1/journal1", "Test Content", ["tag1"]);
        });
        await page.waitForSelector('#content > .tree-element');
        treeElements = await page.$$('#content > .tree-element');
        expect(treeElements.length).to.equal(1);
    });

    it('should collapse and expand the tree view', async () => {
        const collapseButton = await page.$('#collapse-button');
        const expandButton = await page.$('#expand-button');
        expect(await expandButton.evaluate(node => window.getComputedStyle(node).display)).to.equal('none');

        await collapseButton.click();
        expect(await expandButton.evaluate(node => window.getComputedStyle(node).display)).to.equal('block');
        expect(await collapseButton.evaluate(node => window.getComputedStyle(node).display)).to.equal('none');

        await expandButton.click();
        expect(await expandButton.evaluate(node => window.getComputedStyle(node).display)).to.equal('none');
        expect(await collapseButton.evaluate(node => window.getComputedStyle(node).display)).to.equal('block');
    });

    it('should resize the tree view', async () => {
        const resizer = await page.$('#resizer');
        const treeViewer = await page.$('#resizable-box');
        const initialWidth = await treeViewer.evaluate(node => node.style.width);

        await page.mouse.move(await resizer.evaluate(node => node.getBoundingClientRect().x), await resizer.evaluate(node => node.getBoundingClientRect().y));
        await page.mouse.down();
        await page.mouse.move(await resizer.evaluate(node => node.getBoundingClientRect().x + 100), await resizer.evaluate(node => node.getBoundingClientRect().y));
        await page.mouse.up();

        const newWidth = await treeViewer.evaluate(node => node.style.width);
        expect(newWidth).to.not.equal(initialWidth);
    });

    it('should open and close folders', async () => {
        const firstFolderButton = await page.$('.folder > button');

        await firstFolderButton.click();
        const openContent = await firstFolderButton.evaluate(node => node.textContent);
        expect(openContent).to.include('-');

        await firstFolderButton.click();
        const closeContent = await firstFolderButton.evaluate(node => node.textContent);
        expect(closeContent).to.include('+');

        await firstFolderButton.click(); // Open the folder again for the next test
    });

    it('journal editor should display content on button click', async () => {
        const journalButton = await page.$('.journal-button');
        await journalButton.click();

        const editorDisplayed = await page.evaluate( async() => {
            const editor = document.querySelector("journal-editor");

            const title = editor.shadowRoot.getElementById('journal-title');
            if (title.hidden) return false;
            if (title.value != "Test Journal") return false;
            
            const tags = editor.shadowRoot.getElementById('journal-tags');
            if (tags.hidden) return false;
            if (tags.value != ["tag1"]) return false;

            const text = editor.shadowRoot.getElementById('text-editor');
            if (text.hidden) return false;
            if (text.value != "Test Content") return false;

            return true;
        });

        expect(editorDisplayed).to.equal(true);
    });

    it('should update tree view upon journal deletion', async () => {
        let treeElements = await page.$$('#content > .tree-element');
        expect(treeElements.length).to.equal(1);
        await page.evaluate(async () => {
            const helper = await import("./scripts/database/stores/journal.js");
            helper.deleteJournal("folder1/journal1");
        });
        treeElements = await page.$$('#content > .tree-element');
        expect(treeElements.length).to.equal(0);
    });
});
