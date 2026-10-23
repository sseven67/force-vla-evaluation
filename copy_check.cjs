const { chromium } = require('C:/Users/sseve/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1480, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:8765/#works');
    await page.locator('.selection-policy').waitFor();
    await page.getByText('筛选规则', { exact: true }).click();
    const policy = await page.locator('.selection-policy>div').innerText();
    assert.equal(await page.locator('.selection-policy li').count(), 3);
    assert.ok(policy.length < 230);
    assert.ok(policy.includes('Stars ≥30') && policy.includes('引用 ≥5'));
    await page.screenshot({ path: 'qa/concise-selection-policy.png' });
    await page.goto('http://127.0.0.1:8765/#tasks');
    await page.locator('.task-category').first().waitFor();
    assert.ok(!(await page.locator('main').innerText()).includes('双臂不自动代表长程'));
    await page.goto('http://127.0.0.1:8765/#tasks/grasp');
    await page.locator('.concrete-task-summary').waitFor();
    assert.ok(await page.locator('.concrete-task-summary li').count() > 0);
    await page.goto('http://127.0.0.1:8765/#paper/W01');
    await page.locator('dialog .task-protocol').first().waitFor();
    const data = JSON.parse(fs.readFileSync('public/catalogue.json', 'utf8'));
    assert.equal(await page.locator('dialog .task-protocol').count(), data.works.find(w => w.id === 'W01').experiments.length);
    for (const note of await page.locator('dialog .force-evaluation details').all()) {
      assert.ok(await note.evaluate(el => !el.open));
    }
    await page.goto('http://127.0.0.1:8765/#overview');
    await page.locator('.diagram-panel').waitFor();
    assert.equal(await page.locator('.explain-note').count(), 0);
    await page.goto('http://127.0.0.1:8765/#guide');
    await page.locator('.guide-card').first().waitFor();
    assert.equal(await page.locator('.guide-card').count(), 3);
    await page.goto('http://127.0.0.1:8765/#benchmarks/libero');
    await page.locator('.benchmark-origin').waitFor();
    assert.ok(!(await page.locator('main').innerText()).includes('未运行复现'));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://127.0.0.1:8765/#works');
    await page.locator('.selection-policy summary').click();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: 'qa/concise-selection-mobile.png' });
    assert.deepEqual(errors, []);
    console.log('PASS: concise guidance, criteria and evaluations preserved, supplemental notes collapsed, desktop and mobile.');
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
