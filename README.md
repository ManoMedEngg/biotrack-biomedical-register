# BioTrack Biomedical Equipment Register

An offline single-page register for biomedical engineering teams.

## Included modules

- Equipment search, create, edit and remove
- Sortable equipment columns for department, name, make and model
- Per-device lifecycle history for installation, general checks, breakdowns, calibration, company visits and preventive maintenance
- Searchable, sortable stock balances and movement history, including the supplied vendor, contact and product records
- Daily engineering logbook
- Team roles, comments and account/theme settings
- Excel and Word downloads

The supplied stock sheet is imported once into local storage as received stock movements. The import adds records without replacing existing stock data; stock searches and sortable columns are available for both balances and movement history. For an existing Supabase deployment, run `supabase-stock-contact-migration.sql` to add the optional supplier-contact fields without changing existing records.

## Storage and collaboration

The current version stores records in the browser on the device where it is opened. This is suitable for an offline single-device workflow and can retain dated records for 100 years within its permitted date fields, provided browser data is not cleared.

For genuinely centralized multi-user editing across devices, connect the app to a secured shared database and authentication service such as Supabase, Firebase, or an internal hospital server. Do not use a public repository as a patient- or hospital-data database.

## Central login and shared database

The project includes `supabase-schema.sql` and `supabase-config.js` for a secure shared deployment.

1. Create a Supabase project and enable Email/Password authentication. Disable public user sign-ups in Supabase Auth settings. Create the Boss account under Authentication > Users.
2. Run `supabase-schema.sql` in the Supabase SQL editor.
3. Run `supabase-boss-bootstrap.sql` in the Supabase SQL editor. It creates or promotes the configured Boss profile; set or reset the Boss password in the dashboard if needed.
4. The project URL and publishable key are set in `supabase-config.js`. In Supabase Auth URL Configuration, allow the deployed app URL as a redirect URL; set `authRedirectUrl` to that same URL if the default is not correct.
5. Deploy `supabase/functions/create-viewer/index.ts` as the `create-viewer` Edge Function. Ensure it has the Supabase URL, anon key, and service-role key in its environment; never put the service-role key in this repository or the browser.
6. Sign in as the configured Boss, open **Settings**, and choose **Create account** to provision staff. Viewer accounts can read and export records but cannot change them. Public sign-ups should remain disabled; unprovisioned users have the `pending` role and cannot access records.

Passwords remain in Supabase Auth and are never stored in this repository or the web page. Change temporary passwords before sharing them with staff.

Users who forget a password can choose **Forgot password?**, enter their account email, and follow Supabase's recovery email link. The new password must be at least 12 characters; the recovery link must return to an allowed app URL.

## Run locally

Open `index.html` in a modern browser. No installation is required.
