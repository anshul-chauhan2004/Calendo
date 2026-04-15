# Calendo Assignment Blueprint

## 1. Assignment Objective

Build a scheduling platform that replicates the core user experience of Calendly.

The app must allow:

- A default logged-in admin user to create and manage event types
- The admin user to define weekly availability and timezone
- Public users to open a shareable booking page, select a date/time, and book a meeting
- The admin user to view upcoming and past meetings and cancel meetings

The solution must be:

- Functionally correct
- Visually similar to Calendly
- Backed by a well-designed relational database
- Modular and explainable in interview

## 2. Scope Breakdown

### Admin Side

- Event types list page
- Create event type
- Edit event type
- Delete event type
- Availability settings page
- Meetings page

### Public Side

- Public event page via slug
- Calendar date picker
- Available time slots list
- Booking form
- Confirmation page

## 3. Core Requirements From Assignment

### Must Have

1. Event Types Management
- Create event types with `name`, `duration`, `slug`
- Edit and delete event types
- Show all event types on scheduling page
- Unique public booking link for each event type

2. Availability Settings
- Select available weekdays
- Define start and end time per day
- Set timezone

3. Public Booking Page
- Month calendar view
- Available slots for selected date
- Invitee name and email form
- Prevent double booking
- Confirmation screen

4. Meetings Page
- Upcoming meetings
- Past meetings
- Cancel meetings

### Bonus

- Responsive design
- Multiple schedules
- Date-specific overrides
- Rescheduling
- Email notifications
- Buffer time
- Custom invitee questions

## 4. Recommended Tech Stack

To optimize for speed, clarity, and interview explainability:

### Frontend

- React
- Vite
- React Router
- Tailwind CSS

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL
- Prisma ORM

### Utilities

- date-fns
- date-fns-tz
- Zod for request validation
- Axios or fetch for client API requests

## 5. Why This Stack

- `React + Vite` gives a fast local setup and simple SPA architecture
- `Express` keeps backend logic explicit and easy to explain
- `PostgreSQL` is reliable for relational scheduling data
- `Prisma` makes schema design and querying easy to maintain
- `date-fns` keeps date logic readable, which matters in interviews

## 6. Suggested Folder Structure

```text
calendo/
  client/
    src/
      api/
        eventTypes.ts
        availability.ts
        bookings.ts
        public.ts
      components/
        layout/
          Sidebar.tsx
          Topbar.tsx
          PageShell.tsx
        event-types/
          EventTypeCard.tsx
          EventTypeFormModal.tsx
        availability/
          DayAvailabilityRow.tsx
          TimeRangeInput.tsx
          TimezoneSelect.tsx
        booking/
          BookingCalendar.tsx
          TimeSlotList.tsx
          BookingForm.tsx
          BookingSummary.tsx
        meetings/
          MeetingCard.tsx
          MeetingsTabs.tsx
        common/
          Button.tsx
          Input.tsx
          Modal.tsx
          EmptyState.tsx
          Spinner.tsx
      pages/
        EventTypesPage.tsx
        AvailabilityPage.tsx
        MeetingsPage.tsx
        PublicBookingPage.tsx
        BookingConfirmationPage.tsx
      hooks/
        useEventTypes.ts
        useAvailability.ts
        useBookings.ts
      utils/
        datetime.ts
        constants.ts
      App.tsx
      main.tsx
  server/
    prisma/
      schema.prisma
      seed.ts
    src/
      config/
        env.ts
      middleware/
        errorHandler.ts
        notFound.ts
      routes/
        eventTypes.routes.ts
        availability.routes.ts
        bookings.routes.ts
        public.routes.ts
      controllers/
        eventTypes.controller.ts
        availability.controller.ts
        bookings.controller.ts
        public.controller.ts
      services/
        eventTypes.service.ts
        availability.service.ts
        booking.service.ts
        slot.service.ts
      utils/
        time.ts
        validation.ts
      app.ts
      server.ts
  README.md
```

## 7. User Flows

### Admin Flow

1. Open event types dashboard
2. Create event type with name, duration, slug
3. Configure weekly availability
4. Share public booking URL
5. Review bookings in meetings page
6. Cancel meetings if needed

### Public Booking Flow

1. Open `/book/:slug`
2. View event summary
3. Select a date from month calendar
4. See available slots for that date
5. Pick a slot
6. Fill name and email
7. Submit booking
8. See confirmation page

## 8. Database Design

Use a single default user because the assignment explicitly says login is not required and we can assume a default user is logged in on the admin side.

### Tables

#### users

- `id`
- `name`
- `email`
- `created_at`
- `updated_at`

#### event_types

- `id`
- `user_id`
- `name`
- `slug`
- `description` optional
- `duration_minutes`
- `color` optional
- `is_active`
- `created_at`
- `updated_at`

#### availability_rules

- `id`
- `user_id`
- `day_of_week` integer from `0` to `6`
- `start_time` string or time column
- `end_time` string or time column
- `timezone`
- `created_at`
- `updated_at`

#### bookings

- `id`
- `event_type_id`
- `host_user_id`
- `invitee_name`
- `invitee_email`
- `start_time_utc`
- `end_time_utc`
- `timezone_at_booking`
- `status` enum such as `SCHEDULED` or `CANCELLED`
- `cancelled_at` nullable
- `created_at`
- `updated_at`

### Relationships

- One `user` has many `event_types`
- One `user` has many `availability_rules`
- One `user` hosts many `bookings`
- One `event_type` has many `bookings`

## 9. Database Design Justification

These are the explanations you should be able to give in interview:

- `event_types` is separate from `bookings` because event definitions and scheduled meetings are different business entities
- `availability_rules` is stored independently because weekly recurring availability belongs to the host, not a single event instance
- `bookings` stores actual meeting times in UTC to avoid timezone ambiguity
- `status` is used instead of deleting bookings so meeting history remains auditable
- `slug` is unique because public event URLs must be unique

## 10. Prisma Schema Shape

High-level model structure:

```prisma
model User {
  id                String              @id @default(cuid())
  name              String
  email             String              @unique
  eventTypes        EventType[]
  availabilityRules AvailabilityRule[]
  hostedBookings    Booking[]
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
}

model EventType {
  id              String    @id @default(cuid())
  userId          String
  name            String
  slug            String    @unique
  description     String?
  durationMinutes Int
  isActive        Boolean   @default(true)
  user            User      @relation(fields: [userId], references: [id])
  bookings        Booking[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model AvailabilityRule {
  id        String   @id @default(cuid())
  userId    String
  dayOfWeek Int
  startTime String
  endTime   String
  timezone  String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Booking {
  id                String         @id @default(cuid())
  eventTypeId       String
  hostUserId        String
  inviteeName       String
  inviteeEmail      String
  startTimeUtc      DateTime
  endTimeUtc        DateTime
  timezoneAtBooking String
  status            BookingStatus  @default(SCHEDULED)
  cancelledAt       DateTime?
  eventType         EventType      @relation(fields: [eventTypeId], references: [id])
  hostUser          User           @relation(fields: [hostUserId], references: [id])
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
}

enum BookingStatus {
  SCHEDULED
  CANCELLED
}
```

## 11. API Design

### Admin APIs

#### Event Types

- `GET /api/event-types`
- `POST /api/event-types`
- `PUT /api/event-types/:id`
- `DELETE /api/event-types/:id`

Example create payload:

```json
{
  "name": "30 Minute Meeting",
  "slug": "30-minute-meeting",
  "durationMinutes": 30
}
```

#### Availability

- `GET /api/availability`
- `PUT /api/availability`

Example update payload:

```json
{
  "timezone": "Asia/Kolkata",
  "rules": [
    { "dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00" },
    { "dayOfWeek": 2, "startTime": "09:00", "endTime": "17:00" },
    { "dayOfWeek": 3, "startTime": "09:00", "endTime": "17:00" },
    { "dayOfWeek": 4, "startTime": "09:00", "endTime": "17:00" },
    { "dayOfWeek": 5, "startTime": "09:00", "endTime": "17:00" }
  ]
}
```

#### Meetings

- `GET /api/bookings?type=upcoming`
- `GET /api/bookings?type=past`
- `PATCH /api/bookings/:id/cancel`

### Public APIs

#### Public Event Page

- `GET /api/public/event-types/:slug`

Response should include:

- Event type details
- Host details
- Duration
- Timezone

#### Available Slots

- `GET /api/public/event-types/:slug/slots?date=2026-04-20`

Response:

```json
{
  "date": "2026-04-20",
  "timezone": "Asia/Kolkata",
  "slots": [
    "2026-04-20T09:00:00+05:30",
    "2026-04-20T09:30:00+05:30",
    "2026-04-20T10:00:00+05:30"
  ]
}
```

#### Create Booking

- `POST /api/public/event-types/:slug/book`

Payload:

```json
{
  "startTime": "2026-04-20T09:00:00+05:30",
  "inviteeName": "Alex Doe",
  "inviteeEmail": "alex@example.com"
}
```

## 12. Slot Generation Logic

This is one of the most important parts of the assignment.

### Input

- Selected event type
- Selected date
- Event duration
- Host weekly availability
- Existing scheduled bookings

### Output

- Available time slots for that date

### Algorithm

1. Read the selected date
2. Determine the day of week
3. Fetch availability rules for that weekday
4. Convert that day's start/end availability into datetime boundaries in the configured timezone
5. Split the window into equal intervals based on event duration
6. Fetch all non-cancelled bookings for that event type on that date
7. Remove any slot that overlaps an existing booking
8. Return remaining slots

### Important Edge Cases

- No availability exists for that weekday
- Slot ends after the available window
- Existing cancelled bookings should not block slots
- Same slot requested twice by concurrent users

## 13. Preventing Double Booking

This must be enforced on the server, not just the frontend.

### Safe Flow

1. Client requests available slots
2. User selects slot and submits booking form
3. Server re-checks whether the slot is still free
4. If already booked, return conflict error
5. If free, create booking

### Ideal Protection

- Use a DB transaction for booking creation
- Check overlapping scheduled booking inside the transaction
- If overlap exists, reject with `409 Conflict`

Interview answer:

"The frontend only improves UX. The backend is the source of truth. I revalidate availability at booking time to prevent race conditions and double booking."

## 14. Timezone Strategy

Use this approach:

- Store recurring availability in the host's selected timezone
- Display public booking slots in the host timezone for MVP
- Store confirmed booking start/end in UTC
- Also store the timezone used during booking for display consistency

Why this is correct:

- UTC is reliable for persistence
- Human-facing schedules need timezone-aware rendering
- It avoids bugs caused by server-local time assumptions

## 15. Frontend Page Plan

### `/event-types`

Purpose:
- Manage event types

UI elements:
- Sidebar navigation
- Header
- Event type cards
- "New Event Type" button
- Modal or form drawer for create/edit

### `/availability`

Purpose:
- Configure weekly hours

UI elements:
- Timezone dropdown
- Day rows for Monday to Sunday
- Toggle per day
- Start and end time selectors

### `/meetings`

Purpose:
- View and manage meetings

UI elements:
- Upcoming and past tabs
- Meeting cards
- Cancel button for upcoming meetings

### `/book/:slug`

Purpose:
- Public booking experience

UI elements:
- Event summary panel
- Calendar month selector
- Time slots list
- Booking form

### `/book/:slug/confirmation`

Purpose:
- Final confirmation

UI elements:
- Success state
- Invitee info
- Selected date and time
- Event type summary

## 16. Component Tree

### Layout Components

- `Sidebar`
- `Topbar`
- `PageShell`

### Event Types Components

- `EventTypeCard`
- `EventTypeFormModal`

### Availability Components

- `DayAvailabilityRow`
- `TimeRangeInput`
- `TimezoneSelect`

### Booking Components

- `BookingCalendar`
- `TimeSlotList`
- `BookingForm`
- `BookingSummary`

### Meetings Components

- `MeetingCard`
- `MeetingsTabs`

### Shared Components

- `Button`
- `Input`
- `Modal`
- `EmptyState`
- `Spinner`

## 17. UI and UX Direction

The assignment specifically wants Calendly-like design.

That means:

- Clean white surfaces
- Soft gray borders
- Clear hierarchy
- Spacious layout
- Left summary and right action panel on booking pages
- Rounded cards and buttons
- Simple typography
- Minimal clutter

What to mimic:

- Layout structure
- Booking flow progression
- Event card design
- Calendar and slots split-panel layout

What not to do:

- Build a generic dashboard unrelated to Calendly
- Use flashy animations or unusual colors
- Overcomplicate the booking UI

## 18. Seed Data Plan

Seed one default user:

- Name: `Anshul Chauhan`
- Email: `anshul@example.com`

Seed event types:

- `30 Minute Meeting`
- `60 Minute Interview`
- `Quick Intro Call`

Seed default weekly availability:

- Monday to Friday
- `09:00` to `17:00`
- Timezone: `Asia/Kolkata`

Seed a few bookings:

- 2 upcoming
- 2 past
- 1 cancelled

This helps demo all states without manual setup.

## 19. README Contents

Your README should include:

- Project overview
- Tech stack
- Features implemented
- Setup instructions
- Environment variables
- Database migration and seed steps
- API overview
- Assumptions made
- Deployment links

## 20. Assumptions To State Clearly

You should document these so evaluators know they were intentional:

- Single default admin user is assumed
- Public booking page does not require authentication
- Availability is host-level, not per event type, in the MVP
- Slots are shown in host timezone for simplicity
- Meetings can be cancelled but not rescheduled in the core version

## 21. Delivery Priorities

### Phase 1: Foundation

- Create frontend and backend apps
- Configure Prisma and PostgreSQL
- Create schema and seed data
- Set up routing and API skeleton

### Phase 2: Core Admin Features

- Event types CRUD
- Availability settings save/load
- Meetings list page

### Phase 3: Public Booking Flow

- Public event page by slug
- Calendar integration
- Slot generation
- Booking form
- Confirmation page

### Phase 4: Reliability and Polish

- Double-booking prevention
- Empty/loading/error states
- Responsive layout
- Calendly-style UI refinement

### Phase 5: Delivery

- README
- Environment examples
- Deployment

## 22. Suggested Timeline For 2 Days

### Day 1

- Project setup
- Schema design
- Seed data
- Event type CRUD
- Availability page
- Initial meetings page

### Day 2

- Public booking flow
- Slot generation
- Booking creation and collision handling
- Confirmation page
- UI polish
- README and deployment

## 23. Likely Interview Questions

Prepare strong answers for these:

1. Why did you choose this schema?
2. Why store booking times in UTC?
3. How do you prevent double booking?
4. Why compute slots on the backend?
5. How do availability rules map to actual time slots?
6. How would you support date overrides?
7. How would you support multiple users in the future?
8. Why did you separate services, controllers, and routes?
9. How would you add rescheduling?
10. What tradeoffs did you make due to the time limit?

## 24. Good Interview Answers

### Why backend slot generation?

"Slot generation is business logic, so I kept it on the server to maintain consistency and prevent the frontend from becoming the source of truth."

### Why UTC storage?

"Users view time in local timezones, but storing confirmed meeting times in UTC avoids ambiguity and makes comparisons reliable."

### Why weekly availability rules?

"The assignment describes recurring weekly availability, so a weekday-based model is the simplest normalized representation."

### Why not delete cancelled bookings?

"Keeping cancelled bookings preserves history and makes the meetings module more realistic."

### Why host-level availability?

"It fits the assignment scope, reduces complexity, and can later be extended to event-specific rules if needed."

## 25. Future Enhancements

If they ask how to extend it:

- Add multiple users and authentication
- Per-event availability rules
- Date overrides and blocked dates
- Buffer time before and after meetings
- Rescheduling links
- Email notifications
- Calendar integrations
- Custom invitee questions

## 26. Final Build Strategy

The winning strategy for this assignment is:

- Finish all core requirements first
- Keep architecture clean and explainable
- Make the UI strongly resemble Calendly
- Avoid overengineering bonus features before the base flow works
- Build only what you can defend clearly in interview

If a feature is partial, it is better to have a correct, polished core flow than a broad but unstable implementation.
