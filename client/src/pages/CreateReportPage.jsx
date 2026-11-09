import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export default function CreateReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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

  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Selected image exceeds the 5MB size limit.');
        return;
      }
      setError('');
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let finalImageUrl = formData.image_url;

      // 1. If user selected a local file, upload it first to /api/upload
      if (uploadMode === 'file' && selectedFile) {
        setStatusText('Uploading animal photograph...');
        const uploadData = new FormData();
        uploadData.append('image', selectedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
          credentials: 'include',
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadJson.error || 'Failed to upload image');
        }

        finalImageUrl = uploadJson.imageUrl;
      }

      // 2. Submit rescue report with image URL
      setStatusText('Publishing rescue report...');
      const payload = {
        ...formData,
        image_url: finalImageUrl,
      };

      const data = await apiRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      navigate(`/reports/${data.report.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please review required fields.');
    } finally {
      setSubmitting(false);
      setStatusText('');
    }
  };

  return (
    <div className="row justify-content-center my-4">
      <div className="col-lg-8">
        <div className="card shadow-sm border-0 p-4">
          <div className="border-bottom pb-3 mb-4">
            <h2 className="fw-bold text-danger mb-1">🚨 Report an Animal in Need</h2>
            <p className="text-muted small mb-0">
              Provide accurate details and photos to help nearby volunteers coordinate rescue and medical care.
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

            <div className="mb-4">
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

            {/* Direct Image Upload / URL Section */}
            <div className="card bg-light border p-3 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-bold mb-0">📸 Animal Photograph</label>
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className={`btn ${uploadMode === 'file' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setUploadMode('file')}
                  >
                    📁 Upload from Device
                  </button>
                  <button
                    type="button"
                    className={`btn ${uploadMode === 'url' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setUploadMode('url')}
                  >
                    🔗 Image Link
                  </button>
                </div>
              </div>

              {uploadMode === 'file' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    className="form-control mb-2"
                    onChange={handleFileChange}
                  />
                  <div className="text-muted small">
                    Supported formats: JPG, PNG, WEBP, GIF (Max 5MB)
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    name="image_url"
                    className="form-control mb-2"
                    placeholder="https://example.com/photo.jpg"
                    value={formData.image_url}
                    onChange={(e) => {
                      handleChange(e);
                      setPreviewUrl(e.target.value);
                    }}
                  />
                  <div className="text-muted small">Paste a direct web link to the photograph</div>
                </div>
              )}

              {/* Instant Live Preview */}
              {previewUrl && (
                <div className="mt-3 text-center position-relative">
                  <div className="small fw-semibold text-muted mb-1">Image Preview:</div>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="img-thumbnail rounded shadow-sm"
                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                    onError={() => setPreviewUrl('')}
                  />
                  <div className="mt-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleClearFile}
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end align-items-center gap-3">
              {submitting && (
                <span className="text-muted small fw-semibold">
                  <span className="spinner-border spinner-border-sm me-2 text-danger"></span>
                  {statusText || 'Processing...'}
                </span>
              )}
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={submitting}
                onClick={() => navigate('/reports')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-danger fw-bold px-4"
              >
                {submitting ? 'Submitting...' : 'Publish Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
