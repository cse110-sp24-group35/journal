import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Upcoming Tasks E2E Test', () => {
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
      port: 5001
    });

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    page = await browser.newPage();
  }, 30000);

  afterAll(async () => {
    await browser.close();
    await server.close();
  });

  test('Display upcoming tasks', async () => {
    await page.goto('http://localhost:5001/index.html'); // Replace with the correct URL

    // Check if the upcoming tasks container exists
    const containerExists = await page.$('.upcoming-tasks-container') !== null;
    expect(containerExists).toBe(true);

    // Wait for the tasks to be rendered
    await page.waitForSelector('.upcoming-task-date');

    // Get all the upcoming task dates
    const taskItems = await page.$$('.upcoming-task-date');
    expect(taskItems.length).toBe(7); // There should be 7 items, one for each day

    // Check that each task date contains the correct summary
    const summaries = await Promise.all(
      taskItems.map(async item => {
        const text = await page.evaluate(el => el.textContent, item);
        return text;
      })
    );

    const hasTaskSummary = summaries.some(summary => summary.includes('Upcoming Task'));
    expect(hasTaskSummary).toBe(true); // At least one of the days should have an upcoming task
  });

  test('Show task details on hover', async () => {
    const taskItem = await page.$('.upcoming-task-date');
    const popup = await page.$('.task-popup');

    // Hover over the first task item
    await taskItem.hover();

    // Wait for the popup to be visible
    await page.waitForFunction(popup => window.getComputedStyle(popup).display !== 'none', {}, popup);

    // Check that the popup contains task details
    const popupText = await page.evaluate(popup => popup.textContent, popup);
    expect(popupText).toContain('Task 1'); // Assuming 'Task 1' is one of the tasks
  });

  test('Hide popup on mouse out', async () => {
    const taskItem = await page.$('.upcoming-task-date');
    const popup = await page.$('.task-popup');

    // Hover over the first task item to show the popup
    await taskItem.hover();

    // Wait for the popup to be visible
    await page.waitForFunction(popup => window.getComputedStyle(popup).display !== 'none', {}, popup);

    // Move the mouse away to hide the popup
    await page.mouse.move(0, 0);

    // Wait for the popup to be hidden
    await page.waitForFunction(popup => window.getComputedStyle(popup).display === 'none', {}, popup);

    // Check that the popup is hidden
    const popupDisplay = await page.evaluate(popup => window.getComputedStyle(popup).display, popup);
    expect(popupDisplay).toBe('none');
  });
});
