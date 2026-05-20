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
