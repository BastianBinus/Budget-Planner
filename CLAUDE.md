# BudgetPlanner — Projekt-Regeln

Persönliche Budgetplanungs-PWA. Ergänzt die globalen Regeln in `~/.claude/CLAUDE.md`.

## Stack

React + Vite + TypeScript (PWA), Tailwind CSS, Recharts, Supabase (Auth Magic-Link + Postgres + Sync).
Paketmanager: **npm**. Währung fest **EUR**. Ein einzelner Nutzer (kein Multi-User-UI).

## Konventionen

- **Theme-Tokens statt Hex im Markup:** Farben über die Tailwind-Semantik-Klassen
  (`bg-bg`, `bg-card`, `text-text`, `text-muted`, `text-accent`, `border-border`) nutzen.
  Diese lesen CSS-Variablen aus `src/index.css` (Light/Dark). Ampel: `text-ok/warn/over`.
- **Icons:** `lucide-react` (Feather-Style), Standard `strokeWidth={2}`.
- **Mobile-first:** max. Breite `max-w-md`, Bottom-Nav, `env(safe-area-inset-*)` beachten.
- Ein Anliegen pro Datei; Feature-Seiten unter `src/pages`, Bausteine unter `src/components`.

## Supabase

- Schema-Änderungen nur über Migrations (`mcp__claude_ai_Supabase__apply_migration`), nie ad-hoc.
- **RLS auf jeder Tabelle** — alle Zeilen tragen `user_id = auth.uid()`.
- Vor Migrationen aktuelle Struktur mit `list_tables` lesen. `service_role`-Key nie ins Frontend.
- Secrets nur in `.env` (nicht committen); Client nutzt ausschließlich den Anon-Key.

## Definition of Done pro Phase

`npm run typecheck` = 0 Fehler, `npm run build` grün, App startet im Dev-Server ohne Konsolenfehler,
Feature manuell im Browser (auch mobiler Viewport) durchgetestet. README-Roadmap-Haken setzen.

## Phasen

Siehe `docs/superpowers/specs/2026-08-18-budgetplanner-design.md`. Aktuell: Phase 0 (Scaffold).
