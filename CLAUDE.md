# Monsterknacker — CLAUDE.md

Einmaleins-Lernapp für Kinder. Vue 3 + TypeScript + Vite. Gebaut als **Single-File-HTML** (`dist/index.html`) ohne externe Laufzeit-Abhängigkeiten.

**Sprache:** Alle UI-Texte auf Deutsch (CH). Code und Kommentare auf Englisch oder Deutsch — beides ist ok, Konsistenz innerhalb einer Datei bevorzugt.

---

## Befehle

```bash
npm run dev        # Dev-Server (localhost:5173)
npm run build      # vue-tsc --noEmit && vite build → dist/index.html
npm run lint       # ESLint (.ts, .vue)
npm run format     # Prettier (formatiert, committe danach)
npm run preview    # Vorschau des Build-Artefakts
```

**Vor jedem Commit prüfen:**
```bash
npm run lint && npx vue-tsc --noEmit && npm run build
```
Alle drei müssen fehlerfrei durchlaufen. Die zwei ESLint-Warnings in `useStorage.ts` (Stub-Parameter `_data`, `_fromVersion`) sind bekannt und akzeptiert.

---

## Projektstruktur

```
src/
├── App.vue                        # Screen-Router (profile-selector | home | practice)
├── main.ts                        # Vue-App mount
├── types/
│   └── index.ts                   # Alle geteilten Interfaces & Typen
├── composables/
│   ├── useStorage.ts              # localStorage load/save (AppData)
│   ├── useProfiles.ts             # Singleton-State, Profil-CRUD + recordTaskAttempt
│   └── useTaskGenerator.ts        # Zufalls-Aufgaben-Generator (1×1, kein State)
├── components/
│   ├── ProfileSelector.vue        # Profilauswahl / -erstellung (Startscreen)
│   ├── ProfileCard.vue            # Einzelne Profilkarte
│   ├── ProfileEditDialog.vue      # Modal: Profil anlegen / bearbeiten / löschen
│   ├── EmojiPicker.vue            # Emoji-Auswahl-Grid (24 Optionen)
│   ├── ConfirmDialog.vue          # Bestätigungs-Modal (z.B. Löschen)
│   ├── HomeScreen.vue             # Startbildschirm nach Profilwahl
│   ├── PracticeSession.vue        # Übungs-Session-Orchestrator (Phasen: input→feedback→summary)
│   ├── TaskDisplay.vue            # Aufgaben-Anzeige «a × b = ?»
│   ├── AnswerInput.vue            # Eingabefeld + OK-Button
│   ├── AnswerFeedback.vue         # ✓/✗-Feedback nach Antwort
│   └── SessionSummary.vue        # Abschlussbildschirm einer Session
└── styles/
    └── main.css                   # Globale CSS-Custom-Properties + Reset
```

---

## Architektur

### Screen-Flow
```
ProfileSelector → HomeScreen → PracticeSession → (SessionSummary innerhalb PracticeSession)
                      ↑_____________↓ (exit)
```
`App.vue` hält `currentScreen: 'profile-selector' | 'home' | 'practice'`. Der Wechsel zu `'practice'` ist durch einen Guard abgesichert (aktives Profil muss existieren).

### State-Management
Kein Pinia. `useProfiles` hält seinen `state` auf Modul-Ebene als `reactive<AppData>`. Alle Komponenten, die `useProfiles()` aufrufen, teilen dieselbe Instanz. Ein `watch(state, ..., { deep: true })` persistiert automatisch nach jeder Änderung.

### Persistenz
`localStorage` unter dem Key `monsterknacker`. Format: `AppData` (JSON). Version aktuell `1`. Migration-Stub in `useStorage.ts` vorhanden für künftige Versionssprünge.

### Komponenten-Prinzip
- **Orchestrator-Komponenten** (`PracticeSession`, `ProfileSelector`) halten State und rufen Composables auf.
- **UI-Bausteine** (`TaskDisplay`, `AnswerInput`, `AnswerFeedback`, `SessionSummary`) sind dumm: nur Props rein, Events raus, kein Zugriff auf Profile-State.
- Persistenz-Verantwortung gehört ins Composable, nicht in UI-Komponenten.

---

## Datenmodell

```typescript
// src/types/index.ts

interface AppData {
  version: number;           // aktuell 1
  activeProfileId: string | null;
  profiles: Profile[];
}

interface Profile {
  id: string;                // crypto.randomUUID()
  name: string;              // 1–20 Zeichen
  emoji: string;             // aus AVAILABLE_EMOJIS
  createdAt: number;         // Unix ms
  settings?: ProfileSettings;
  tasks?: TaskMap;           // Key: "AxB" z.B. "7x8", seit Iteration 2
  stats?: Record<string, unknown>;
}

interface TaskState {
  attempts: number;
  correct: number;
  lastAttemptAt?: number;    // Unix ms
  box?: number;              // Leitner-Fach, ab Iteration 4
  monsterType?: number;      // Monster-Design, ab Iteration 6
}

type TaskMap = Record<string, TaskState>;

interface Task {              // aus useTaskGenerator, nicht persistiert
  id: string;                // "AxB" z.B. "7x8"
  a: number;                 // 1–9
  b: number;                 // 1–9
  answer: number;            // a * b
}
```

**Aufgaben-ID-Format:** `"${a}x${b}"` — `7x8` und `8x7` sind **separate** Aufgaben.

---

## CSS-Konventionen

Globale Custom Properties in `src/styles/main.css`:

```css
--color-bg, --color-surface, --color-primary, --color-primary-dark
--color-text, --color-text-muted
--color-success, --color-danger
--color-feedback-correct, --color-feedback-wrong   /* #22c55e / #ef4444 */
--color-task-display                               /* #1f2433 */
--font-size-task, --font-size-task-mobile          /* 4rem / 3rem */
--radius, --shadow
```

Komponenten-Styles sind **scoped**. Keine globalen Klassen in Komponenten einführen.

Touch-Targets: Buttons mindestens `44px`, idealerweise `56px` Höhe.

Practice-Screen und Summary nutzen `100dvh` (nicht `100vh`) für korrekte Darstellung auf Mobile mit sichtbarer Adressleiste.

---

## TypeScript-Regeln

- `verbatimModuleSyntax` ist aktiv → **immer `import type { … }`** für reine Typ-Imports.
- `strict: true`, `noUnusedLocals`, `noUnusedParameters` — keine unbenutzten Variablen.
- Typ-Assertions (`as`) nur wenn wirklich nötig und begründet.

---

## Wichtige Implementierungsdetails

### AnswerInput
- `type="text"` mit `inputmode="numeric"` — **kein** `type="number"` (verhindert Spinner und Scroll-Probleme).
- Nicht-Ziffern werden im `@input`-Handler gefiltert.
- Auto-Focus via `onMounted`. Reset durch `:key`-Wechsel in `PracticeSession` (erzwingt Remount).

### PracticeSession Phasen
```
'input' → submit() → 'feedback' → onNext() → 'input'
                                → endSession() → 'summary'
```
`inputKey` (ref, wird bei jedem Taskwechsel inkrementiert) steuert das Remount von `AnswerInput`.

### recordTaskAttempt
Lazy-initialisiert `profile.tasks` und den `TaskState` beim ersten Aufruf. Muss **im Composable** aufgerufen werden, nicht direkt in der Komponente.

### Dialog-Stacking
`ConfirmDialog` hat `z-index: 200`, `ProfileEditDialog`-Overlay `z-index: 100`.

---

## Iterationsstand

| Iteration | Inhalt | Status |
|-----------|--------|--------|
| 1 | Profilverwaltung, localStorage, Grundstruktur | ✅ fertig |
| 2 | Aufgaben-Kernschleife, freie Übungs-Session (×, 1–9) | ✅ fertig |
| 3 | – | 🔜 offen |
| 4 | Leitner-System, adaptive Aufgabenauswahl | 🔜 offen |
| 5 | Timer, Schwierigkeitsstufen | 🔜 offen |
| 6 | Monster-Design / Visualisierung | 🔜 offen |
| 7 | Trainingsmodus | 🔜 offen |
| 8 | Session-Zeit-Tracking, Stats | 🔜 offen |

**Noch nicht implementiert:** Division, grosses 1×1 (bis 12), Timer, Leitner-Fächer, Monster/Helden-Visualisierung, Sound.

---

## Entscheidungen & Begründungen

Architektonische Entscheidungen mit Begründung stehen in `DECISIONS.md`. Neue Entscheidungen dort ergänzen, wenn etwas vom offensichtlichen Weg abweicht.
