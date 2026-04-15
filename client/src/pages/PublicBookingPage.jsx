import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useNavigate, useParams } from "react-router-dom";
import { createPublicBooking, getPublicEvent, getPublicSlots } from "../api/public";

function getCalendarDays(monthDate) {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(monthDate)),
    end: endOfWeek(endOfMonth(monthDate)),
  });
}

export default function PublicBookingPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [eventType, setEventType] = useState(null);
  const [monthDate, setMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [inviteeName, setInviteeName] = useState("");
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEventType() {
      setLoading(true);
      setError("");

      try {
        const response = await getPublicEvent(slug);
        setEventType(response.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message ?? "Failed to load public event.");
      } finally {
        setLoading(false);
      }
    }

    loadEventType();
  }, [slug]);

  useEffect(() => {
    async function loadSlots() {
      setSlotLoading(true);
      setSelectedSlot("");

      try {
        const response = await getPublicSlots(slug, format(selectedDate, "yyyy-MM-dd"));
        setSlots(response.data.slots);
      } catch (requestError) {
        setError(requestError.response?.data?.message ?? "Failed to load available slots.");
      } finally {
        setSlotLoading(false);
      }
    }

    loadSlots();
  }, [selectedDate, slug]);

  const calendarDays = useMemo(() => getCalendarDays(monthDate), [monthDate]);

  async function handleBookingSubmit(event) {
    event.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    setError("");

      try {
        const response = await createPublicBooking(slug, {
          startTime: selectedSlot,
        inviteeName,
        inviteeEmail,
        });

      navigate(`/book/${slug}/confirmation/${response.data.id}`, {
        state: {
          booking: response.data,
          eventType,
        },
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Failed to confirm booking.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedSlotDate = selectedSlot ? parseISO(selectedSlot) : null;

  return (
    <section className="booking-shell">
      <article className="booking-summary">
        <p className="eyebrow">{loading ? "Loading..." : eventType?.hostName}</p>
        <h2>{loading ? "Loading event..." : eventType?.name}</h2>
        <p className="booking-copy">{eventType?.description ?? "Loading event details..."}</p>

        <div className="detail-stack">
          <div>
            <span>Duration</span>
            <strong>{eventType ? `${eventType.durationMinutes} min` : "--"}</strong>
          </div>
          <div>
            <span>Timezone</span>
            <strong>{eventType?.timezone ?? "--"}</strong>
          </div>
          <div>
            <span>Public Link</span>
            <strong>{eventType?.publicUrl ?? "--"}</strong>
          </div>
        </div>
      </article>

      <article className="booking-panel">
        <div className="booking-header">
          <div>
            <p className="eyebrow">Select a Date</p>
            <h3>{format(monthDate, "MMMM yyyy")}</h3>
          </div>
          <div className="month-controls">
            <button className="secondary-button" type="button" onClick={() => setMonthDate(addMonths(monthDate, -1))}>
              Prev
            </button>
            <button className="secondary-button" type="button" onClick={() => setMonthDate(addMonths(monthDate, 1))}>
              Next
            </button>
          </div>
        </div>

        {error ? <p className="error-banner">{error}</p> : null}

        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
            <span key={label} className="calendar-label">
              {label}
            </span>
          ))}

          {calendarDays.map((day) => (
            <button
              key={day.toISOString()}
              className={
                isSameDay(day, selectedDate)
                  ? "calendar-cell calendar-cell-active"
                  : isSameMonth(day, monthDate)
                    ? "calendar-cell"
                    : "calendar-cell calendar-cell-muted"
              }
              type="button"
              onClick={() => setSelectedDate(day)}
            >
              {format(day, "d")}
            </button>
          ))}
        </div>

        <div className="slot-section">
          <div className="section-heading">
            <h3>Available Slots</h3>
            <span className="eyebrow">{format(selectedDate, "EEE, MMM d")}</span>
          </div>

          <div className="slot-list">
            {slotLoading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div key={`slot-skeleton-${index}`} className="slot-button slot-button-skeleton" />
                ))
              : null}
            {!slotLoading && slots.length === 0 ? (
              <p className="panel-copy">No slots available for the selected date.</p>
            ) : null}

            {slots.map((slot) => (
              <button
                key={slot}
                className={selectedSlot === slot ? "slot-button slot-button-active" : "slot-button"}
                type="button"
                onClick={() => setSelectedSlot(slot)}
              >
                {eventType?.timezone
                  ? formatInTimeZone(parseISO(slot), eventType.timezone, "hh:mm a")
                  : format(parseISO(slot), "hh:mm a")}
              </button>
            ))}
          </div>

          <form className="booking-form-preview" onSubmit={handleBookingSubmit}>
            {selectedSlotDate ? (
              <div className="selected-slot-card">
                <p className="eyebrow">Selected Slot</p>
                <h4>
                  {eventType?.timezone
                    ? formatInTimeZone(selectedSlotDate, eventType.timezone, "EEE, MMM d")
                    : format(selectedSlotDate, "EEE, MMM d")}
                </h4>
                <p className="selected-slot-time">
                  {eventType?.timezone
                    ? formatInTimeZone(selectedSlotDate, eventType.timezone, "hh:mm a")
                    : format(selectedSlotDate, "hh:mm a")}
                  {" · "}
                  {eventType?.durationMinutes ?? "--"} min
                </p>
                <p className="panel-copy">Timezone: {eventType?.timezone ?? "--"}</p>
              </div>
            ) : null}

            <div className="field">
              <label htmlFor="invitee-name">Name</label>
              <input
                id="invitee-name"
                type="text"
                placeholder="Alex Doe"
                value={inviteeName}
                onChange={(event) => setInviteeName(event.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="invitee-email">Email</label>
              <input
                id="invitee-email"
                type="email"
                placeholder="alex@example.com"
                value={inviteeEmail}
                onChange={(event) => setInviteeEmail(event.target.value)}
                required
              />
            </div>

            <button className="primary-button full-width" type="submit" disabled={!selectedSlot || submitting}>
              {submitting ? "Confirming..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </article>
    </section>
  );
}
