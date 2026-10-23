const { chromium } = require('C:/Users/sseve/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const data = JSON.parse(fs.readFileSync('public/catalogue.json', 'utf8'));
  const removed = ['T15', 'T20', 'T21', 'C08', 'C09', 'C16', 'C17', 'C18', 'C19'];
  const names = ['VITaL Pretraining', 'See, Hear, and Feel', 'ManiWAV', 'Touch Dexterity', 'RotateIt', 'MOMA-Force', 'TacDiffusion', 'AFORCE', 'Impedance-IRL'];
  const serialized = JSON.stringify(data);
  for (const name of names) assert.ok(!serialized.includes(name), name + ': no website data residue');
  for (const id of removed) {
    assert.ok(!data.works.some(w => w.id === id));
    assert.ok(!data.taskInstances.some(r => r.work === id || r.protocols.some(e => e.id.startsWith(id + '-'))));
  }
  assert.ok(data.taskInstances.some(r => r.work === 'W01' && r.protocols.some(e => e.task === '擦白板')));
  for (const topic of data.taskTypes) assert.ok(data.taskInstances.some(r => r.task === topic.id));
  const papers = data.works.filter(w => !w.resourceOnly);
  assert.equal(papers.length, 58);
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1480, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:8765/#works');
    await page.getByLabel('时间范围', { exact: true }).waitFor();
    assert.equal(await page.getByLabel('时间范围', { exact: true }).inputValue(), 'all');
    assert.deepEqual(await page.getByLabel('时间范围', { exact: true }).locator('option').allTextContents(), ['全部', '2024', '2025', '2026']);
    await page.getByRole('button', { name: /^全部论文/ }).click();
    assert.equal(await page.locator('.work-card').count(), 58);
    for (const year of ['2024', '2025', '2026']) {
      await page.getByLabel('时间范围', { exact: true }).selectOption(year);
      const expected = papers.filter(w => String(w.screening.publicYear) === year);
      assert.equal(await page.locator('.work-card').count(), expected.length, year);
      await page.getByRole('button', { name: /^全部论文/ }).click();
      assert.equal(await page.getByLabel('时间范围', { exact: true }).inputValue(), year);
    }
    await page.getByLabel('时间范围', { exact: true }).selectOption('all');
    await page.screenshot({ path: 'qa/papers-year-filters-desktop.png' });
    await page.goto('http://127.0.0.1:8765/#tasks');
    await page.getByLabel('时间范围', { exact: true }).waitFor();
    assert.equal(await page.getByLabel('时间范围', { exact: true }).inputValue(), 'all');
    assert.deepEqual(await page.getByLabel('时间范围', { exact: true }).locator('option').allTextContents(), ['全部', '2024', '2025', '2026']);
    for (const year of ['2024', '2025', '2026']) {
      await page.getByLabel('时间范围', { exact: true }).selectOption(year);
      const labels = await page.locator('.task-topic-list button>span:first-child').allTextContents();
      assert.ok(labels.length > 0, year + ': task topics remain discoverable');
    }
    await page.goto('http://127.0.0.1:8765/#overview');
    await page.locator('.diagram-panel').waitFor();
    for (const name of names) assert.ok(!(await page.locator('main').innerText()).includes(name));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://127.0.0.1:8765/#works');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: 'qa/papers-year-filters-mobile.png' });
    assert.deepEqual(errors, []);
    console.log('PASS: nine papers and task references removed; shared tasks retained; 58 papers; all/2024/2025/2026 filters and mobile layout.');
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
