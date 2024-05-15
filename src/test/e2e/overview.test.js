import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import { expect } from 'chai';

describe("Sentiment widget", () => {
    let browser;
    let page;
    let server;

    const fastify = new Fastify();

    before(async function () {
        this.timeout(10000);

        fastify.register(staticPlugin, {
            root: path.join(__dirname, "../../")
        });

        server = fastify;
        await server.listen({
            port: 4321
        });

        browser = await puppeteer.launch({
            headless: true
        });
        page = await browser.newPage();
        await page.goto("http://localhost:4321/index.html");
    });

    after(async () => {
        await browser.close();
        await server.close();
    });
});