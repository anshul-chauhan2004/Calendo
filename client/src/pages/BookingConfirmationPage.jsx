import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPublicBooking } from "../api/public";
import { formatLongDate, formatTimeRange } from "../utils/datetime";

export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const { slug, bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBooking() {
      setLoading(true);
      setError("");

      try {
        const response = await getPublicBooking(slug, bookingId);
        setBooking(response.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message ?? "Failed to load booking confirmation.");
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [slug, bookingId]);

  const eventType = booking?.eventType;
  const timezone = eventType?.timezone ?? "UTC";

  return (
    <section className="confirmation-shell">
      <article className="confirmation-card">
        <div className="success-badge">Confirmed</div>
        <h2>You are scheduled</h2>
        <p className="page-copy">
          The public booking has been created and is now visible on the host meetings page.
        </p>

        {loading ? <p className="panel-copy">Loading booking confirmation...</p> : null}
        {error ? <p className="error-banner">{error}</p> : null}

        <div className="detail-stack">
          <div>
            <span>Event</span>
            <strong>{eventType?.name ?? "Booking unavailable"}</strong>
          </div>
          <div>
            <span>Date</span>
            <strong>{booking?.startTimeUtc ? formatLongDate(booking.startTimeUtc, timezone) : "--"}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>
              {booking?.startTimeUtc && booking?.endTimeUtc
                ? formatTimeRange(booking.startTimeUtc, booking.endTimeUtc, timezone)
                : "--"}
            </strong>
          </div>
          <div>
            <span>Invitee</span>
            <strong>{booking?.inviteeEmail ?? "--"}</strong>
          </div>
          <div>
            <span>Timezone</span>
            <strong>{eventType?.timezone ?? "--"}</strong>
          </div>
        </div>

        <div className="action-row">
          <button className="primary-button" type="button" onClick={() => navigate("/event-types")}>
            Back to Dashboard
          </button>
        </div>
      </article>
    </section>
  );
}
