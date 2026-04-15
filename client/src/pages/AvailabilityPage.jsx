import { useEffect, useState } from "react";
import { getAvailability, updateAvailability } from "../api/availability";

const weekdayRows = [
  { dayOfWeek: 1, day: "Monday" },
  { dayOfWeek: 2, day: "Tuesday" },
  { dayOfWeek: 3, day: "Wednesday" },
  { dayOfWeek: 4, day: "Thursday" },
  { dayOfWeek: 5, day: "Friday" },
  { dayOfWeek: 6, day: "Saturday" },
  { dayOfWeek: 0, day: "Sunday" },
];

const timezoneOptions = ["Asia/Kolkata", "UTC", "Europe/London", "America/New_York"];

export default function AvailabilityPage() {
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [rows, setRows] = useState(
    weekdayRows.map((row) => ({
      ...row,
      enabled: false,
      startTime: "09:00",
      endTime: "17:00",
    })),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [rowErrors, setRowErrors] = useState({});

  useEffect(() => {
    async function loadAvailability() {
      setLoading(true);

      try {
        const response = await getAvailability();
        setTimezone(response.data.timezone);
        setRows(
          weekdayRows.map((day) => {
            const rule = response.data.rules.find((item) => item.dayOfWeek === day.dayOfWeek);

            return {
              ...day,
              enabled: Boolean(rule),
              startTime: rule?.startTime ?? "09:00",
              endTime: rule?.endTime ?? "17:00",
            };
          }),
        );
      } catch (requestError) {
        setError(requestError.response?.data?.message ?? "Failed to load availability.");
      } finally {
        setLoading(false);
      }
    }

    loadAvailability();
  }, []);

  function updateRow(dayOfWeek, patch) {
    setRows((current) =>
      current.map((row) => (row.dayOfWeek === dayOfWeek ? { ...row, ...patch } : row)),
    );

    setRowErrors((current) => {
      if (!current[dayOfWeek]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[dayOfWeek];
      return nextErrors;
    });
  }

  function validateRows() {
    const nextErrors = {};

    rows.forEach((row) => {
      if (row.enabled && row.startTime >= row.endTime) {
        nextErrors[row.dayOfWeek] = "End time must be after start time";
      }
    });

    setRowErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    const isValid = validateRows();

    if (!isValid) {
      setMessage("");
      setError("");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateAvailability({
        timezone,
        rules: rows
          .filter((row) => row.enabled)
          .map((row) => ({
            dayOfWeek: row.dayOfWeek,
            startTime: row.startTime,
            endTime: row.endTime,
          })),
      });

      setMessage("Availability saved.");
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Failed to save availability.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Availability Settings</p>
          <h2>Weekly Hours</h2>
          <p className="page-copy">
            The host’s recurring schedule lives here. Public booking slots are generated from these
            weekday rules and the selected timezone.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Availability"}
        </button>
      </header>

      {error ? <p className="error-banner">{error}</p> : null}
      {message ? <p className="success-banner">{message}</p> : null}

      <div className="panel-card availability-panel">
        <div className="timezone-banner">
          <span className="eyebrow">Timezone</span>
          <div className="field compact-field">
            <select value={timezone} onChange={(event) => setTimezone(event.target.value)}>
              {timezoneOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="availability-list">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={`availability-skeleton-${index}`} className="availability-row availability-row-skeleton">
                  <div className="skeleton-stack">
                    <div className="skeleton-line skeleton-line-medium" />
                    <div className="skeleton-line skeleton-line-short" />
                  </div>
                  <div className="skeleton-row">
                    <div className="skeleton-toggle" />
                    <div className="skeleton-line skeleton-line-medium" />
                  </div>
                </div>
              ))
            : null}

          {!loading &&
            rows.map((row) => (
            <div key={row.day} className="availability-row">
              <div>
                <h3>{row.day}</h3>
                <p className="panel-copy">
                  {row.enabled ? `${row.startTime} - ${row.endTime}` : "Unavailable"}
                </p>
              </div>

              <div className="availability-controls">
                <label className="toggle-control">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(event) => updateRow(row.dayOfWeek, { enabled: event.target.checked })}
                  />
                  <span className="toggle-switch" aria-hidden="true" />
                  <span className="toggle-label">Available</span>
                </label>

                <div className="time-pair">
                  <input
                    type="time"
                    value={row.startTime}
                    disabled={!row.enabled}
                    onChange={(event) => updateRow(row.dayOfWeek, { startTime: event.target.value })}
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={row.endTime}
                    disabled={!row.enabled}
                    onChange={(event) => updateRow(row.dayOfWeek, { endTime: event.target.value })}
                  />
                </div>

                {rowErrors[row.dayOfWeek] ? (
                  <p className="inline-field-error">{rowErrors[row.dayOfWeek]}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
