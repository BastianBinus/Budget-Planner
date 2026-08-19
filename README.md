# BudgetPlanner

Persönliche Budgetplanungsapp — Ausgaben erfassen, pro Kategorie planen, Sparziele verfolgen.
Als installierbare **PWA** (Handy + PC) mit Sync über Supabase.

## Tech-Stack

- **React + Vite + TypeScript** (PWA via `vite-plugin-pwa`)
- **Tailwind CSS** mit Light/Dark-Theme (Teal-Akzent)
- **Recharts** für Diagramme (ab Phase 5)
- **Supabase** für Auth (E-Mail + Passwort, mehrere Konten), Datenbank und Sync

## Setup

```bash
npm install
cp .env.example .env   # Supabase-URL und Anon-Key eintragen
npm run dev
```

Die App läuft ohne Supabase-Konfiguration im Shell-Modus (nur Navigation/Theme), gibt aber
eine Konsolen-Warnung aus. Für Auth und Daten die `.env` befüllen (siehe `.env.example`).

## Scripts

| Script              | Zweck                                  |
|---------------------|----------------------------------------|
| `npm run dev`       | Dev-Server (Vite)                      |
| `npm run build`     | Typecheck + Production-Build           |
| `npm run preview`   | Production-Build lokal ansehen         |
| `npm run typecheck` | `tsc --noEmit` (Typprüfung)            |

## Projektstruktur

```
src/
  main.tsx            App-Einstieg
  App.tsx             Router (Dashboard/Transaktionen/Budget/Ziele)
  index.css           Tailwind + Theme-Tokens (Light/Dark CSS-Variablen)
  lib/
    theme.tsx         ThemeProvider + useTheme (Light/Dark-Toggle)
    supabase.ts       Supabase-Client
  components/
    AppLayout.tsx     Header (Theme-Toggle) + Outlet + BottomNav
    BottomNav.tsx     Tab-Leiste (Feather/Lucide-Icons)
    PagePlaceholder.tsx  Platzhalter bis die Feature-Seiten gebaut sind
  pages/
    Dashboard.tsx  Transactions.tsx  Budget.tsx  Goals.tsx
```

## Roadmap (Phasen)

- [x] **Phase 0** — Scaffold: PWA, Theme-Toggle, Navigation, App-Shell
- [x] **Phase 1** — Auth (Supabase E-Mail + Passwort, mehrere Konten)
- [x] **Phase 2** — Datenbank & Kategorien (Tabellen, RLS, Default-Kategorien, TS-Typen)
- [x] **Phase 3** — Transaktionen (Erfassen/Bearbeiten/Löschen, Liste, Modal-Formular)
- [x] **Phase 4** — Budget (Monats-Limit pro Kategorie, Ampel, Monats-Zusammenfassung)
- [x] **Phase 5** — Dashboard mit Diagrammen (Bilanz, Verlauf, Donut, Budget, Sparziele)
- [x] **Phase 6** — Sparziele (Ziele anlegen/bearbeiten/löschen, Einzahlungen, Fortschritt)
- [ ] **Phase 7** — Wiederkehrende Buchungen (Fixkosten)
- [ ] **Phase 8** — Offline/Sync-Härtung

Design-Dokument: `docs/superpowers/specs/2026-08-18-budgetplanner-design.md`
