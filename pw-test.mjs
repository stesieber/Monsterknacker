// Use local install (CI) or fall back to the globally installed version.
const { chromium } = await import('playwright').catch(() =>
  import('/opt/node22/lib/node_modules/playwright/index.mjs'),
);

const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
let failures = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ${PASS} ${label}`);
  } else {
    console.log(`  ${FAIL} ${label}`);
    failures++;
  }
}

/** Ensure a profile exists and land on PracticeSession input phase (free mode). */
async function navigateToAnswerInput(page) {
  await page.goto('http://localhost:5173');
  // Create profile if none exists
  if (await page.locator('.profile-card').count() === 0) {
    await page.locator('.add-card').click();
    await page.locator('.field-input').fill('TestKind');
    await page.locator('.emoji-btn').first().click();
    await page.locator('.btn-primary', { hasText: 'Speichern' }).click();
  }
  await page.locator('.profile-card').first().click();
  await page.locator('button', { hasText: 'Üben starten' }).click();
  await page.locator('.mode-card', { hasText: 'Freies Üben' }).click();
  await page.locator('.start-btn').click();
  await page.locator('.answer-field').waitFor({ timeout: 5000 });
}

// ─── Test 1: Normal 375×812 — input row within viewport ──────────────────────
async function testNormalMobile(browser) {
  console.log('\n📱 Test 1: 375×812 (normal) — input row width');
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    await navigateToAnswerInput(page);
    const vw = 375;

    const inputBox = await page.locator('.answer-field').boundingBox();
    const okBox    = await page.locator('.ok-btn').boundingBox();
    const rowBox   = await page.locator('.answer-input').boundingBox();

    assert(inputBox !== null, 'input field rendered');
    assert(okBox !== null, 'OK button rendered');

    if (rowBox && okBox && inputBox) {
      const rowRight = rowBox.x + rowBox.width;
      const okRight  = okBox.x + okBox.width;
      assert(rowRight <= vw + 1, `row right edge ${Math.round(rowRight)}px ≤ ${vw}px`);
      assert(okRight  <= vw + 1, `OK btn right edge ${Math.round(okRight)}px ≤ ${vw}px`);
      assert(rowBox.x >= 0, `row left edge ${Math.round(rowBox.x)}px ≥ 0`);
      assert(okBox.width >= 60, `OK btn width ${Math.round(okBox.width)}px ≥ 60px`);
      assert(inputBox.width > 80, `input field width ${Math.round(inputBox.width)}px > 80px`);
      console.log(`     row: x=${Math.round(rowBox.x)} w=${Math.round(rowBox.width)}  ` +
                  `input: w=${Math.round(inputBox.width)}  ok: w=${Math.round(okBox.width)}`);
    }

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    assert(scrollWidth <= vw + 1, `no horizontal body overflow (scrollWidth=${scrollWidth})`);
  } finally {
    await page.close();
  }
}

// ─── Test 2: 375×390 — simulated keyboard-open viewport ──────────────────────
async function testKeyboardOpen(browser) {
  console.log('\n⌨️  Test 2: 375×390 (keyboard open) — no overflow, content visible');
  const page = await browser.newPage({ viewport: { width: 375, height: 390 } });
  try {
    await navigateToAnswerInput(page);
    const vw = 375;

    const inputBox = await page.locator('.answer-field').boundingBox();
    const okBox    = await page.locator('.ok-btn').boundingBox();
    const rowBox   = await page.locator('.answer-input').boundingBox();

    assert(inputBox !== null, 'input field visible in reduced viewport');
    assert(okBox !== null,    'OK button visible in reduced viewport');

    if (rowBox && okBox) {
      const okRight  = okBox.x + okBox.width;
      const rowRight = rowBox.x + rowBox.width;
      assert(okRight  <= vw + 1, `OK btn right edge ${Math.round(okRight)}px ≤ ${vw}px`);
      assert(rowRight <= vw + 1, `row right edge ${Math.round(rowRight)}px ≤ ${vw}px`);
      console.log(`     row: x=${Math.round(rowBox.x)} w=${Math.round(rowBox.width)}  ` +
                  `input top: ${Math.round(inputBox?.y ?? 0)}px`);
    }

    const taskBox = await page.locator('.task-display').boundingBox();
    if (taskBox) {
      assert(taskBox.y >= 0, `task display y=${Math.round(taskBox.y)}px not above viewport`);
    }

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    assert(scrollWidth <= vw + 1, `no horizontal overflow (scrollWidth=${scrollWidth})`);
  } finally {
    await page.close();
  }
}

// ─── Test 3: ModeSelector — touch-friendly cards, all within 375px ───────────
async function testModeSelector(browser) {
  console.log('\n🎯 Test 3: ModeSelector — layout & interaction');
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    await page.goto('http://localhost:5173');
    if (await page.locator('.profile-card').count() === 0) {
      await page.locator('.add-card').click();
      await page.locator('.field-input').fill('TestKind');
      await page.locator('.emoji-btn').first().click();
      await page.locator('.btn-primary', { hasText: 'Speichern' }).click();
    }
    await page.locator('.profile-card').first().click();
    await page.locator('button', { hasText: 'Üben starten' }).click();
    await page.locator('.mode-card').first().waitFor();

    const cards = page.locator('.mode-card');
    assert(await cards.count() === 2, '2 mode cards rendered');

    for (const card of await cards.all()) {
      const box = await card.boundingBox();
      if (box) {
        assert(box.x + box.width <= 376, `mode card within viewport (right=${Math.round(box.x + box.width)}px)`);
        assert(box.height >= 100, `mode card height ${Math.round(box.height)}px ≥ 100px`);
      }
    }

    const startBtn = page.locator('.start-btn');
    assert(await startBtn.isDisabled(), '"Los geht\'s!" disabled initially');

    // Training → difficulty cards appear
    await page.locator('.mode-card', { hasText: 'Training' }).click();
    await page.locator('.difficulty-card').first().waitFor({ timeout: 3000 });
    assert(await page.locator('.difficulty-card').count() === 3, '3 difficulty cards after Training selected');
    assert(await startBtn.isDisabled(), '"Los geht\'s!" still disabled without difficulty');

    await page.locator('.difficulty-card').first().click();
    assert(await startBtn.isEnabled(), '"Los geht\'s!" enabled after full selection');

    // Switch back to Freies Üben → difficulty hides, button enabled
    await page.locator('.mode-card', { hasText: 'Freies Üben' }).click();
    await page.waitForTimeout(300); // animation
    assert(await startBtn.isEnabled(), '"Los geht\'s!" enabled for Freies Üben');

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    assert(scrollWidth <= 376, `ModeSelector no horizontal overflow (scrollWidth=${scrollWidth})`);
  } finally {
    await page.close();
  }
}

// ─── Test 4a: Header visible — free mode ─────────────────────────────────────
async function testHeaderFreeMode(browser) {
  console.log('\n🔖 Test 4a: Practice header — free mode');
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    await navigateToAnswerInput(page);

    const top = page.locator('.practice-top');
    assert(await top.isVisible(), '.practice-top wrapper is visible');

    const topBox = await top.boundingBox();
    if (topBox) {
      assert(topBox.y >= 0 && topBox.y < 10, `practice-top near top of viewport (y=${Math.round(topBox.y)}px)`);
    }

    const taskNr = page.locator('.practice-task-nr');
    assert(await taskNr.isVisible(), '.practice-task-nr is visible');
    const taskText = await taskNr.textContent();
    assert(taskText?.includes('Aufgabe Nr.'), `task-nr text correct: "${taskText?.trim()}"`);

    assert(await page.locator('.practice-session-time').count() === 0, 'no session timer in free mode');
    assert(await page.locator('.end-btn').isVisible(), '"Beenden" button visible');

    const bg = await top.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    assert(bg === 'rgb(255, 255, 255)', `practice-top has white background (got: ${bg})`);
  } finally {
    await page.close();
  }
}

// ─── Test 4b: Header visible — training mode, also with keyboard-open ─────────
async function testHeaderTrainingMode(browser) {
  console.log('\n🔖 Test 4b: Practice header — training mode + keyboard-open simulation');
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    await page.goto('http://localhost:5173');
    if (await page.locator('.profile-card').count() === 0) {
      await page.locator('.add-card').click();
      await page.locator('.field-input').fill('TestKind');
      await page.locator('.emoji-btn').first().click();
      await page.locator('.btn-primary', { hasText: 'Speichern' }).click();
    }
    await page.locator('.profile-card').first().click();
    await page.locator('button', { hasText: 'Üben starten' }).click();
    await page.locator('.mode-card', { hasText: 'Training' }).click();
    await page.locator('.difficulty-card', { hasText: 'Leicht' }).click();
    await page.locator('.start-btn').click();
    await page.locator('.answer-field').waitFor({ timeout: 5000 });

    const top = page.locator('.practice-top');
    assert(await top.isVisible(), '.practice-top wrapper visible in training mode');

    const topBox = await top.boundingBox();
    if (topBox) {
      assert(topBox.y >= 0 && topBox.y < 10,
        `practice-top at top of viewport (y=${Math.round(topBox.y)}px)`);
      assert(topBox.height >= 56,
        `practice-top height includes header (${Math.round(topBox.height)}px ≥ 56px)`);
    }

    // Task number
    const taskNr = page.locator('.practice-task-nr');
    assert(await taskNr.isVisible(), '.practice-task-nr visible in training mode');
    assert((await taskNr.textContent())?.trim() === 'Aufgabe Nr. 1', 'first task number correct');

    // Session timer
    const sessionTime = page.locator('.practice-session-time');
    assert(await sessionTime.isVisible(), 'session timer visible in training mode');
    assert(/\d:\d{2}/.test((await sessionTime.textContent()) ?? ''), 'timer has m:ss format');

    // Main content starts below the header
    const headerBox = await page.locator('.practice-header').boundingBox();
    const mainBox   = await page.locator('.practice-main').boundingBox();
    if (headerBox && mainBox) {
      assert(mainBox.y >= headerBox.y + headerBox.height - 2,
        `main (y=${Math.round(mainBox.y)}) starts below header bottom (${Math.round(headerBox.y + headerBox.height)}px)`);
    }

    // Background is white (distinguishable from the grey page)
    const bg = await top.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    assert(bg === 'rgb(255, 255, 255)', `practice-top has white background (got: ${bg})`);

    // Confirm header stays fixed when page is programmatically scrolled
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(100);
    const topAfterScroll = await top.boundingBox();
    assert(
      topAfterScroll !== null && (topAfterScroll.y ?? 99) < 10,
      `practice-top stays at top after page scroll (y=${Math.round(topAfterScroll?.y ?? 99)}px)`,
    );

    // Simulate keyboard opening — shrink viewport to ~390px height
    await page.setViewportSize({ width: 375, height: 390 });
    await page.waitForTimeout(150);
    const topSmall = await top.boundingBox();
    assert(
      topSmall !== null && (topSmall.y ?? 99) < 10,
      `practice-top still at top after keyboard-open (y=${Math.round(topSmall?.y ?? 99)}px)`,
    );
    assert(await taskNr.isVisible(), 'task-nr visible after keyboard-open viewport shrink');
    assert(await sessionTime.isVisible(), 'session timer visible after keyboard-open viewport shrink');
  } finally {
    await page.close();
  }
}

// ─── Test 5: Training mode — CountdownBar + session timer ────────────────────
async function testTrainingMode(browser) {
  console.log('\n⏱️  Test 4: Training mode — CountdownBar + session timer');
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    await page.goto('http://localhost:5173');
    if (await page.locator('.profile-card').count() === 0) {
      await page.locator('.add-card').click();
      await page.locator('.field-input').fill('TestKind');
      await page.locator('.emoji-btn').first().click();
      await page.locator('.btn-primary', { hasText: 'Speichern' }).click();
    }
    await page.locator('.profile-card').first().click();
    await page.locator('button', { hasText: 'Üben starten' }).click();
    await page.locator('.mode-card', { hasText: 'Training' }).click();
    await page.locator('.difficulty-card', { hasText: 'Leicht' }).click();
    await page.locator('.start-btn').click();
    await page.locator('.answer-field').waitFor({ timeout: 5000 });

    // CountdownBar
    const bar = page.locator('.countdown-wrap');
    assert(await bar.isVisible(), 'CountdownBar visible');
    const barBox = await bar.boundingBox();
    if (barBox) {
      assert(barBox.height <= 16, `bar height ${barBox.height}px ≤ 16px`);
      assert(Math.round(barBox.width) === 375, `bar spans full width (${Math.round(barBox.width)}px)`);
    }

    // Session time
    const sessionTime = page.locator('.practice-session-time');
    assert(await sessionTime.isVisible(), 'session time in header');
    const t0 = await sessionTime.textContent();
    assert(/^\d+:\d{2}/.test((t0 ?? '').trim()), `session time format OK: "${t0?.trim()}"`);

    // Timer increments
    await page.waitForTimeout(1200);
    const t1 = await sessionTime.textContent();
    // At least the seconds part should differ (or minutes if unlucky, but unlikely)
    console.log(`     timer: "${t0?.trim()}" → "${t1?.trim()}"`);
    assert(t0 !== t1, 'session timer is running');

    // CountdownBar inner bar shrinks (training Leicht = 15s, after 1.2s it should be < 100%)
    const innerWidth = await page.locator('.countdown-bar').evaluate(
      (el) => parseFloat(el.style.width)
    );
    assert(innerWidth > 0 && innerWidth < 100, `countdown bar inner width ${innerWidth.toFixed(1)}% is shrinking`);
  } finally {
    await page.close();
  }
}

// ─── Test 5: Timeout behaviour ────────────────────────────────────────────────
async function testTimeout(browser) {
  console.log('\n💥 Test 5: Expert mode — timeout feedback');
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    await page.goto('http://localhost:5173');
    if (await page.locator('.profile-card').count() === 0) {
      await page.locator('.add-card').click();
      await page.locator('.field-input').fill('TestKind');
      await page.locator('.emoji-btn').first().click();
      await page.locator('.btn-primary', { hasText: 'Speichern' }).click();
    }
    await page.locator('.profile-card').first().click();
    await page.locator('button', { hasText: 'Üben starten' }).click();
    await page.locator('.mode-card', { hasText: 'Training' }).click();
    await page.locator('.difficulty-card', { hasText: 'Experte' }).click(); // 4s
    await page.locator('.start-btn').click();
    await page.locator('.answer-field').waitFor({ timeout: 5000 });

    // Wait for timeout (4s + buffer)
    await page.locator('.feedback', { hasText: 'Zeit abgelaufen' }).waitFor({ timeout: 8000 });
    assert(true, 'timeout feedback appeared');

    const feedbackText = await page.locator('.feedback').textContent();
    assert(feedbackText?.includes('Zeit abgelaufen'), 'feedback says "Zeit abgelaufen!"');
    assert(!feedbackText?.includes('Deine Antwort'), 'no "Deine Antwort" block on timeout');

    // "Weiter" button navigates back to input
    await page.locator('button', { hasText: 'Weiter' }).click();
    await page.locator('.answer-field').waitFor({ timeout: 5000 });
    assert(true, '"Weiter" leads to next task');
  } finally {
    await page.close();
  }
}

// ─── Run ──────────────────────────────────────────────────────────────────────
const browser = await chromium.launch();
try {
  await testNormalMobile(browser);
  await testKeyboardOpen(browser);
  await testModeSelector(browser);
  await testHeaderFreeMode(browser);
  await testHeaderTrainingMode(browser);
  await testTrainingMode(browser);
  await testTimeout(browser);
} catch (e) {
  console.error('\nUnhandled error:', e.message);
  failures++;
} finally {
  await browser.close();
}

console.log(`\n${'─'.repeat(50)}`);
if (failures === 0) {
  console.log('\x1b[32m✓ All tests passed\x1b[0m');
} else {
  console.log(`\x1b[31m✗ ${failures} test(s) failed\x1b[0m`);
  process.exit(1);
}
