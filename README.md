# BioTrack Biomedical Equipment Register

An offline single-page register for biomedical engineering teams.

## Included modules

- Equipment search, create, edit and remove
- Per-device lifecycle history for installation, general checks, breakdowns, calibration, company visits and preventive maintenance
- Stock maintenance with material receipts, issues and available balance
- Daily engineering logbook
- Team roles, comments and an editor alert center
- Excel and Word downloads

## Storage and collaboration

The current version stores records in the browser on the device where it is opened. This is suitable for an offline single-device workflow and can retain dated records for 100 years within its permitted date fields, provided browser data is not cleared.

For genuinely centralized multi-user editing and cross-device notifications, connect the app to a secured shared database and authentication service such as Supabase, Firebase, or an internal hospital server. Do not use a public repository as a patient- or hospital-data database.

## Central login and shared database

The project includes `supabase-schema.sql` and `supabase-config.js` for a secure shared deployment.

1. Create a Supabase project and enable Email/Password authentication.
2. Run `supabase-schema.sql` in the Supabase SQL editor.
3. Put the project URL and anon key into `supabase-config.js`.
4. Have Manoj sign up with `manojmedengg@gmail.com`, then create his `boss` profile using the final SQL comment in the schema.
5. Add every senior as an `editor` or `commenter`. Editors can update records; commenters can view and leave notes.

Passwords remain in Supabase Auth and are never stored in this repository or the web page.

## Run locally

Open `index.html` in a modern browser. No installation is required.
