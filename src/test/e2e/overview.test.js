import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import { expect } from 'chai';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Overview Page", () => {
    let browser;
    let page;
    let server;

    const fastify = new Fastify();

    beforeAll(async () => {
        fastify.register(staticPlugin, {
            root: path.join(__dirname, "../../"),
            prefix: "/",
        });

        server = fastify;
        await server.listen({
            port: 4321
        });

        browser = await puppeteer.launch({
            headless: true,
            slowMo: 125,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();
        await page.goto("http://localhost:4321/index.html");
    }, 30000);

    afterAll(async () => {
        await browser.close();
        await server.close();
    });
});
