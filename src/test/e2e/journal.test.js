import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import { expect } from 'chai';
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
    }, 10000);

    afterAll(async () => {
        await browser.close();
        await server.close();
    });

    test("should display the modal upon clicking add new task", async () => {
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
            port: 1000
        });

        browser = await puppeteer.launch({
            headless: true,
            slowMo: 50,
            args: ["--no-sandbox"]
        });
        page = await browser.newPage();
        await page.goto("http://localhost:1000/journal.html"); // Adjust the path to your HTML file
    }, 10000);

    afterAll(async () => {
        await browser.close();
        await server.close();
    });

    it('should populate the tree view on load', async () => {
        let treeElements = await page.$$('#content > .tree-element');
        console.log("Tree view should be empty if no journals exist");
        expect(treeElements.length).to.equal(0); // The tree view should be empty if no journals exist
        await page.evaluate(async () => {
            const helper = await import("./scripts/database/stores/journal.js");
            helper.createJournal("Test Journal", "folder1/journal1", "Test Content", ["tag1"]);
        });
        await page.waitForSelector('#content > .tree-element');
        treeElements = await page.$$('#content > .tree-element');
        console.log("Tree view should have one folder on the top level");
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

    it('should load journal content on button click', async () => {
        const journalButton = await page.$('.journal-button');
        await journalButton.click();
        const journalTitle = await page.$eval('#journal-view > h1', el => el.textContent);
        expect(journalTitle).to.equal("Test Journal");
    });

    it('should update tree view upon journal deletion', async () => {
        let treeElements = await page.$$('#content > .tree-element');
        console.log("Tree view should have an element");
        expect(treeElements.length).to.equal(1); 
        await page.evaluate(async () => {
            const helper = await import("./scripts/database/stores/journal.js");
            helper.deleteJournal("folder1/journal1");
        });
        treeElements = await page.$$('#content > .tree-element');
        console.log("Tree view should be empty");
        expect(treeElements.length).to.equal(0);
    });
});
