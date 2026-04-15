# Feature Tracker

This file separates the assignment's required features from the extra features we plan to add, so it is easy to explain the project scope in an interview.

## Required Features

These come directly from the assignment and must be completed first.

### Event Types Management

- Create event types
- Edit event types
- Delete event types
- List all event types
- Unique public booking link for each event type

### Availability Settings

- Set available weekdays
- Set start and end time for each available day
- Set timezone for the host schedule

### Public Booking Page

- Public booking page using event `slug`
- Month calendar view
- Available slots for selected date
- Booking form with invitee name and email
- Prevent double booking
- Booking confirmation page

### Meetings Page

- View upcoming meetings
- View past meetings
- Cancel meeting

### Assignment Delivery Requirements

- Seed database with sample data
- Calendly-like UI and UX
- Clean schema design
- Public GitHub repository
- Deployed application
- README with setup instructions and assumptions

## Planned Extra Features

These are not required by the assignment, but they improve the project and give you stronger talking points.

### High-Value Extras

- Responsive design for mobile, tablet, and desktop
- Better empty, loading, and error states
- Strong form validation on frontend and backend
- Cleaner meeting details UI on confirmation page
- Improved seed data for realistic demo scenarios

### Good Technical Extras

- Server-side booking conflict protection using transaction-safe revalidation
- Clear service/controller/route separation in backend
- Reusable frontend component architecture
- Consistent timezone handling with UTC persistence

### Optional Bonus Features

These depend on available time after the core app is complete.

- Date-specific availability overrides
- Buffer time before and after meetings
- Rescheduling flow
- Custom invitee questions
- Email notifications

## How To Explain It In Interview

Use this split:

- "These were the required assignment features, and I completed them first."
- "Then I added a few extras to improve reliability, UX, and code quality."

## Strong Extra-Feature Talking Points

If asked what extra work was done beyond the brief, the best answers are:

- Responsive UI instead of desktop-only pages
- Better error/loading states for a more production-like UX
- Strong backend protection against double booking
- Clear timezone strategy using UTC for storage
- Better code modularity with reusable components and backend layering

## Recommended Positioning

When presenting the project, frame it like this:

- Core scope: scheduling flow, event types, availability, booking, meetings
- Extra product polish: responsiveness and cleaner UX states
- Extra engineering quality: schema clarity, modular structure, timezone handling, and safe booking validation
