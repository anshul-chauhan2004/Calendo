import { useEffect, useState } from "react";
import { createEventType, deleteEventType, getEventTypes, updateEventType } from "../api/eventTypes";

const initialForm = {
  name: "",
  slug: "",
  description: "",
  durationMinutes: 30,
  isActive: true,
};

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copiedSlug, setCopiedSlug] = useState("");

  async function loadEventTypes() {
    setLoading(true);
    setError("");

    try {
      const response = await getEventTypes();
      setEventTypes(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Failed to load event types.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEventTypes();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : name === "durationMinutes" ? Number(value) : value,
    }));
  }

  function startEditing(eventType) {
    setEditingId(eventType.id);
    setForm({
      name: eventType.name,
      slug: eventType.slug,
      description: eventType.description ?? "",
      durationMinutes: eventType.durationMinutes,
      isActive: eventType.isActive,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await updateEventType(editingId, form);
      } else {
        await createEventType(form);
      }

      resetForm();
      await loadEventTypes();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Failed to save event type.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setError("");

    try {
      await deleteEventType(id);
      if (editingId === id) {
        resetForm();
      }
      await loadEventTypes();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Failed to delete event type.");
    }
  }

  async function handleCopyLink(slug) {
    const publicUrl = `${window.location.origin}/book/${slug}`;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedSlug(slug);
      window.setTimeout(() => {
        setCopiedSlug((current) => (current === slug ? "" : current));
      }, 1800);
    } catch {
      setError("Failed to copy booking link.");
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Scheduling Page</p>
          <h2>Event Types</h2>
          <p className="page-copy">
            This is the admin landing page. The default host can create, edit, delete, and share
            public booking links from here.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={resetForm}>
          {editingId ? "Create New Instead" : "+ New Event Type"}
        </button>
      </header>

      {error ? <p className="error-banner">{error}</p> : null}

      <div className="summary-strip">
        <div className="summary-card">
          <span>{eventTypes.length}</span>
          <p>Active event types</p>
        </div>
        <div className="summary-card">
          <span>Asia/Kolkata</span>
          <p>Host timezone</p>
        </div>
        <div className="summary-card">
          <span>Mon - Fri</span>
          <p>Weekly availability</p>
        </div>
      </div>

      <section className="panel-card form-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{editingId ? "Edit Event Type" : "Create Event Type"}</p>
            <h3>{editingId ? "Update existing event template" : "Add a new booking link"}</h3>
          </div>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="event-name">Event name</label>
              <input
                id="event-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="30 Minute Meeting"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="event-slug">URL slug</label>
              <input
                id="event-slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="30-minute-meeting"
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="event-description">Description</label>
              <input
                id="event-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="What this meeting is for"
              />
            </div>

            <div className="field">
              <label htmlFor="event-duration">Duration in minutes</label>
              <input
                id="event-duration"
                name="durationMinutes"
                type="number"
                min="15"
                max="240"
                value={form.durationMinutes}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            Keep this event type active and publicly bookable
          </label>

          <div className="action-row">
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Event Type" : "Create Event Type"}
            </button>
            {editingId ? (
              <button className="secondary-button" type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <div className="grid-cards">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <article key={`event-type-skeleton-${index}`} className="panel-card skeleton-card">
                <div className="skeleton-line skeleton-line-short" />
                <div className="skeleton-line skeleton-line-medium" />
                <div className="skeleton-line skeleton-line-full" />
                <div className="skeleton-line skeleton-line-full" />
                <div className="skeleton-row">
                  <div className="skeleton-pill" />
                  <div className="skeleton-pill" />
                  <div className="skeleton-pill" />
                </div>
              </article>
            ))
          : null}

        {!loading && eventTypes.length === 0 ? (
          <article className="panel-card">
            <h3>No event types yet</h3>
            <p className="panel-copy">Create your first event type to generate a shareable booking page.</p>
          </article>
        ) : null}

        {eventTypes.map((eventType, index) => (
          <article
            key={eventType.slug}
            className={`panel-card event-type-card ${
              index % 2 === 0 ? "event-type-card-blue" : "event-type-card-green"
            }`}
          >
            <div className="panel-card-top">
              <div>
                <p className="eyebrow">{eventType.durationMinutes} min</p>
                <h3>{eventType.name}</h3>
              </div>
              <span className={eventType.isActive ? "status-pill" : "status-pill muted-pill"}>
                {eventType.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="panel-copy">{eventType.description || "No description added yet."}</p>

            <div className="link-chip">{window.location.origin}/book/{eventType.slug}</div>

            <div className="action-row">
              <button className="secondary-button" type="button" onClick={() => startEditing(eventType)}>
                Edit
              </button>
              <button className="secondary-button" type="button" onClick={() => handleDelete(eventType.id)}>
                Delete
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => handleCopyLink(eventType.slug)}
              >
                {copiedSlug === eventType.slug ? "Copied" : "Copy Link"}
              </button>
              <a
                className="secondary-button link-button"
                href={`/book/${eventType.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                View Booking Page
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
