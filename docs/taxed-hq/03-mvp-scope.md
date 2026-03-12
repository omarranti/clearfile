# Taxed HQ MVP Scope

## Goal
Ship a focused MVP that proves users can create projects, compare scenarios, and gain actionable tax clarity quickly.

## In-Scope Features

### 1) Project Workspace
- Create project from template.
- Save, edit, duplicate, archive project.
- Show project status (`draft`, `complete`, `needs-review`).
- Persist assumptions, outputs, and timestamp.

### 2) Scenario Lab (Compare View)
- Clone any project scenario.
- Edit selected inputs and recompute outputs.
- Side-by-side comparison table with:
  - Effective rate
  - Est. total tax
  - Monthly take-home
  - Refund/owed risk
- Delta badges (`+/-` amount and `%` change).

### 3) Explanation Layer
- \"Why changed\" cards tied to:
  - Marginal bracket exposure
  - Withholding assumptions
  - Pre-tax contribution effects
- Keep to max 3 cards per scenario result.

### 4) Guided Action Layer
- Auto-generated checklist from output state.
- Single-click \"mark complete\" for each item.
- Confidence check prompt after each project completion.

### 5) Basic Progress Tracking
- Project count
- Completed checklist count
- Last activity timestamp

## Out of Scope (Post-MVP)
- Native mobile app
- Real-time payroll integrations
- Community features and cohort tooling
- AI personalized tutoring beyond static explanation cards
- Advanced gamification system (streak economy, quests, reward store)

## UX Requirements
- Time-to-first-project under 4 minutes.
- Time-to-first-comparison under 8 minutes.
- Mobile-first layout must support all core flows.
- User can complete full flow without external tax terminology knowledge.

## Data Model (MVP-Level)
- **User**
  - `id`, `createdAt`, `planTier`
- **Project**
  - `id`, `userId`, `templateId`, `name`, `status`, `createdAt`, `updatedAt`
- **Scenario**
  - `id`, `projectId`, `label`, `inputPayload`, `outputPayload`, `isBaseline`, `createdAt`
- **ChecklistItem**
  - `id`, `projectId`, `text`, `completed`, `completedAt`

## Core User Flows
1. **New user:** onboarding -> choose template -> fill inputs -> view outputs -> save project.
2. **Comparison flow:** duplicate baseline -> modify assumptions -> compare outcomes -> save preferred scenario.
3. **Action flow:** review checklist -> mark actions -> submit confidence prompt.

## Success Criteria for MVP
- >= 60% of new users create first project.
- >= 40% of project creators use compare mode at least once.
- Median time-to-first-insight < 10 minutes.
- >= 30% week-1 return rate among activated users.
