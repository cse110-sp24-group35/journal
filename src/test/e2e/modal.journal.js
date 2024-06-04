import puppeteer from 'puppeteer';
import assert from 'assert';
import { exec } from 'child_process';

let browser;
let page;
let server;

before(async function() {
  // Start the Fastify server
  server = exec('node server.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });

  // Give the server some time to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Launch Puppeteer browser
  browser = await puppeteer.launch();
  page = await browser.newPage();
  await page.goto('http://localhost:3000');
});

after(async function() {
  await browser.close();
  server.kill();
});

describe('ModalJournal Component', () => {
  it('renders the modal journal component', async () => {
    const modalExists = await page.$eval('modal-journal', (el) => {
      const shadow = el.shadowRoot;
      return shadow.querySelector('.modal') !== null;
    });
    assert.strictEqual(modalExists, true, 'Modal should exist');
  });

  it('displays the form with correct fields', async () => {
    const formFields = await page.$eval('modal-journal', (el) => {
      const shadow = el.shadowRoot;
      return {
        titleLabel: shadow.querySelector('label[for="title"]').textContent,
        titleInput: shadow.querySelector('input#title') !== null,
        pathLabel: shadow.querySelector('label[for="path"]').textContent,
        pathInput: shadow.querySelector('input#path') !== null,
        dueLabel: shadow.querySelector('label[for="due"]').textContent,
        dueInput: shadow.querySelector('input#due') !== null,
        tagsLabel: shadow.querySelector('label[for="tags"]').textContent,
        tagsInput: shadow.querySelector('input#tags') !== null,
        submitButton: shadow.querySelector('input[type="submit"]') !== null,
      };
    });

    assert.strictEqual(formFields.titleLabel, 'Title:', 'Title label should be "Title:"');
    assert.strictEqual(formFields.titleInput, true, 'Title input should exist');
    assert.strictEqual(formFields.pathLabel, 'Path:', 'Path label should be "Path:"');
    assert.strictEqual(formFields.pathInput, true, 'Path input should exist');
    assert.strictEqual(formFields.dueLabel, 'Due:', 'Due label should be "Due:"');
    assert.strictEqual(formFields.dueInput, true, 'Due input should exist');
    assert.strictEqual(formFields.tagsLabel, 'Tags:', 'Tags label should be "Tags:"');
    assert.strictEqual(formFields.tagsInput, true, 'Tags input should exist');
    assert.strictEqual(formFields.submitButton, true, 'Submit button should exist');
  });

  it('submits the form and displays a confirmation alert', async () => {
    page.on('dialog', async (dialog) => {
      const message = dialog.message();
      assert.ok(message.includes('Journal Created'), 'Alert should indicate journal creation');
      await dialog.dismiss();
    });

    await page.$eval('modal-journal', (el) => {
      const shadow = el.shadowRoot;
      shadow.querySelector('input#title').value = 'Test Journal';
      shadow.querySelector('input#path').value = 'test/path';
      shadow.querySelector('input#due').value = '2023-12-31';
      shadow.querySelector('input#tags').value = 'test, journal';
      shadow.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  });
});
