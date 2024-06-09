import puppeteer from 'puppeteer';
import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Kanban Board E2E Test', () => {
  let browser;
  let server;
  let page;

  const fastify = Fastify();

  beforeAll(async function () {
    fastify.register(staticPlugin, {
      root: path.join(__dirname, "../../") // Adjust the path to your project's root if needed
    });

    server = fastify;
    await server.listen({
      port: 5000
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

  test('Add a new column and a new task', async () => {
    await page.goto('http://localhost:5000/tasks.html'); // Replace with the correct URL

    // For E2E test only, default to no column
    await page.evaluate(async () => {
      const helper = await import("./scripts/database/stores/kanban.js");
      helper.statuses.set([]);
    });

    // Add a new column
    await page.click('.add-task-column-button');
    await page.type('body > modal-card-popup-column > dialog > form > label > input', "TODO");
    await page.click('body > modal-card-popup-column > dialog > form > div > button');

    // Wait for the new column to appear
    await page.waitForSelector('.task-column[data-column-id*="TODO"]');

    // Add a new task to the new column
    await page.click("#container > main > task-column > section > div.add-button > button");

    // Fill in task details
    await page.type('input[name="taskName"]', 'New Task');
    await page.type('input[name="taskDesc"]', 'Task Description');
    await page.type('input[name="dueDate"]', '2024-06-30');
    await page.type('input[name="tags"]', 'test');
    await page.click('button#saveButton');

    // Wait for the new task to appear
    await page.waitForSelector('.task-card');

    // Verify the new task
    const tasks = await page.$$('.task-card');
    const newTask = tasks[tasks.length - 1]; // The last task is the newly added one
    const taskTitle = await newTask.$eval('.card-title', el => el.innerText);
    expect(taskTitle).toBe('New Task');
  });

  test('Edit a task', async () => {
    // Assuming there is at least one task to edit
    const firstTaskEditButton = await page.$('.task-card .edit');
    await firstTaskEditButton.click();

    // Wait for modal to appear
    await page.waitForSelector('.modal-card-popup');

    // Edit task details
    const taskNameInput = await page.$('input[name="taskName"]');
    await taskNameInput.click({ clickCount: 3 }); // Select all text
    await taskNameInput.type('Updated Task');

    await page.click('button#saveButton');

    // Wait for modal to close
    await page.waitForSelector('.modal-card-popup', { hidden: true });

    // Verify the updated task
    const taskTitle = await page.$eval('.task-card .card-title', el => el.innerText);
    expect(taskTitle).toBe('Updated Task');
  });

  test('Delete a column', async () => {
    // Assuming the column created in the previous test exists
    const columns = await page.$$('.task-column');
    const newColumn = columns[columns.length - 1]; // The last column
    const deleteButton = await newColumn.$('.task-column-delete-button');
    await deleteButton.click();

    // Wait for the column to be removed
    await page.waitForSelector(`.task-column[data-column-id*="${newColumn.columnId}"]`, { hidden: true });

    // Verify the column is removed
    const remainingColumns = await page.$$('.task-column');
    expect(remainingColumns.length).toBe(columns.length - 1);
  });
});