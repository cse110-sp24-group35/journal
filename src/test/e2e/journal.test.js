import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import assert from 'assert';
import { expect } from 'chai';
import { fileURLToPath } from 'url';
import { journals, createJournal, getJournal, deleteJournal } from '../../scripts/database/stores/journal';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/*
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
            const shadow = document.querySelector("modal-journal");
            const modal = shadow.shadowRoot.querySelector('.modal');
            const style = window.getComputedStyle(modal);
            return style.display !== 'none';
        });

        expect(isModalVisible).to.equal(true);
    });
});

*/

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
            headless: false,
            slowMo: 50
        });
        page = await browser.newPage();
        await page.goto("http://localhost:1000/journal.html"); // Adjust the path to your HTML file
    }, 10000);

    afterAll(async () => {
        await browser.close();
        await server.close();
    });

    it('should populate the tree view on load', async () => {
        await page.evaluate(async () => {
            const helper = await import("./scripts/database/stores/journal.js");
            helper.createJournal("Test Journal", "folder1/journal1", "Test Content", ["tag1"]);
        });
        await page.reload();
        await page.waitForSelector('#content > .treeElement');
        const treeElements = await page.$$('#content > .treeElement');
        expect(treeElements.length).to.be.greaterThan(0);
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
        const initialContent = await firstFolderButton.evaluate(node => node.textContent);

        await firstFolderButton.click();
        const openContent = await firstFolderButton.evaluate(node => node.textContent);
        expect(openContent).to.include('-');

        await firstFolderButton.click();
        const closeContent = await firstFolderButton.evaluate(node => node.textContent);
        expect(closeContent).to.include('+');
    });

    it('should load journal content on button click', async () => {
        const journalButton = await page.$('.journalButton');
        await journalButton.click();
        const journalTitle = await page.$eval('#journal-view h1', el => el.textContent);
        expect(journalTitle).to.equal("Test Journal");
    });

    it('should populate tree view correctly', async () => {
        const treeData = journals.get().map(journal => journal.path);
        const tree = buildTree(treeData);
        const treeArray = convertTreeToArray(tree);
        const contentContainer = await page.$('#content');
        contentContainer.innerHTML = "";
        const journalViewer = await page.$('#journal-view');

        populateButtons(treeArray, contentContainer, "tree", journalViewer);
        const treeElements = await page.$$('#content .treeElement');
        expect(treeElements.length).to.be.greaterThan(0);
    });
});
