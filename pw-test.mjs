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

// ─── Test 6: Firefox Mobile keyboard simulation — header bleibt sichtbar ──────
//
// Reproduziert das Firefox-Mobile-Verhalten: wenn das Input-Feld fokussiert
// wird und die Tastatur öffnet, versucht Firefox die Seite zu scrollen.
// Ohne preventScroll:true wandert der Header aus dem Sichtbereich.
//
// Simulation:
// 1. Vollgrösse-Viewport (Tastatur noch nicht offen)
// 2. Input focussieren (wie Auto-Focus beim Mount)
// 3. window.scrollBy(0, 300) — was Firefox intern tut wenn die Tastatur öffnet
// 4. Header muss trotzdem bei y < 10 bleiben (position:fixed;inset:0)
// 5. window.scrollY muss 0 sein (Seite ist nicht scrollbar)
//
// Dann: Tastatur-Viewport (375×390) + gleiche Checks
async function testFirefoxKeyboardScroll(browser) {
  console.log('\n🦊 Test 6: Firefox-Mobile-Simulation — Tastatur-Scroll verhindert Header-Verschwinden');
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    await navigateToAnswerInput(page);

    // Fokus setzen (wie onMounted in AnswerInput)
    await page.locator('.answer-field').focus();
    await page.waitForTimeout(50);

    // Simuliere: Browser scrollt beim Tastatur-Öffnen (Firefox Mobile Verhalten)
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(100);

    const scrollY = await page.evaluate(() => window.scrollY);
    assert(scrollY === 0, `Seite ist nicht scrollbar (scrollY=${scrollY}px, erwartet 0)`);

    const topBox = await page.locator('.practice-top').boundingBox();
    assert(
      topBox !== null && topBox.y < 10,
      `Header bleibt nach Scroll-Versuch sichtbar (y=${Math.round(topBox?.y ?? 99)}px)`
    );

    // Jetzt zusätzlich Viewport auf Tastatur-Grösse reduzieren
    await page.setViewportSize({ width: 375, height: 390 });
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(100);

    const scrollYSmall = await page.evaluate(() => window.scrollY);
    assert(scrollYSmall === 0, `Seite nicht scrollbar nach Viewport-Verkleinerung (scrollY=${scrollYSmall}px)`);

    const topBoxSmall = await page.locator('.practice-top').boundingBox();
    assert(
      topBoxSmall !== null && topBoxSmall.y < 10,
      `Header sichtbar nach Tastatur-Viewport (y=${Math.round(topBoxSmall?.y ?? 99)}px)`
    );

    // Header-Inhalt noch sichtbar?
    assert(await page.locator('.practice-task-nr').isVisible(), 'Aufgaben-Nr. sichtbar');
    assert(await page.locator('.end-btn').isVisible(), '"Beenden"-Button sichtbar');

    // Prüfe visualViewport-Kompensation: wenn offsetTop > 0, muss practice.top angepasst sein
    const vvCompensation = await page.evaluate(() => {
      const el = document.querySelector('.practice');
      if (!el || !window.visualViewport) return null;
      return {
        elTop: parseFloat(window.getComputedStyle(el).top || '0'),
        vvOffsetTop: window.visualViewport.offsetTop,
      };
    });
    if (vvCompensation) {
      assert(
        Math.abs(vvCompensation.elTop - vvCompensation.vvOffsetTop) < 2,
        `visualViewport-Offset kompensiert (practice.top=${vvCompensation.elTop}px, vv.offsetTop=${vvCompensation.vvOffsetTop}px)`
      );
    }

    // Mehrere Aufgaben durchklicken → kein kumulativer Scroll-Drift
    for (let i = 0; i < 3; i++) {
      await page.locator('.answer-field').fill('42');
      await page.locator('.ok-btn').click();
      await page.locator('.next-btn').waitFor({ timeout: 3000 });
      await page.locator('.next-btn').click();
      await page.locator('.answer-field').waitFor({ timeout: 3000 });

      await page.evaluate(() => window.scrollBy(0, 300));
      await page.waitForTimeout(50);

      const drift = await page.evaluate(() => window.scrollY);
      const topAfter = await page.locator('.practice-top').boundingBox();
      assert(drift === 0, `Kein Scroll-Drift nach Aufgabe ${i + 1} (scrollY=${drift}px)`);
      assert(
        topAfter !== null && topAfter.y < 10,
        `Header nach Aufgabe ${i + 1} noch oben (y=${Math.round(topAfter?.y ?? 99)}px)`
      );
    }
  } finally {
    await page.close();
  }
}

// ─── Test 7: Falscher Antworte → Fehler-Feedback vollständig sichtbar ─────────
async function testWrongAnswerFeedback(browser) {
  console.log('\n❌ Test 7: Falsche Antwort — vollständiges Fehler-Feedback sichtbar');
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    await navigateToAnswerInput(page);

    // Immer falsche Antwort: 99 ist nie korrekt für Faktoren 1–9
    await page.locator('.answer-field').fill('99');
    await page.locator('.ok-btn').click();

    // Feedback-Phase abwarten
    const feedback = page.locator('.feedback');
    await feedback.waitFor({ timeout: 4000 });

    // ✗-Icon sichtbar
    const icon = page.locator('.feedback-icon');
    assert(await icon.isVisible(), '✗-Icon sichtbar');
    const iconText = await icon.textContent();
    assert(iconText?.includes('✗'), `✗-Icon zeigt ✗ (got: "${iconText}")`);

    // "Nicht ganz." Label sichtbar
    const label = page.locator('.feedback-label');
    assert(await label.isVisible(), '"Nicht ganz."-Label sichtbar');
    const labelText = await label.textContent();
    assert(labelText?.includes('Nicht ganz'), `Label sagt "Nicht ganz." (got: "${labelText}")`);

    // Gleichung sichtbar
    const eq = page.locator('.feedback-equation');
    assert(await eq.isVisible(), 'Gleichung sichtbar');

    // "Deine Antwort: 99" sichtbar
    const userAns = page.locator('.feedback-user-answer');
    assert(await userAns.isVisible(), '"Deine Antwort"-Zeile sichtbar');
    const userAnsText = await userAns.textContent();
    assert(userAnsText?.includes('99'), `"Deine Antwort" enthält 99 (got: "${userAnsText}")`);

    // ✗-Icon ist nicht vertikal abgeschnitten — boundingBox.y muss innerhalb des viewports sein
    const iconBox = await icon.boundingBox();
    assert(iconBox !== null && iconBox.y >= 0, `✗-Icon nicht über Viewport-Rand (y=${Math.round(iconBox?.y ?? -1)}px)`);

    // "Weiter"-Button sichtbar (ohne Scrollen)
    const weiter = page.locator('.next-btn');
    assert(await weiter.isVisible(), '"Weiter"-Button sichtbar');

    // Kein richtiger-Antwort-Marker bei falscher Antwort
    const feedbackClass = await feedback.getAttribute('class');
    assert(feedbackClass?.includes('feedback--wrong'), 'Feedback hat Klasse feedback--wrong');
    assert(!feedbackClass?.includes('feedback--correct'), 'Feedback hat NICHT Klasse feedback--correct');
  } finally {
    await page.close();
  }
}

// ─── Test 8: Richtige Antwort — Toast erscheint, kein Feedback-Dialog ────────
async function testCorrectAnswerFeedback(browser) {
  console.log('\n✅ Test 8: Richtige Antwort — 👍-Toast erscheint, kein Feedback-Dialog');
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    await navigateToAnswerInput(page);

    // Richtige Antwort aus DOM lesen
    const taskText = await page.locator('.task-display').textContent() ?? '';
    const match = taskText.match(/(\d+)\s*×\s*(\d+)/);
    const answer = match ? parseInt(match[1]) * parseInt(match[2]) : 1;

    await page.locator('.answer-field').fill(String(answer));
    await page.locator('.ok-btn').click();

    // Kein Feedback-Dialog bei richtiger Antwort
    await page.waitForTimeout(100);
    assert(await page.locator('.feedback').count() === 0, 'Kein Feedback-Dialog bei richtiger Antwort');

    // Toast erscheint oben rechts
    const toast = page.locator('.correct-toast');
    await toast.waitFor({ timeout: 2000 });
    assert(await toast.isVisible(), '👍-Toast erscheint');

    // Toast ist oben rechts positioniert
    const toastBox = await toast.boundingBox();
    if (toastBox) {
      assert(toastBox.y < 200, `Toast oben (y=${Math.round(toastBox.y)}px)`);
      assert(toastBox.x > 200, `Toast rechts (x=${Math.round(toastBox.x)}px bei vw=375)`);
    }

    // Nächste Aufgabe ist bereits sichtbar hinter dem Toast
    assert(await page.locator('.answer-field').isVisible(), 'Nächste Aufgabe direkt sichtbar');

    // Toast verschwindet nach ~900ms
    await page.waitForTimeout(1000);
    assert(await toast.count() === 0, 'Toast nach Animation verschwunden');
  } finally {
    await page.close();
  }
}

// ─── Test 10: Enter-Taste — Feedback bleibt sichtbar (kein Auto-Skip) ────────
async function testEnterKeyFeedback(browser) {
  console.log('\n⌨️  Test 10: Enter-Taste mit falscher Antwort — Feedback bleibt sichtbar');
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    await navigateToAnswerInput(page);

    // Falsche Antwort (99 ist für 1–9×1–9 nie korrekt), Enter statt OK-Button
    await page.locator('.answer-field').fill('99');
    await page.locator('.answer-field').press('Enter');

    // Feedback-Phase muss erscheinen
    const feedback = page.locator('.feedback');
    await feedback.waitFor({ timeout: 4000 });
    assert(await feedback.isVisible(), 'Feedback erscheint nach Enter');

    // 400ms warten — ohne Fix wäre Feedback durch Auto-Click auf "Weiter" schon weg
    await page.waitForTimeout(400);
    assert(await feedback.isVisible(), 'Feedback bleibt nach 400ms sichtbar (kein Auto-Skip via keyup)');

    // "Nicht ganz." muss angezeigt sein (nicht weitergesprungen)
    const labelText = await page.locator('.feedback-label').textContent();
    assert(labelText?.includes('Nicht ganz'), `Feedback zeigt "Nicht ganz." (got: "${labelText}")`);

    // Eingabefeld darf nicht mehr im DOM sein (wir sind in Feedback-Phase)
    assert(await page.locator('.answer-field').count() === 0, 'Eingabefeld weg (Feedback-Phase aktiv)');
  } finally {
    await page.close();
  }
}

// ─── Test 9: Visualisierung — erscheint im Feedback ──────────────────────────
async function testVisualization(browser) {
  console.log('\n🟦 Test 9: Visualisierung erscheint nach Antwort');
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    await navigateToAnswerInput(page);

    // Antwort einreichen (egal ob richtig oder falsch)
    await page.locator('.answer-field').fill('99');
    await page.locator('.ok-btn').click();
    await page.locator('.feedback').waitFor({ timeout: 4000 });

    // Visualisierung vorhanden
    const viz = page.locator('.viz-container');
    assert(await viz.count() > 0, 'Visualisierung (.viz-container) im DOM vorhanden');
    assert(await viz.isVisible(), 'Visualisierung sichtbar');

    // SVG mit viewBox gerendert
    const svg = page.locator('.viz-container svg');
    assert(await svg.count() > 0, 'SVG-Element vorhanden');
    const vb = await svg.getAttribute('viewBox');
    assert(vb !== null && vb.length > 0, `SVG hat viewBox-Attribut: "${vb}"`);

    // Mindestens ein Rect (farbiger Block) vorhanden
    const rects = page.locator('.viz-container svg rect');
    const rectCount = await rects.count();
    assert(rectCount >= 1 && rectCount <= 4, `${rectCount} Rechteck(e) im SVG (erwartet 1–4)`);

    // Visualisierung nicht vertikal abgeschnitten
    const vizBox = await viz.boundingBox();
    assert(vizBox !== null && vizBox.y >= 0, `Visualisierung nicht über Viewport-Rand (y=${Math.round(vizBox?.y ?? -1)}px)`);

    // Auch bei Tastatur-Viewport (390px) noch sichtbar (scrollbar)
    await page.setViewportSize({ width: 375, height: 390 });
    await page.waitForTimeout(100);
    const vizSmall = page.locator('.viz-container');
    assert(await vizSmall.count() > 0, 'Visualisierung bei kleinem Viewport im DOM');
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
  await testFirefoxKeyboardScroll(browser);
  await testWrongAnswerFeedback(browser);
  await testCorrectAnswerFeedback(browser);
  await testVisualization(browser);
  await testEnterKeyFeedback(browser);
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
