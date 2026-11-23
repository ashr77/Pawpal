import { useState } from 'react';
import { apiRequest } from '../services/api';

export default function ReportTimeline({ reportId, updates = [], isOwnerOrAdmin, onUpdateAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [eventType, setEventType] = useState('Animal Picked Up');
  const [customEventType, setCustomEventType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const commonEvents = [
    'Volunteer Responded',
    'Animal Picked Up',
    'Taken to Veterinarian',
    'Under Treatment',
    'Temporary Foster Placed',
    'Adopted',
    'Case Resolved',
    'Custom Update',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalEventType = eventType === 'Custom Update' ? customEventType.trim() : eventType;
    if (!finalEventType) {
      setError('Please specify the event type.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description for this progress update.');
      return;
    }

    try {
      setSubmitting(true);
      await apiRequest(`/api/reports/${reportId}/updates`, {
        method: 'POST',
        body: JSON.stringify({
          event_type: finalEventType,
          description: description.trim(),
        }),
      });

      setDescription('');
      setCustomEventType('');
      setShowForm(false);
      if (onUpdateAdded) onUpdateAdded();
    } catch (err) {
      setError(err.message || 'Failed to add progress update.');
    } finally {
      setSubmitting(false);
    }
  };

  const getEventBadgeClass = (type) => {
    if (type.includes('Resolved') || type.includes('Adopted')) return 'bg-success';
    if (type.includes('Treatment') || type.includes('Veterinarian')) return 'bg-info text-dark';
    if (type.includes('Volunteer') || type.includes('Picked Up')) return 'bg-primary';
    if (type.includes('Status')) return 'bg-warning text-dark';
    return 'bg-secondary';
  };

  return (
    <div className="card shadow-sm border-0 p-4 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
        <h5 className="fw-bold mb-0">⏱ Rescue Progress Timeline</h5>
        {isOwnerOrAdmin && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-sm btn-outline-primary fw-semibold"
          >
            + Add Progress Update
          </button>
        )}
      </div>

      {showForm && (
        <div className="card bg-light border p-3 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold mb-0">Record Rescue Progress</h6>
            <button
              onClick={() => setShowForm(false)}
              className="btn-close btn-sm"
              aria-label="Close"
            ></button>
          </div>

          {error && <div className="alert alert-danger py-1 small">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="form-label small fw-semibold">Milestone / Event Type *</label>
              <select
                className="form-select form-select-sm"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                {commonEvents.map((evt) => (
                  <option key={evt} value={evt}>
                    {evt}
                  </option>
                ))}
              </select>
            </div>

            {eventType === 'Custom Update' && (
              <div className="mb-2">
                <input
                  type="text"
                  required
                  placeholder="Enter custom milestone title"
                  className="form-control form-control-sm"
                  value={customEventType}
                  onChange={(e) => setCustomEventType(e.target.value)}
                />
              </div>
            )}

            <div className="mb-3">
              <label className="form-label small fw-semibold">Description & Details *</label>
              <textarea
                required
                rows="2"
                placeholder="Describe current status, medical findings, or rescue progress..."
                className="form-control form-control-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-sm btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-sm btn-primary fw-semibold"
              >
                {submitting ? 'Posting...' : 'Post Update'}
              </button>
            </div>
          </form>
        </div>
      )}

      {updates.length === 0 ? (
        <div className="text-center py-4 text-muted small">
          No progress updates logged yet.
        </div>
      ) : (
        <div className="timeline-container position-relative ps-3 border-start border-2 ms-2">
          {updates.map((item, idx) => (
            <div key={item.id || idx} className="mb-3 position-relative ps-3">
              {/* Dot marker */}
              <div
                className="position-absolute rounded-circle bg-primary"
                style={{
                  width: '12px',
                  height: '12px',
                  left: '-22px',
                  top: '5px',
                  border: '2px solid white',
                }}
              ></div>

              <div className="d-flex justify-content-between align-items-baseline flex-wrap gap-1">
                <span className={`badge ${getEventBadgeClass(item.event_type)} fw-normal`}>
                  {item.event_type}
                </span>
                <span className="text-muted small">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>

              <p className="mb-1 mt-1 text-dark small" style={{ whiteSpace: 'pre-line' }}>
                {item.description}
              </p>

              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                Logged by <span className="fw-semibold">{item.author_name}</span>
                {item.author_role === 'ADMIN' && (
                  <span className="badge bg-danger ms-1" style={{ fontSize: '0.65rem' }}>
                    Admin
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
