import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export default function CreateReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    report_type: 'Injured',
    animal_type: 'Cat',
    urgency: 'Normal',
    location: user?.area || '',
    description: '',
    animal_condition: '',
    contact_information: user?.phone || '',
    image_url: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await apiRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      navigate(`/reports/${data.report.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please review required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="row justify-content-center my-4">
      <div className="col-lg-8">
        <div className="card shadow-sm border-0 p-4">
          <div className="border-bottom pb-3 mb-4">
            <h2 className="fw-bold text-danger mb-1">🚨 Report an Animal in Need</h2>
            <p className="text-muted small mb-0">
              Provide as much detail as possible to help nearby volunteers coordinate rescue and treatment.
            </p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Report Type *</label>
                <select
                  name="report_type"
                  className="form-select"
                  value={formData.report_type}
                  onChange={handleChange}
                >
                  <option value="Injured">Injured Animal</option>
                  <option value="Abandoned">Abandoned Animal</option>
                  <option value="Stray">Stray in Distress</option>
                  <option value="Lost">Lost Pet</option>
                  <option value="Found">Found Animal</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Animal Type *</label>
                <select
                  name="animal_type"
                  className="form-select"
                  value={formData.animal_type}
                  onChange={handleChange}
                >
                  <option value="Cat">Cat</option>
                  <option value="Dog">Dog</option>
                  <option value="Bird">Bird</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Urgency Level *</label>
                <select
                  name="urgency"
                  className="form-select"
                  value={formData.urgency}
                  onChange={handleChange}
                >
                  <option value="Critical">Critical (Immediate danger/severe injury)</option>
                  <option value="Urgent">Urgent (Needs prompt attention)</option>
                  <option value="Normal">Normal (Stable condition)</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Exact Location / Landmarks *</label>
              <input
                type="text"
                name="location"
                required
                className="form-control"
                placeholder="e.g. Near Dhanmondi Lake, Road 8A, beside the red bridge"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Observed Physical Condition</label>
              <input
                type="text"
                name="animal_condition"
                className="form-control"
                placeholder="e.g. Limping left front paw, dehydrated, bleeding"
                value={formData.animal_condition}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Detailed Description *</label>
              <textarea
                name="description"
                required
                rows="4"
                className="form-control"
                placeholder="Describe the situation, how long the animal has been there, any temporary shelter provided..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Contact Info for Coordination *</label>
                <input
                  type="text"
                  name="contact_information"
                  required
                  className="form-control"
                  placeholder="Phone number or contact channel"
                  value={formData.contact_information}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Image URL (Optional)</label>
                <input
                  type="url"
                  name="image_url"
                  className="form-control"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.image_url}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/reports')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-danger fw-bold px-4"
              >
                {submitting ? 'Publishing Report...' : 'Publish Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
