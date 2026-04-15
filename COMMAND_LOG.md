# Command Log

This file keeps a running note of the shell commands used during the project so you can review the workflow and understand the tooling used.

## Commands Used So Far

### Workspace and Folder Checks

```bash
pwd
ls -la
ls -la /Users/anshulchauhan
ls -la /Users/anshulchauhan/Calendly\ Clone
```

Purpose:

- Confirm current working directory
- Check whether the project folder exists
- Check whether files exist inside the project folder

### Assignment File Inspection

```bash
ls -l /Users/anshulchauhan/Downloads/Scaler_SDE_Intern_Fullstack_Assignment_-_Calendly_Clone.docx
textutil -convert txt -stdout /Users/anshulchauhan/Downloads/Scaler_SDE_Intern_Fullstack_Assignment_-_Calendly_Clone.docx
```

Purpose:

- Confirm the assignment file exists
- Extract readable text from the `.docx` file

### Environment and Tooling Checks

```bash
node -v
npm -v
git status --short
```

Purpose:

- Confirm the local Node.js and npm versions
- Check whether the workspace was already a Git repository

### Project Scaffolding

```bash
npm create vite@latest client -- --template react
mkdir -p server
npm init -y
mkdir -p client/src/components/layout client/src/pages client/src/components/common server/src/config server/src/controllers server/src/middleware server/src/routes server/src/services server/src/utils server/src/lib server/prisma
```

Purpose:

- Scaffold the React frontend with Vite
- Create the backend folder
- Initialize the backend `package.json`
- Create the frontend and backend source structure that matches the app plan

### Dependency Installation

```bash
npm install react react-dom react-router-dom axios date-fns date-fns-tz
npm install express cors dotenv zod @prisma/client date-fns date-fns-tz
npm install -D prisma nodemon
npm install @prisma/adapter-pg pg
npm install @prisma/adapter-neon @neondatabase/serverless
npm uninstall @prisma/adapter-pg pg
npx prisma db push --accept-data-loss
node --env-file=.env -e "const {Client}=require('pg'); (async()=>{const client=new Client({connectionString:process.env.DATABASE_URL}); await client.connect(); const result=await client.query('select count(*)::int as users, (select count(*)::int from event_types) as event_types, (select count(*)::int from availability_rules) as availability_rules, (select count(*)::int from bookings) as bookings from users'); console.log(JSON.stringify(result.rows[0])); await client.end();})().catch(err=>{console.error(err); process.exit(1);});"
node --input-type=module --env-file=.env -e 'import("./src/lib/prisma.js").then(async ({ prisma }) => { const users = await prisma.user.count(); const eventTypes = await prisma.eventType.count(); console.log(JSON.stringify({ users, eventTypes })); await prisma.$disconnect(); }).catch((error) => { console.error(error); process.exit(1); });'
```

Purpose:

- Install frontend dependencies for routing, API requests, and date handling
- Install backend runtime dependencies for Express, Prisma, validation, and date handling
- Install backend development dependencies for Prisma CLI and hot reload
- Install Prisma's PostgreSQL adapter and `pg` driver for the Neon-backed database connection
- Install Prisma's Neon adapter and Neon serverless driver for runtime access to Neon
- Remove the unused generic Postgres adapter after switching fully to the Neon adapter
- Push the Prisma schema directly to Neon
- Verify row counts directly against Neon and through the Prisma runtime

### Prisma Setup

```bash
npx prisma init --datasource-provider postgresql
npm run prisma:migrate -- --name init
npm run prisma:push
npm run db:seed
```

Purpose:

- Initialize Prisma for PostgreSQL
- Generate the `prisma/` folder, Prisma config, and starter environment file
- Attempt the first migration and seed run against the hosted Neon database
- Push the schema directly to Neon and seed the hosted database

### Hosted Database Diagnostics

```bash
node --env-file=.env -e "const url=process.env.DATABASE_URL||''; console.log(url.startsWith('postgresql://') ? 'DATABASE_URL present' : 'DATABASE_URL missing')"
node --env-file=.env -e "const u=new URL(process.env.DATABASE_URL); console.log(JSON.stringify({host:u.hostname, pooled:u.hostname.includes('-pooler'), hasSsl:u.searchParams.get('sslmode')}))"
```

Purpose:

- Verify that the Neon connection string is present
- Check whether the Neon URL is direct or pooled so Prisma CLI can be configured correctly

### Verification Commands

```bash
npm run build
node --input-type=module --env-file=.env -e 'import app from "./src/app.js"; const server = app.listen(4010, async () => { try { const [events, availability, meetings, publicEvent, slots] = await Promise.all([fetch("http://127.0.0.1:4010/api/event-types").then((r) => r.json()), fetch("http://127.0.0.1:4010/api/availability").then((r) => r.json()), fetch("http://127.0.0.1:4010/api/bookings?type=upcoming").then((r) => r.json()), fetch("http://127.0.0.1:4010/api/public/event-types/30-minute-meeting").then((r) => r.json()), fetch("http://127.0.0.1:4010/api/public/event-types/30-minute-meeting/slots?date=2026-04-20").then((r) => r.json()) ]); console.log(JSON.stringify({ eventTypes: events.length, availabilityRules: availability.rules.length, upcomingMeetings: meetings.length, publicEvent: publicEvent.slug, slots: slots.slots.length }, null, 2)); } catch (error) { console.error(error); process.exitCode = 1; } finally { server.close(); } });'
node --input-type=module --env-file=.env -e 'import app from "./src/app.js"; const server = app.listen(4011, async () => { try { const slotResponse = await fetch("http://127.0.0.1:4011/api/public/event-types/30-minute-meeting/slots?date=2026-04-21"); const slotData = await slotResponse.json(); const startTime = slotData.slots[0]; const bookingResponse = await fetch("http://127.0.0.1:4011/api/public/event-types/30-minute-meeting/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startTime, inviteeName: "Smoke Test", inviteeEmail: "smoke@example.com" }) }); const booking = await bookingResponse.json(); const cancelResponse = await fetch(`http://127.0.0.1:4011/api/bookings/${booking.id}/cancel`, { method: "PATCH" }); const cancelled = await cancelResponse.json(); console.log(JSON.stringify({ bookedId: booking.id, cancelledStatus: cancelled.status, slotBooked: startTime }, null, 2)); } catch (error) { console.error(error); process.exitCode = 1; } finally { server.close(); } });'
node --input-type=module --env-file=.env -e 'import app from "./src/app.js"; const server = app.listen(4012, async () => { try { const slotResponse = await fetch("http://127.0.0.1:4012/api/public/event-types/30-minute-meeting/slots?date=2026-04-22"); const slotData = await slotResponse.json(); const startTime = slotData.slots[0]; const payload = { startTime, inviteeName: "Conflict Test", inviteeEmail: "conflict@example.com" }; const firstResponse = await fetch("http://127.0.0.1:4012/api/public/event-types/30-minute-meeting/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const firstBooking = await firstResponse.json(); const secondResponse = await fetch("http://127.0.0.1:4012/api/public/event-types/30-minute-meeting/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const secondBody = await secondResponse.json(); await fetch(`http://127.0.0.1:4012/api/bookings/${firstBooking.id}/cancel`, { method: "PATCH" }); console.log(JSON.stringify({ firstStatus: firstResponse.status, secondStatus: secondResponse.status, secondMessage: secondBody.message }, null, 2)); } catch (error) { console.error(error); process.exitCode = 1; } finally { server.close(); } });'
```

Purpose:

- Build the client to verify the production bundle compiles
- Smoke test the main read endpoints against the seeded Neon database
- Verify end-to-end booking creation and admin cancellation
- Verify double-booking protection returns `409 Conflict`

## Non-Shell Editing Tool Used

These were not terminal shell commands, but they were used to create project notes inside the repo:

- `apply_patch`

Purpose:

- Create and update markdown files such as implementation notes, feature tracker, and command log

## Going Forward

I will keep updating this file with:

- Important shell commands used for setup
- Development commands
- Database commands
- Build and run commands
- Test commands

This should make it easier for you to explain the project setup and local workflow if asked.
