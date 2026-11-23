import { useState } from 'react';
import { apiRequest } from '../services/api';

export default function VolunteerOfferModal({ reportId, animalType, location, onClose, onOfferSubmitted }) {
  const [helpType, setHelpType] = useState('Rescue');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
    {
      type: 'Rescue',
      icon: '🚑',
      title: 'Rescue & Retrieval',
      desc: 'Help collect or safely capture the animal in distress',
    },
    {
      type: 'Transportation',
      icon: '🚗',
      title: 'Transportation',
      desc: 'Transport the animal to a safe location or veterinary clinic',
    },
    {
      type: 'Temporary Shelter',
      icon: '🏡',
      title: 'Temporary Shelter',
      desc: 'Provide temporary accommodation or fostering',
    },
    {
      type: 'Veterinary Help',
      icon: '🩺',
      title: 'Veterinary Assistance',
      desc: 'Help arrange clinic appointments, consults, or treatment',
    },
    {
      type: 'Financial Help',
      icon: '💵',
      title: 'Financial Contribution',
      desc: 'Offer financial assistance directly for medical expenses',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      await apiRequest(`/api/reports/${reportId}/offers`, {
        method: 'POST',
        body: JSON.stringify({
          help_type: helpType,
          message: message.trim(),
        }),
      });

      setSuccess(true);
      setTimeout(() => {
        if (onOfferSubmitted) onOfferSubmitted();
        onClose();
      }, 1400);
    } catch (err) {
      setError(err.message || 'Failed to submit assistance offer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold">
              🤝 Offer Volunteer Assistance
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4">
            <div className="alert alert-info py-2 small mb-4">
              You are offering to help with this case: <strong>{animalType}</strong> located at{' '}
              <strong>{location}</strong>. Your contact details will be shared privately with the reporter.
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}
            {success && (
              <div className="alert alert-success py-2 text-center fw-bold">
                🎉 Assistance offer submitted successfully! The reporter has been notified.
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit}>
                <label className="form-label fw-bold mb-2">
                  Select Assistance Category *
                </label>
                <div className="row g-2 mb-4">
                  {categories.map((cat) => (
                    <div key={cat.type} className="col-md-6">
                      <div
                        onClick={() => setHelpType(cat.type)}
                        className={`p-3 rounded border h-100 cursor-pointer transition ${
                          helpType === cat.type
                            ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                            : 'bg-white hover-shadow'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center mb-1">
                          <span className="fs-4 me-2">{cat.icon}</span>
                          <span className="fw-bold">{cat.title}</span>
                          {helpType === cat.type && (
                            <span className="badge bg-primary ms-auto">Selected</span>
                          )}
                        </div>
                        <p className="text-muted small mb-0 ps-1">{cat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Message to Reporter (Optional)
                  </label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Describe your availability, vehicle details, equipment, or any specific help you can provide..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary px-4"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary fw-bold px-4"
                  >
                    {submitting ? 'Submitting Offer...' : 'Send Help Offer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
