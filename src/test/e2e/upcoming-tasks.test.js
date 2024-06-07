import puppeteer from 'puppeteer';

describe('Upcoming Tasks E2E Test', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false, // Set to true if you don't need to see the browser
      slowMo: 50, // Slow down by 50ms for better visibility
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Add these arguments to run as root
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Display upcoming tasks', async () => {
    await page.goto('http://127.0.0.1:5500/src/upcoming-tasks.html'); // Replace with the correct URL

    // Check if the upcoming tasks container exists
    const containerExists = await page.$('.upcoming-tasks-container') !== null;
    expect(containerExists).toBe(true);

    // Wait for the tasks to be rendered
    await page.waitForSelector('.upcoming-task-date');

    // Get all the upcoming task dates
    const taskItems = await page.$$('.upcoming-task-date');
    expect(taskItems.length).toBe(7); // There should be 7 items, one for each day

    // Check that each task date contains the correct summary
    const summaries = await Promise.all(taskItems.map(async item => {
      const text = await page.evaluate(el => el.textContent, item);
      return text;
    }));
    
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
