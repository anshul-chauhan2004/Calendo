# Calendo

A fullstack scheduling platform built for the Scaler SDE Intern Fullstack Assignment. The app reproduces the core Calendly workflow for a single default host user: creating event types, setting weekly availability, exposing public booking links, and managing booked meetings.

## Tech Stack

- Frontend: React + Vite + React Router + Axios
- Backend: Node.js + Express
- Database: PostgreSQL on Neon
- ORM: Prisma
- Date handling: date-fns + date-fns-tz

## Features Implemented

### Required Features

- Event types management
- Create event types with name, duration, slug, optional description, and active status
- Edit and delete event types
- List event types on the scheduling page
- Unique public booking page for each event type

- Availability settings
- Set available weekdays
- Set start and end time for each available day
- Set timezone for the schedule

- Public booking flow
- Public page by event slug
- Month calendar selection
- Available slot generation for the selected date
- Invitee booking form with name and email
- Double-booking prevention on the backend
- Booking confirmation page with persisted meeting details

- Meetings page
- View upcoming meetings
- View past meetings
- Cancel a meeting

### Extra Features Added

- Responsive admin and public booking pages
- Seeded sample data for demo readiness
- Reusable frontend and backend module structure
- Hosted Neon PostgreSQL setup for deployment-friendly development
- Durable confirmation route using booking id
- Timezone-aware display formatting on the client

## Project Structure

```text
.
├── client
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── pages
│   │   └── utils
├── server
│   ├── prisma
│   └── src
│       ├── config
│       ├── controllers
│       ├── lib
│       ├── middleware
│       ├── routes
│       ├── services
│       └── utils
├── COMMAND_LOG.md
├── FEATURE_TRACKER.md
├── IMPLEMENTATION_PLAN.md
└── README.md
```

## Database Design

Main tables:

- `users`
- `event_types`
- `availability_rules`
- `bookings`

Design notes:

- A single seeded default host user is used because authentication is intentionally out of scope.
- Weekly availability is stored separately from bookings because availability is recurring host configuration, while bookings are concrete scheduled records.
- Confirmed meeting timestamps are stored in UTC.
- Table names use lowercase snake_case for a cleaner relational schema.

## Environment Variables

### Client

Create `client/.env`:

```bash
VITE_API_BASE_URL="http://localhost:4000/api"
```

### Server

Create `server/.env`:

```bash
DATABASE_URL="your-neon-postgres-connection-string"
PORT="4000"
CLIENT_URL="http://localhost:5173"
DEFAULT_USER_EMAIL="anch51004@gmail.com"
```

## Local Setup

Install dependencies:

```bash
cd client && npm install
cd ../server && npm install
```

Generate Prisma client:

```bash
cd server
npm run prisma:generate
```

Push the schema to the hosted database:

```bash
cd server
npm run prisma:push
```

Seed sample data:

```bash
cd server
npm run db:seed
```

Run the apps in separate terminals:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

## Default Demo Data

Seeded host user:

- Name: `Anshul Chauhan`
- Email: `anch51004@gmail.com`
- Timezone: `Asia/Kolkata`

Seeded event types:

- `30 Minute Meeting`
- `60 Minute Interview`
- `Quick Intro Call`

Seeded availability:

- Monday to Friday
- `09:00` to `17:00`

Seeded bookings:

- upcoming meetings
- past meetings
- cancelled meeting history

## Routes

### Frontend

- `/event-types`
- `/availability`
- `/meetings`
- `/book/:slug`
- `/book/:slug/confirmation/:bookingId`

### Backend API

- `GET /api/event-types`
- `POST /api/event-types`
- `PUT /api/event-types/:id`
- `DELETE /api/event-types/:id`
- `GET /api/availability`
- `PUT /api/availability`
- `GET /api/bookings?type=upcoming`
- `GET /api/bookings?type=past`
- `PATCH /api/bookings/:id/cancel`
- `GET /api/public/event-types/:slug`
- `GET /api/public/event-types/:slug/slots?date=YYYY-MM-DD`
- `GET /api/public/event-types/:slug/bookings/:bookingId`
- `POST /api/public/event-types/:slug/book`

## Assumptions

- No authentication is implemented because the assignment explicitly says to assume a default logged-in user on the admin side.
- The admin area represents the host dashboard for that default user.
- The public booking page is open to invitees without login.
- Availability is modeled at the host level for the MVP.
- Cancellation is supported as a required feature, while invitee self-rescheduling is not implemented in the core version.

## Why `prisma db push` Was Used

This project uses a hosted Neon PostgreSQL database during development. In this setup, `prisma db push` is the simplest reliable way to sync the schema without maintaining a separate shadow database for `prisma migrate dev`.

For this assignment, the important point is:

- the schema is well-defined in Prisma
- the hosted database is synced
- the seeded data and API behavior are verified

## Verification Done

- Client production build passes
- Backend read APIs pass smoke tests
- Public booking creation works
- Admin cancellation works
- Double-booking returns `409 Conflict`

## Submission Notes

Before final submission, add:

- public GitHub repository link
- deployed frontend link
- deployed backend link if separate from frontend
- any final screenshots if you want to strengthen the repo presentation
