# Implementation Decisions

## ESLint config needs `@rushstack/eslint-patch`

The `.eslintrc.cjs` uses `require('@rushstack/eslint-patch/modern-module-resolution')` — standard pattern for Vue/TS projects to avoid ESM/CJS resolution issues. Added `@rushstack/eslint-patch` as a devDependency.

## Singleton composable via module-level reactive state

`useProfiles` stores its `state` at module scope (outside the function), so all component instances share the same reactive object. This avoids Pinia while still providing a single source of truth, as required by the spec.

## `verbatimModuleSyntax` — type-only imports

TypeScript's `verbatimModuleSyntax` requires `import type` for type-only imports. All type imports in `.ts` and `.vue` files use `import type { … }` accordingly.

## ESC key handling in `ProfileEditDialog`

The spec says dialogs close on ESC. `ProfileEditDialog` registers a global `keydown` listener via `onMounted`/`onUnmounted` rather than relying on a `@keydown` on the overlay div, because the overlay div is not focused by default and keyboard events bubble to `document`.

## `ConfirmDialog` stacked on top of `ProfileEditDialog`

Both dialogs render in the normal DOM flow, but `ConfirmDialog` has `z-index: 200` while `ProfileEditDialog`'s overlay has `z-index: 100`, so the confirm dialog correctly appears on top.

## No `activeProfile` auto-navigation on load

Per spec section 8: even if an active profile exists in localStorage, the app always starts on `ProfileSelector` so the child consciously picks who is practising. `activeProfileId` is preserved in storage but `currentScreen` always initialises to `'profile-selector'`.

## `@rushstack/eslint-patch` added as devDependency

Required by the standard `@vue/eslint-config-typescript` setup. Without it, ESLint cannot resolve the extended config in a CJS context with ESM packages.

---

## Iteration 2 decisions

## `type="text"` + `inputmode="numeric"` for AnswerInput

`type="number"` was avoided because it renders browser-native spinners, allows scroll-wheel changes to the value, and on some mobile browsers shows an unwanted decimal separator. Using `type="text"` with `inputmode="numeric"` gives us the numeric keyboard on mobile without those side effects. Non-digit characters are filtered client-side via the `@input` handler.

## `:key="inputKey"` on `AnswerInput` for reset and auto-focus

Rather than exposing an imperative `focus()` / `reset()` method via `defineExpose`, we increment a `inputKey` ref whenever we want a fresh AnswerInput (phase transition back to `'input'`). This forces Vue to unmount and remount the component, which triggers its `onMounted` auto-focus naturally and also resets all local state (raw value). Simpler than a `watch(phase, ...)` with imperative DOM calls.

## `recordTaskAttempt` uses conditional init, not pre-initialised TaskMap

`profile.tasks` starts as `undefined` for profiles created in Iteration 1. `recordTaskAttempt` lazily initialises both `profile.tasks` and the individual `TaskState` on first access. No migration script is needed.

## `SessionSummary` rendered from within `PracticeSession`

The summary is a phase of the session (`phase === 'summary'`), not a separate `Screen` in `App.vue`. This keeps session-local state (taskCount, correctCount) self-contained and avoids threading props up and back down through App.

## `100dvh` for practice and summary layouts

Mobile browsers shrink the viewport when the address bar is visible. `100dvh` uses the dynamic viewport height (CSS level 4), preventing the bottom button from being clipped. Fallback gracefully on browsers without support (the layout still works, just with a potential small clip).

---

## Iteration 3 decisions

## `setInterval` at 100 ms for CountdownBar

100 ms gives smooth bar animation (10 fps) without burning CPU. The bar only needs sub-second visual resolution; 100 ms is imperceptible to users but avoids the overhead of `requestAnimationFrame` (which runs at 60 fps, overkill for a progress bar).

## Drift-free timers via `Date.now()` deltas

Both `useTaskTimer` and `useSessionTimer` record `Date.now()` at start/resume and accumulate elapsed time at pause/stop. They never increment a counter. This means the displayed time is always `Date.now() - startTime + accumulatedMs`, so long GC pauses or late interval callbacks do not cause drift.

## Incremental time saving after each answered task

Instead of saving practice time on `beforeunload` (unreliable, especially on mobile), the session timer delta is flushed to `profile.stats.totalPracticeMs` after every submitted answer (including timeouts). In the worst case — a browser crash mid-task — only the seconds of the one in-progress task are lost, which is acceptable.

## Self-contained timer composables with their own event listeners

Both `useTaskTimer` and `useSessionTimer` register their own `visibilitychange` listeners internally. This avoids tight coupling: `PracticeSession.vue` does not need to coordinate pause/resume between timers. Each composable is independently testable and reusable. Cleanup happens in `onScopeDispose`, so the listeners are removed when `PracticeSession` unmounts.

## `sessionConfig` defaults to `{ mode: 'free' }` in `App.vue`

`sessionConfig` is initialised with a safe free-mode default rather than `null`, avoiding a `null`-check in the template when passing to `PracticeSession`. Since `ModeSelector` always emits a validated config before `PracticeSession` is shown, the default is never actually used.

## Timeout treated as wrong attempt, recorded via `recordTaskAttempt`

A timeout increments `attempts` without incrementing `correct` — identical to a wrong answer. This keeps the data model simple (one path for all non-correct outcomes) and the spec is explicit that "Timeout zählt als Versuch ohne Erfolg".

## `active` flag in `useTaskTimer` guards against post-clearInterval tick

`clearInterval()` prevents future ticks but cannot cancel a callback already queued in the event loop. The `active` boolean is checked at the top of `tick()` so a stale queued callback is a no-op even if it fires after `stop()`. `PracticeSession` also guards with `phase !== 'input'` for belt-and-suspenders safety.

---

## Iteration 4 decisions

## Vitest for unit tests

Vitest was added as the unit test runner (`npm test` → `vitest run`). The old Playwright e2e tests moved to `npm run test:e2e`. Vitest was chosen because it reuses the existing Vite config, requires zero additional configuration, and the leitner logic is pure TypeScript with no DOM dependency (environment: `node`).

## `useTaskGenerator.ts` removed, `Task` moved to `types/index.ts`

`useTaskGenerator.ts` was the only source of the `Task` interface in iterations 1–3. Now that `Task` is used by multiple modules (`utils/leitner.ts`, `useTaskSelector.ts`, `PracticeSession.vue`, `TaskDisplay.vue`, `AnswerFeedback.vue`), it was moved to `src/types/index.ts` where all shared types live. The generator's random-pick logic was superseded by the weighted Leitner selection in `useTaskSelector`.

## `ensureAllSmallTableTasks` uses `as any` for migration-compatibility

`TaskState.box` is typed as required `LeitnerBox`, but data loaded from localStorage (pre-migration) may have `box: undefined`. Since `noUnusedLocals` and `strict` prevent a clean `undefined` check on a required field, the one access inside `ensureAllSmallTableTasks` uses `as any` to handle the defensive case. This is isolated to one line in a utility function that exists specifically for this purpose.

## `selector.taskCount` vs component `taskCount`

`useTaskSelector` maintains its own `taskCount` (number of tasks selected, incremented in `next()`) for repeat-queue scheduling. `PracticeSession` keeps a separate `taskCount` ref (number of tasks answered, incremented in `onSubmit`/`onTimeout`) for the UI display and session summary. They are offset by one during any in-progress task but this does not affect correctness.

## `recordTaskAttempt` before `selector.next()` ordering

In both `onSubmit` and `onTimeout`, `recordTaskAttempt` (which updates the Leitner box in the profile) is called before `selector.next()` (which reads the profile boxes for weighted selection). This ensures the selector always works with the most up-to-date box values, as required by the spec.

---

## Iteration 5 decisions

## SVG instead of Canvas for the rectangle area model

SVG is used for the rectangle visualization rather than `<canvas>`. SVG scales crisply at all DPIs without extra effort, is a11y-friendly (real `<text>` elements, `role="img"`, `aria-label`), is smaller in the bundle (no pixel data), and requires no animation loop. Canvas would be needed only if we had complex per-frame animation — we don't.

## 5-block partition hardcoded for 1–9 (YAGNI for Iter. 7)

The `partition()` function in `useVisualization.ts` applies exactly one 5-block per axis (if the factor ≥ 5) and one remainder block. Factors 1–9 always produce at most one 5-block and one remainder per axis, so this is sufficient for V5. Iteration 7 will extend factors to 1–20 (requiring multiple 5-blocks or a 10-block variant). Generalizing now would add complexity without benefit.

## `showVisualization === undefined` treated as `true`

Profiles created before Iteration 5 have no `settings.showVisualization` field. The spec requires these to behave as if it were `true` (opt-out model). The check `profile.settings?.showVisualization !== false` achieves this without any migration: `undefined !== false` is `true`. Only explicit `false` hides the visualization.

## `updateSettings` as a dedicated composable function

Rather than mutating `profile.settings` directly in components, a new `updateSettings(id, partial)` function in `useProfiles` handles initialization of the `settings` object (if absent) and merges the partial update. This keeps mutation logic in the composable layer, consistent with the existing architecture.

## `ToggleSwitch.vue` as a reusable component

A small `ToggleSwitch` component was extracted even though only one toggle is needed in V5. The spec calls for additional settings toggles in Iteration 8, and a 28-line component costs less than the effort of extracting it later. It uses `role="switch"` with `aria-checked` for proper semantics.

---

## Iteration 6 decisions

## `CreatureKind` derived from box, not stored

`CreatureKind` ('monster' | 'silver' | 'gold') is computed via `kindForBox(box)` at read time rather than stored as a separate field on `TaskState`. This keeps `box` as the single source of truth: no sync conflict is possible, no migration is needed when the kind changes, and computed values stay up to date automatically via Vue's reactivity.

## Storage version bumped to 4 (not 3)

The spec describes a v2→v3 migration for `monsterType`. However, Iterations 4–5 already introduced a v2→v3 migration for the `showVisualization` bug fix, leaving the current app at version 3. The monsterType migration therefore becomes v3→v4 to avoid overwriting the existing migration chain.

## No "demotion" animation

When a hero falls back to box 1 (wrong answer in box 4 or 5), no animation is shown. Showing punishment feedback contradicts the app's pedagogy ("Lernpartner, keine Feinde") and interrupts the learning flow. The child discovers the change passively if they browse the Monsters collection. This is intentional.

## `monsterType` assigned randomly, not semantically

Monster designs could theoretically correlate with difficulty or operand values, but there is no pedagogical benefit to doing so. Random permanent assignment is simpler, produces natural visual variety in the grid, and avoids the need for a lookup table. The assignment is stable: once set (at profile creation or migration), it never changes.

## Promotion animation pauses auto-advance for correct answers

Normally a correct answer immediately advances to the next task (toast + onNext). When the answer triggers a promotion (previousKind → silver/gold), the feedback phase is shown instead so `DefeatAnimation` is visible. Without this, the animation would be shown on the new task's input screen, which is confusing. The cost: one extra tap ("Weiter") for promotions — acceptable given they're infrequent.

## `DefeatAnimation` uses fixed-duration timeouts, not CSS `animationend`

The animation has four phases triggered by `setTimeout` rather than listening to `animationend` events. This avoids brittle multi-event coordination across several animated elements and handles `prefers-reduced-motion` cleanly (animations are suppressed but timeouts still fire).

## `ensureAllSmallTableTasks` adds `monsterType: 0` to synthesized tasks

The function creates fallback TaskState objects used only for Leitner weight calculation (not persisted). Adding `monsterType: 0` satisfies the now-required field without a semantic meaning — the value is never read in selection logic.

---

## Iteration 7 decisions

## Division als eigener Item-Pool, kein geteilter Leitner-State mit Multiplikation

Eine Division wie `56 ÷ 7` hätte logisch denselben Leitner-State wie die Multiplikation `7 × 8` teilen können — das Kind „kann" ja im Kopf beides, wenn es eines kann. Wir wählen bewusst **separate States**: kognitiv ist „Wie viel ist 56 geteilt durch 7?" eine andere Abrufrichtung als „Wie viel ist 7 mal 8?". Empirisch klappt eine Richtung oft besser als die andere. Separate Items machen den Fortschritt in jeder Richtung sichtbar und vermeiden Übersprung-Effekte („Ich beherrsche `7×8`, also auch `56÷7`" — gilt nur theoretisch).

## 360 Items pro Profil statt 180

Konsequenz aus „Division als eigener Pool". Das verlangsamt die Monster-Counter-Reduktion, aber Tabs (Mul/Div) im Monsters-Screen halten den Fortschritt pro Operation sichtbar. Pädagogisch wichtiger als die schnelle Counter-Reduktion.

## Kein Operations-Präfix in Aufgaben-IDs

Die Spec erwähnt `m:7x8` als möglich. Wir wählen stattdessen: Mul-IDs bleiben `7x8`, Div-IDs nutzen `56÷7`. Das Trennzeichen (`x` vs. `÷`) ist bereits eindeutig. Vorteil: **bestehende IDs aus Iter. 1–6 bleiben unverändert gültig** — die Migration braucht keine Umbenennung, nur ergänzende Inserts.

## Range „gross" inkludiert „klein"

`taskIdsForConfig('mul', 'large')` enthält die 81 IDs aus `('mul', 'small')`. Wer „gross" wählt, will alles üben — würden wir nur b=10..20 zeigen, wäre die Auswahl willkürlich beschränkt. Intuitiver: gross = der ganze Pool, klein = nur einfacher Anteil.

## Storage-Version `5` (statt `4` wie Spec sagt)

Die Spec beschreibt eine Migration v3 → v4. In diesem Projekt war Iter. 6 bereits auf v4 (siehe „Storage version bumped to 4" in Iter. 6 oben). Die Iter.-7-Migration ist daher v4 → v5, um die bestehende Kette nicht zu überschreiben.

## `useVisualization.ts` durch `utils/visualization.ts` ersetzt

Der Hook-Wrapper hatte keinen reaktiven State, war also unnötiger Indirektion. Pure Funktion in `utils/` ist testbarer und ohne Vue-Overhead. `Visualization.vue` importiert `partition` und `decompose` direkt.

## Color-Slots: A/B/C/D → FF/FR/RF/RR + FT/RT

Mit dem neuen 10er-Block stieg die Anzahl möglicher Block-Typen von 4 auf 6. Statt willkürlicher Buchstaben (E, F, …) kodieren die zwei Zeichen jetzt die Segment-Magnitude: erstes Zeichen = a-Achse (F=5er, R=Rest, a hat nie 10er da a∈1..9), zweites = b-Achse (T=10er, F=5er, R=Rest). Lesbarer und im Code selbstdokumentierend.

## Pool-Filter in `selectNextTask` via `poolIds`-Parameter, kein Default auf SMALL_TABLE_TASK_IDS in Produktion

`selectNextTask` akzeptiert `poolIds?: readonly string[]`. Default fällt auf `SMALL_TABLE_TASK_IDS` zurück — nur für die bestehenden Tests aus Iter. 4. In Produktion ruft `useTaskSelector.next()` immer mit explizitem `poolIds` von `taskIdsForConfig()` auf. Vorteil: alte Tests laufen ohne Anpassung, neuer Code ist explizit.

## Session-Repeats sind pool-gefiltert

`selectNextTask` filtert fällige Repeats nach `poolIds`. Begründung: eine falsch beantwortete Mul-Aufgabe in einer früheren Session-Phase darf in einer neuen Div-Session nicht als Repeat erscheinen. Da Repeats sowieso nur innerhalb einer Session leben und `useTaskSelector.reset()` sie beim Start jeder Session leert, ist das Pool-Filter primär eine Defensive (z.B. falls jemand Pool-Switching innerhalb einer Session implementiert).

## Tabs in Monsters-/Heroes-Screen, nicht zwei getrennte Screens

Zwei Tabs (Mul/Div) statt zwei Routes — flacher Navigationsbaum, schnellerer Wechsel. Tab-State wird lokal im `ref` gehalten, **nicht persistiert**: der Default ist beim Öffnen die Operation mit den meisten Items (da liegt die Arbeit). Es gibt kein `lastTab` im Profil.

## CreatureCard zeigt Operations-Symbol kompakt oben rechts

Klein, dezent, mit Hintergrund-Pille. Hilft beim Tab-Wechsel die Orientierung zu behalten und vermeidet Verwechslungen bei ähnlich aussehenden Faktoren (z.B. Mul `7 × 8` vs. Div `56 ÷ 7` haben beide das Monster für „7 / 8").

## DefeatAnimation erhält `display`-String statt `a`/`b`

In Iter. 6 zeigte die Animation `${a} × ${b} ist jetzt ein Silberheld`. Für Div-Aufgaben wäre das verwirrend (`7 × 8` als Label bei einer `56 ÷ 7`-Aufgabe). Lösung: Component nimmt jetzt `display: string` — funktioniert für Mul, Div und potenzielle weitere Operationen ohne weitere Anpassung.

## Visualisierung bei Division: identisches Rechteck wie Mul

Für `56 ÷ 7` wird `partition(7, 8)` aufgerufen — dasselbe Bild wie für `7 × 8`. Pädagogisch wertvoll: Division wird als „gegebene Fläche, gesuchte Seitenlänge" sichtbar. Code-Vereinfachung: `Visualization.vue` braucht keine Operation-Kenntnis, nimmt nur `a` und `b`.

## Default Operation/Range für neue Profile: `mul` + `small`

Sanfter Einstieg ins kleine 1×1. Die Voreinstellung wirkt nur bei der allerersten Session — danach merkt sich `lastSessionOperation`/`lastSessionRange` die zuletzt gewählte Konfiguration pro Profil.
