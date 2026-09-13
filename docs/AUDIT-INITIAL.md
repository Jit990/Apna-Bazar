# Apna Bazar — Initial audit (evidence-first)

This file captures the initial repository inspection I performed before starting implementation work. It is intentionally concise and evidence-based so follow-up work can reference it.

Repository: Jit990/Apna-Bazar
Branch inspected as "working source": `jit990-polish-admin-dashboard`

Top-level findings (evidence)
- The working application source tree is present on branch `jit990-polish-admin-dashboard` under `src/` (layout, middleware, API routes, components).
- `database/schema.sql` exists and contains a complete schema with triggers and RLS policies; see `database/schema.sql` for details.
- A top-level `src/` entry in `main` appeared empty, but a full implementation exists on `jit990-polish-admin-dashboard` (this explains the README vs main mismatch).
- Public assets were missing an explicit logo — `public/logo.svg` has been added to branch `add/logo-and-env-example`.
- There was no `.env.example` in the repository root; `.env.example` with placeholders has been added to `add/logo-and-env-example`.

Immediate issues to address (priority order)
1. Repo hygiene & onboarding (HIGH)
   - Add `.env.example` (done on `add/logo-and-env-example`).
   - Add a clear audit note and a README pointer to the working source branch (this file + README edit planned).

2. CI / baseline checks (HIGH)
   - Add CI that runs: install, lint, type-check, build, and Playwright e2e on PRs. A CI skeleton branch `infra/ci-playwright` will be created.
   - Run npm audit and secret scans (next step) and report findings.

3. Database singleton enforcement (MEDIUM)
   - `store_settings` intends to be a single-row table but current `CONSTRAINT single_row CHECK (id = id)` is ineffective. Propose a migration that enforces the single-row invariant (recommended: fixed known UUID + trigger or BEFORE INSERT guard). A migration will be prepared in `fix/store_settings-singleton`.

4. Supabase auth & service role usage (HIGH)
   - Confirm server vs client Supabase clients: `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts` exist. Ensure `SUPABASE_SERVICE_ROLE_KEY` is only used in server-side code and never bundled to client builds.
   - Validate middleware `src/middleware.ts` and server-side routes rely on `createClient()` vs `createAdminClient()` appropriately.

5. Razorpay verification & payments (HIGH)
   - Ensure webhook and payment verification use timing-safe HMAC checks (crypto.timingSafeEqual). Payment flows exist under `src/app/api/payments` and `src/app/api/checkout/route.ts` uses `createAdminClient()` — verify implementation and add tests.

6. Admin ↔ Customer sync and transactional integrity (HIGH)
   - Confirm order creation uses DB transactions (create order, decrement stock, create inventory movement, insert order_items). Add server-side validation to prevent oversell — `src/app/api/checkout/route.ts` does perform checks; ensure transactional guarantees.

7. Secret leakage scan (CRITICAL)
   - Search logs (`build*.txt`, `err.log`, `sync.log`, android config) for accidental API keys / tokens. If found, stop and rotate keys. I will run an automated scan and report results.

Planned immediate changes (non-invasive, safe, evidence-first)
- Branch `add/logo-and-env-example` (already created) contains: `public/logo.svg`, `.env.example` (placeholders).
- Create `infra/ci-playwright` to add CI workflow (lint, type-check, build, Playwright e2e) — non-destructive and gated behind PRs.
- Create `docs/AUDIT-INITIAL.md` (this file) and a small README note on PR branch pointing to `jit990-polish-admin-dashboard` as source-of-truth for current app.

Next automated actions I will take (with evidence reported after each step)
1. Create branch `infra/ci-playwright` from `jit990-polish-admin-dashboard` and add `.github/workflows/ci.yml` (basic pipeline). I will report CI run output for PRs.
2. Run a repository secret scan (search across build logs, android config, and other files) and publish the report here. If any secrets are found, I will stop further automation and provide remediation steps.
3. Run `npm ci`, `npm run type-check`, `npm run build` on the `jit990-polish-admin-dashboard` branch via CI (report errors). Fix any high-priority build or type errors in small, targeted commits.

Notes & constraints
- I will never request real secrets via chat. Use Vercel / Supabase / your secret manager to set secrets for CI or preview deploys.
- I will not perform history-rewriting or destructive actions without explicit written approval and a rollback plan.

If you approve, I will now create the CI branch and add the GitHub Actions workflow to run baseline checks and Playwright e2e. After the PR triggers CI, I will report the results and then proceed to fix any high-priority failures discovered.
