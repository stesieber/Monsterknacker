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
