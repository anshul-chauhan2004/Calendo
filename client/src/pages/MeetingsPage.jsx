import { useEffect, useState } from "react";
import { cancelBooking, getBookings } from "../api/bookings";
import { formatMeetingTime } from "../utils/datetime";

export default function MeetingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [meetings, setMeetings] = useState({
    upcoming: [],
    past: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMeetings() {
      setLoading(true);
      setError("");

      try {
        const [upcomingResponse, pastResponse] = await Promise.all([
          getBookings("upcoming"),
          getBookings("past"),
        ]);

        setMeetings({
          upcoming: upcomingResponse.data,
          past: pastResponse.data,
        });
      } catch (requestError) {
        setError(requestError.response?.data?.message ?? "Failed to load meetings.");
      } finally {
        setLoading(false);
      }
    }

    loadMeetings();
  }, []);

  async function handleCancel(id) {
    setError("");

    try {
      await cancelBooking(id);
      const [upcomingResponse, pastResponse] = await Promise.all([
        getBookings("upcoming"),
        getBookings("past"),
      ]);

      setMeetings({
        upcoming: upcomingResponse.data,
        past: pastResponse.data,
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Failed to cancel meeting.");
    }
  }

  const currentMeetings = meetings[activeTab];
  const showLoading = loading;
  const showEmpty = !loading && currentMeetings.length === 0;

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Meetings</p>
          <h2>Upcoming and Past</h2>
          <p className="page-copy">
            Bookings created from the public pages surface here on the host dashboard, where they
            can be reviewed and cancelled. Cancelled meetings remain visible for history instead of
            disappearing.
          </p>
        </div>
      </header>

      {error ? <p className="error-banner">{error}</p> : null}

      <div className="tab-row">
        <button
          type="button"
          className={activeTab === "upcoming" ? "tab-button tab-button-active" : "tab-button"}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming ({meetings.upcoming.length})
        </button>
        <button
          type="button"
          className={activeTab === "past" ? "tab-button tab-button-active" : "tab-button"}
          onClick={() => setActiveTab("past")}
        >
          Past + Cancelled ({meetings.past.length})
        </button>
      </div>

      <section className="panel-card">
        <div className="section-heading">
          <h3>{activeTab === "upcoming" ? "Upcoming Meetings" : "Past and Cancelled Meetings"}</h3>
          <span className={activeTab === "upcoming" ? "status-pill" : "status-pill muted-pill"}>
            {currentMeetings.length}
          </span>
        </div>

        {showLoading
          ? Array.from({ length: 2 }).map((_, index) => (
              <div key={`meeting-skeleton-${index}`} className="meeting-card meeting-card-skeleton">
                <div className="skeleton-stack">
                  <div className="skeleton-line skeleton-line-medium" />
                  <div className="skeleton-line skeleton-line-short" />
                  <div className="skeleton-line skeleton-line-medium" />
                </div>
                <div className="skeleton-pill" />
              </div>
            ))
          : null}

        {showEmpty ? (
          <div className="empty-state">
            <div className="empty-state-mark">{activeTab === "upcoming" ? "0" : "H"}</div>
            <div>
              <h4>{activeTab === "upcoming" ? "No upcoming meetings" : "No past or cancelled meetings"}</h4>
              <p className="panel-copy">
                {activeTab === "upcoming"
                  ? "Bookings created from your public event pages will appear here once someone picks a slot."
                  : "Completed and cancelled meetings will stay visible here as the host history builds up."}
              </p>
            </div>
          </div>
        ) : null}

        {currentMeetings.map((meeting) => (
          <article key={meeting.id} className="meeting-card">
            <div>
              <div className="meeting-header-row">
                <h4>{meeting.inviteeName}</h4>
                {meeting.status === "CANCELLED" ? (
                  <span className="status-pill cancelled-pill">Cancelled</span>
                ) : null}
              </div>
              <p className="panel-copy">{meeting.eventType.name}</p>
              <p className="panel-copy">{meeting.inviteeEmail}</p>
              <p className="meeting-time">{formatMeetingTime(meeting.startTimeUtc, meeting.hostUser.timezone)}</p>
              <p className="panel-copy">Timezone: {meeting.hostUser.timezone}</p>
            </div>
            {activeTab === "upcoming" && meeting.status !== "CANCELLED" ? (
              <button className="secondary-button" type="button" onClick={() => handleCancel(meeting.id)}>
                Cancel
              </button>
            ) : null}
          </article>
        ))}
      </section>
    </section>
  );
}
