import puppeteer from 'puppeteer';

describe('Kanban Board E2E Test', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false, // Set to true if you don't need to see the browser
      slowMo: 50, // Slow down by 50ms for better visibility
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Add a new column and a new task', async () => {
    await page.goto('http://127.0.0.1:5500/src/tasks.html'); // Replace with the correct URL

    // Add a new column
    await page.click('.add-task-column-button');
    await page.type('input[placeholder="Enter new column name:"]', 'New Column');
    await page.click('button:contains("Add Column")');

    // Wait for the new column to appear
    await page.waitForSelector('.task-column[data-column-id*="status-"]');

    // Add a new task to the new column
    const columns = await page.$$('.task-column');
    const newColumn = columns[columns.length - 1]; // The last column is the newly added one
    await newColumn.click('.add-task-card-button');

    // Fill in task details
    await page.type('input[name="taskName"]', 'New Task');
    await page.type('input[name="taskDesc"]', 'Task Description');
    await page.type('input[name="dueDate"]', '2024-06-30');
    await page.type('input[name="tags"]', 'test');
    await page.click('button#saveButton');

    // Wait for the new task to appear
    await page.waitForSelector('.task-card');

    // Verify the new task
    const tasks = await newColumn.$$('.task-card');
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