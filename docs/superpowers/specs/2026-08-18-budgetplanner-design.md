# BudgetPlanner — Design-Dokument

**Datum:** 2026-08-18
**Status:** Abgenommen
**Autor:** Bastian (mit Claude)

## Zweck

Budgetplanungsapp für **mehrere Nutzer** (jeder mit eigenem Konto, Daten strikt getrennt). Sie
verbindet zwei Bedürfnisse: **Ausgaben nachträglich erfassen** (wohin floss das Geld?) und **im
Voraus pro Kategorie planen** (wie viel darf ich ausgeben?). Genutzt wird sie primär am Handy,
gelegentlich am PC, mit **Synchronisierung** zwischen den Geräten.

> Geändert 2026-08-18: ursprünglich als Single-User geplant, auf **Multi-User** erweitert. Das
> Datenmodell trennt bereits alles per `user_id` + RLS, daher keine Schema-Änderung nötig.

Ziel: ein sauberes, installierbares Haushaltsbuch mit Dashboard, Budgets, Sparzielen und
Auswertungen — ohne App-Store, ohne Overhead.

## Tech-Stack

| Bereich      | Wahl                                                        |
|--------------|-------------------------------------------------------------|
| Frontend     | React + Vite + TypeScript, als **PWA** (installierbar)      |
| Styling      | Tailwind CSS mit Light/Dark-Theme                           |
| Charts       | Recharts (Linien-Diagramm Verlauf, Donut Kategorien)        |
| Backend/Sync | Supabase (Auth + Postgres + Realtime), Free Tier            |
| Auth         | Supabase E-Mail + Passwort (Registrieren/Anmelden), Session im localStorage |
| Währung      | EUR (fest)                                                  |

> Auth geändert 2026-08-18: statt Magic-Link **E-Mail + Passwort**. Grund: kein E-Mail-Schritt bei
> jeder Anmeldung; Session bleibt via localStorage erhalten (Supabase-Default). Für sofortige
> Anmeldung nach Registrierung muss im Supabase-Dashboard „Confirm email" deaktiviert sein.

Begründung: Eine PWA gibt eine installierbare Handy-App ohne App-Store; Supabase liefert Auth,
Datenbank und Sync im Free Tier out-of-the-box. Umbau zu React Native später möglich, falls nötig.

## Styleguide (gesperrt)

Light Mode = „Calm Finance" (hell, ruhig), Dark Mode = „Neobank Dark" (dunkel, modern).
**Teal-Akzent in beiden Modi** für ein stimmiges Bild. Umschaltbar per Theme-Toggle.

| Token          | Light                  | Dark                          |
|----------------|------------------------|-------------------------------|
| Hintergrund    | `#f4f6f9`              | `#0c0f17`                     |
| Karte          | `#ffffff`              | Gradient `#161b2b → #121622`  |
| Karten-Border  | weicher Schatten       | `#232838` (1px)               |
| Text primär    | `#1f2937`              | `#e5e7eb`                     |
| Akzent         | `#0f766e` / `#14b8a6`  | `#2dd4bf` / `#14b8a6`         |

Ampel (beide Modi): ok `#14b8a6`, Warnung `#f59e0b`, überschritten `#ef4444`.
Icons: Feather-/Lucide-Stroke-SVGs. Zahlen groß und fett, abgerundete Karten (Radius 12–16px).

## Features & App-Struktur

Bottom-Tab-Navigation mit vier Bereichen: **Dashboard · Transaktionen · Budget · Ziele**.

### 1. Dashboard (Startansicht)
Reihenfolge von oben nach unten (abgenommen):
1. **Monatswahl** — `‹ Monat ›`, blättert durch vergangene Monate
2. **Bilanz-Hero** — „Übrig diesen Monat" groß, darunter Einnahmen und Ausgaben
3. **Linien-Diagramm** — Ausgaben der letzten 6 Monate (Flächenverlauf, aktueller Monat betont)
4. **Donut** — Ausgaben nach Kategorie (Legende + Gesamtsumme in der Mitte)
5. **Budget** — Kategorien mit Ampel-Bars (ok/Warnung/überschritten)
6. **Sparziele** — Fortschrittsbalken

### 2. Transaktionen
Erfassen, bearbeiten, löschen. Felder: Betrag, Datum, Kategorie, Typ (Einnahme/Ausgabe),
optionale Notiz. Chronologische Liste.

### 3. Budget
Monatliches Limit pro Kategorie setzen. Ampel-Anzeige zur Auslastung, berechnet aus den
Ist-Ausgaben des Monats.

### 4. Sparziele
Ziel mit Name, Zielbetrag, Zieldatum. Manuelle Einzahlungen buchen. Fortschrittsbalken.

### Weitere Entscheidungen
- **Kategorien:** sinnvolle Standard-Vorgaben (Lebensmittel, Miete/Fixkosten, Transport,
  Freizeit, Gehalt, Sonstiges), frei editier- und ergänzbar.
- **Fixkosten** = wiederkehrende Buchungen, automatisch monatlich erzeugt (eigenes Feature).
- **Offline-Nutzung:** erwünscht, aber spätere Phase (nicht MVP).

## Datenmodell (Supabase / Postgres)

Alle Tabellen tragen `user_id` (= `auth.uid()`) und haben RLS aktiviert (nur eigene Zeilen).

- **categories** — `id, user_id, name, kind (income|expense), color, icon, sort_order`
- **transactions** — `id, user_id, amount (numeric), date, category_id (FK), kind, note, created_at`
- **budgets** — `id, user_id, category_id (FK), month (date, 1. des Monats), limit_amount`
- **savings_goals** — `id, user_id, name, target_amount, target_date, created_at`
- **savings_contributions** — `id, user_id, goal_id (FK), amount, date`
- **recurring_rules** — `id, user_id, category_id, amount, kind, day_of_month, note, active`
  (erzeugt monatlich eine Transaktion)

Schema-Änderungen ausschließlich über Supabase-Migrations. RLS-Policy auf jeder Tabelle.

## Umsetzungs-Phasen

Jede Phase endet mit einem Debug-/Testpass, bevor die nächste beginnt.

| Phase | Inhalt | Done-Kriterium |
|-------|--------|----------------|
| 0 | Scaffold: Vite+React+TS, Tailwind (Theme + Toggle), PWA-Manifest/SW, Router, App-Shell + Bottom-Nav, Supabase-Client | App startet, Theme-Toggle geht, Tabs navigierbar, `tsc` = 0 |
| 1 | Auth: Magic-Link-Login, Session, geschützte Routen | Login/Logout funktioniert |
| 2 | DB & Kategorien: Migrations + RLS, Default-Kategorien seeden, TS-Typen, Kategorie-CRUD | Tabellen + RLS live, Kategorien editierbar |
| 3 | Transaktionen: CRUD, Liste, Formular | Anlegen/Bearbeiten/Löschen funktioniert |
| 4 | Budget: Limits pro Kategorie/Monat, Ampel aus Ist-Ausgaben | Limit setzen, Ampel korrekt |
| 5 | Dashboard: Hero, Recharts Linie + Donut, Budget-Bars, Sparziel-Fortschritt, Monatswahl | Dashboard zeigt echte Daten, Monatswechsel geht |
| 6 | Sparziele: CRUD, Einzahlungen, Fortschritt | Ziel anlegen, einzahlen, Fortschritt korrekt |
| 7 | Wiederkehrende Buchungen: Regeln, monatliche Auto-Erzeugung | Regel erzeugt Transaktion im neuen Monat |
| 8 (später) | Offline/Sync-Härtung | Offline erfassen, Sync bei Reconnect |

## Verifikation

- `npx tsc --noEmit` = 0 Fehler nach jeder Phase
- App startet via `npm run dev`, geprüft im Browser (inkl. mobiler Viewport)
- Supabase: RLS-Policies mit Advisor prüfen, Sync über zwei Sessions gegenchecken
- PWA: Lighthouse „Installable" grün, auf dem Handy zum Home-Screen testen
- Pro Feature manueller End-to-End-Durchlauf (Transaktion → Dashboard/Chart/Budget)
