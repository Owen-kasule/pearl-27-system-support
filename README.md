# Pearl 27 System Support

A focused support ticket application for Pearl 27 employees who need help with their Sphere accounts. Employees can submit a request with one private attachment, while authorized System Support staff can review, progress, and resolve tickets from a protected dashboard.

## Features

- Public, mobile-friendly support request form with client and server validation
- Drag-and-drop or mobile file selection for PNG, JPG, WEBP, and PDF attachments up to 5 MB
- Image previews and removable file selections
- Concurrency-safe `P27-000001` ticket numbers backed by a PostgreSQL sequence
- Confirmation and resolution emails through Resend
- Optional new-ticket notification for the System Support inbox
- Supabase Auth admin login with `ADMIN` and `DEVELOPER` roles
- Protected dashboard, summary totals, recent requests, search, and status filters
- Private attachment storage with short-lived signed URLs
- Transactional status updates that send the resolved email only on a transition into `RESOLVED`
- Responsive ticket cards on mobile and a table on larger screens

## Tech stack

Next.js App Router, strict TypeScript, React, Tailwind CSS, Supabase PostgreSQL/Auth/Storage, Resend, Zod, Lucide React, and Vitest.

## Architecture

For requests without a file, the browser submits form data to `POST /api/tickets`. For requests with a file, the server first validates the text and file metadata, generates an expiring signed upload authorization, and the browser uploads directly to the private Supabase bucket. This avoids Vercel's 4.5 MB Function payload ceiling while preserving the required 5 MB file limit. The browser then sends a tamper-resistant finalization token to the server; the server downloads and verifies the stored bytes, inserts the ticket, and attempts email delivery. An email failure is logged safely and never removes a valid ticket.

Public database reads and writes are denied by RLS. The public route uses the service-role client only on the server. Authenticated admin pages use the user's Supabase session and RLS policies tied to a matching `profiles` row. Status changes go through a PostgreSQL function that locks the ticket row, enforces resolution notes, records resolution metadata, and returns whether this update was the first transition into `RESOLVED`.

## Local development

Requirements:

- Node.js 20.9 or newer
- npm
- A Supabase project
- A Resend account for email delivery (the app still saves tickets when Resend is not configured)

Install dependencies and prepare the environment:

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local`, then start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin login is at [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL used in admin notification links |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL; safe for browser use |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key; safe for browser use with RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key used by the controlled public submission route |
| `RESEND_API_KEY` | Server-only Resend API key |
| `EMAIL_FROM` | Verified sender, for example `Pearl 27 Support <support@your-domain.com>` |
| `SYSTEM_SUPPORT_EMAIL` | Optional team inbox notified when a ticket is submitted |

Never prefix the service-role or Resend key with `NEXT_PUBLIC_`. Do not commit `.env.local`.

## Supabase setup and migrations

Link the local repository to the intended Supabase project and apply the migration:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Alternatively, copy [the migration](./supabase/migrations/202609010001_initial_support_schema.sql) into the Supabase SQL editor and run it once.

The migration creates:

- `ticket_status` and `support_role` enums
- `profiles` and `tickets` tables
- the ticket-number sequence and restricted generation function
- the atomic ticket status function
- timestamps, constraints, indexes, and RLS policies
- the private `support-attachments` bucket with MIME and size limits

### Storage setup

The migration creates `support-attachments` as a private bucket. Do not change it to public. Server submissions upload to `tickets/<ticket-uuid>/<safe-file-name>`. Authorized staff receive signed links that expire after one hour.

## Admin account setup

There is no public admin registration and no default login or password. This is intentional: the repository never ships with a working privileged credential.

1. In Supabase, open **Authentication → Users → Add user**.
2. Create the user securely with the intended support email and a strong temporary password.
3. Copy the user's UUID.
4. In the SQL editor, add the matching profile:

```sql
insert into public.profiles (id, full_name, role)
values ('AUTH_USER_UUID', 'Full Name', 'ADMIN');
```

Use `DEVELOPER` instead of `ADMIN` for a developer account. Both roles can manage tickets in this assessment version. Remove access by disabling/deleting the Auth user and its profile through the Supabase dashboard.

### One-command admin bootstrap

After applying the database migration, add these one-time values to `.env.local` alongside the Supabase URL and service-role key:

```dotenv
ADMIN_EMAIL=support.admin@pearl27.com
ADMIN_PASSWORD=replace-with-a-strong-unique-password
ADMIN_FULL_NAME=System Support Administrator
```

The password must be at least 12 characters and contain uppercase, lowercase, numeric, and symbol characters. Create the account with:

```bash
npm run admin:create
```

The command creates the Supabase Auth user, confirms its email, and adds the required `ADMIN` profile. Remove `ADMIN_PASSWORD` from `.env.local` immediately afterward. Never add these one-time bootstrap variables to Vercel.

## Sample data

The repository includes six fictional tickets in `supabase/seed.sql`, covering Submitted, In Progress, and Resolved states. All sample addresses end in `.example`, a reserved non-deliverable domain.

Load the samples into a local or staging project only:

```bash
npx supabase db reset
```

For a linked staging project, copy `supabase/seed.sql` into the Supabase SQL editor and run it after the migration. Do not load sample tickets into production. The sample ticket numbers occupy `P27-000001` through `P27-000006`; the seed advances the number sequence so the next real request receives `P27-000007` or higher.

## Resend setup

1. Verify the sending domain in Resend.
2. Create an API key and store it as `RESEND_API_KEY`.
3. Set `EMAIL_FROM` to an address on the verified domain.
4. Optionally set `SYSTEM_SUPPORT_EMAIL`.
5. Set `NEXT_PUBLIC_APP_URL` to the deployed URL so team notifications link to the correct ticket.

If any email attempt fails, the ticket or status update remains saved. The server logs only a generic delivery failure and does not expose employee content or provider responses.

## Testing and quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Unit tests cover required fields, email validation, allowed and rejected files, resolution-note enforcement, ticket email contents, and HTML escaping. Before release, also run an integration pass against a non-production Supabase project: submit a real ticket and file, sign in as a profile-backed admin, open its signed attachment, move it to In Progress, resolve it, and confirm that both emails arrive.

## Vercel deployment

1. Import the Git repository into Vercel as a Next.js project.
2. Add every environment variable from `.env.example` for Production and Preview as appropriate.
3. Set `NEXT_PUBLIC_APP_URL` to the production domain.
4. Apply the Supabase migration before accepting submissions.
5. Deploy, then complete the integration pass above.

No custom Vercel configuration is required. The API routes use the Node.js runtime for multipart files and Resend.

## Security notes

- Public visitors cannot select or update tickets through Supabase.
- Private attachments have no public read policy.
- Admin authorization is checked both by the application and PostgreSQL RLS.
- Ticket numbers are deliberately public-facing identifiers; UUIDs remain internal.
- User text is rendered as React text, and email templates HTML-escape it.
- The server checks both declared MIME type and leading file signature.
- Expected failures return human-readable messages rather than raw provider errors.

## Known limitations

- One attachment per ticket, as required by the assessment scope.
- No employee login or ticket portal.
- No assignment, priority, comments, SLA engine, analytics, or audit-log system.
- Email is best-effort and has no background retry queue; provider outages are logged for operational follow-up.
- The endpoints rely on platform and provider controls rather than a dedicated rate-limit service. Add Vercel Firewall or a small rate limiter if abuse becomes a real concern.
- A direct upload that completes but is never finalized can leave an unreferenced object. Add a scheduled cleanup for old unreferenced `tickets/` objects if this becomes operationally significant.
- Automated tests do not replace live Supabase, Resend, and inbox verification.
