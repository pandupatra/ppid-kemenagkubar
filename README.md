# PPID Kemenag Kutai Barat

Frontend foundation for the PPID public-information portal.

## Verified commands

| Command                | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Run the local development server.            |
| `npm run typecheck`    | Run strict TypeScript checks.                |
| `npm run build`        | Create the production build.                 |
| `npm run start`        | Run the production server after a build.     |
| `npm run format`       | Format application source and configuration. |
| `npm run format:check` | Check source and configuration formatting.   |

## UI components

Shared UI lives in `src/components/ui` and uses shadcn/ui with Radix primitives.
Tailwind CSS is integrated through the Vite plugin. The institutional green
theme and responsive page layouts live in `src/styles/global.css`.

Use the shared buttons, fields, notices, badges, navigation, and accordion
components for UI controls. Keep semantic headings, landmarks, and document
metadata in the public page components. Configure component aliases through
`components.json`; `@/` resolves to `src/` in Vite and TypeScript.

With the dev server running, the browser regression check uses synthetic data.
It validates the public request form but does not submit a case:

```powershell
npx.cmd @playwright/cli -s=ppid-shadcn open http://127.0.0.1:3100 --browser chrome
npx.cmd @playwright/cli -s=ppid-shadcn run-code --filename=scripts/verify-ui.js
```

Use the port printed by `npm run dev` in the first command. The check covers
search, required form fields and choices, mobile navigation and focus return,
360 px layouts, reduced motion, and 200% text zoom.

## Public information requests

Visitors do not need an applicant account to submit a request. A successful
submission returns an unguessable receipt number, which the visitor uses at
`/layanan-informasi/lacak` to see its safe status. The receipt is a credential:
do not display it in public lists or logs.

Apply `supabase/migrations/202609090003_add_public_information_request_intake.sql`
before enabling the form in an environment. It creates private request,
applicant-snapshot, and append-only event tables with default-deny RLS. The
application accesses those records only through server functions.

Attachments are intentionally not accepted by this initial intake flow. They
must remain unavailable until private quarantine upload, malware scanning, and
authorized download handling are deployed.

## Current scope

The public homepage and request intake are implemented. The catalog entries are
synthetic UI fixtures and must be replaced by a server-side published-document
repository before release.

Official logo assets, contact details, published content, legal copy, and
service-policy values remain dependent on approval from their owners.

## Admin access

Staf PPID masuk melalui `/masuk`. Form tersebut meneruskan verifikasi kredensial
ke deployment Better Auth Kemenag Kutai Barat, lalu membuat cookie sesi HTTP-only
untuk portal PPID. Set `KEMENAG_AUTH_ORIGIN` ke origin deployment tersebut
(contoh: `https://kemenagkubar.go.id`); nilai ini hanya dibaca di server.

`/admin` verifies the existing server-side session against `public.session`
and requires an active `ppid.staff_memberships` role. It never relies on the
legacy global `user.role` column. The default Better Auth cookie names are
supported; set the server-only `AUTH_SESSION_COOKIE_NAME` environment variable
when the existing authentication deployment uses a custom cookie name.

The migration `202609080001_add_ppid_staff_access_and_audit.sql` creates the
membership and audit tables. An authorized operator must assign staff roles
before an account can access the dashboard; no membership is seeded by the
application.
