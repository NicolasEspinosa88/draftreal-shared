# @draftreal/shared

Pure TypeScript domain rules shared between **DraftReal Web**
(`draftreal`, TanStack Start/Vite/Cloudflare Workers) and **DraftReal
Mobile** (`draftreal-mobile`, Expo/React Native/Metro).

Created as part of mobile's M4.8 — Shared Domain Package, to eliminate real
drift found between the two apps (e.g. mobile had no height/weight range
validation at all while web enforces 140–240 cm / 40–180 kg; achievement
labels and colors were hand-copied between repos).

## What this package IS

- Plain TypeScript: enums/constants, pure validation functions, label maps,
  color tokens, and pure calculations (e.g. the stats radar).
- Framework-agnostic: no React, no React Native, no DOM, no Node-only APIs.
- Side-effect-free on import.
- Client-safe: no secrets, no service_role code, no server-only logic.

## What this package is NOT

- **Not a UI library.** No components, no styles, no navigation. Web and
  mobile render this data completely independently.
- **Not the authorization layer.** Visibility, consent, minors, and audit
  logging remain server-side (`/api/visibility` on web, the equivalent RLS
  policies in Supabase). Nothing here should ever be treated as a security
  boundary — it exists for UX (hints, labels, preliminary/optimistic
  validation), never as the final authority.
- **Not a Supabase client.** No singleton, no queries against a live
  database. If a future version shares query *shapes* (column lists,
  selectors), it will do so as plain data/types with dependency injection,
  never a bundled client instance.

## Modules

| Entry point | Contents |
|---|---|
| `@draftreal/shared/domain` | Player/staff enums (positions, experience levels, availability, staff roles/levels/branches/employment/specialties, team-staff-member roles) + their Spanish display labels |
| `@draftreal/shared/validation` | Player height/weight range validation (140–240 cm, 40–180 kg — confirmed against web's real form bounds), calendar-date validation |
| `@draftreal/shared/achievements` | Achievement type labels, owner-filter labels, and badge colors (hex, not Tailwind classes) |
| `@draftreal/shared/stats` | The 8-axis "Perfil estadístico" radar calculation (pure — no chart library, no SVG rendering beyond a plain polygon-points string) |
| `@draftreal/shared/messaging` | Message content validation (2000-char limit), conversation/message domain enums, and staff message access rules — for the `conversations`/`messages` system only (not the separate `staff_application_conversations` system) |

## Consuming this package

Both web and mobile install this as a **Git dependency pinned to a tag**,
not a branch:

```json
{
  "dependencies": {
    "@draftreal/shared": "github:NicolasEspinosa88/draftreal-shared#v0.1.0"
  }
}
```

npm runs this package's `prepare` script (`tsc` → `dist/`) automatically on
install for Git dependencies — no extra build step required in the
consumer's own CI, Cloudflare build, or EAS build.

To bump versions: tag a new commit here (`v0.1.1`, ...), then update the
`#v0.1.x` pin in each consumer's `package.json` and reinstall. Rollback is
the same operation in reverse.

## Local development

```bash
npm install
npm run build      # emits dist/ + .d.ts
npm test           # vitest — contract tests for every migrated rule
npm run typecheck
```
