import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    area: user?.area || '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="row justify-content-center my-4">
      <div className="col-md-7 col-lg-6">
        <div className="card shadow-sm border-0 p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
            <h3 className="fw-bold mb-0">My Account Profile</h3>
            <span className={`badge ${user?.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
              {user?.role}
            </span>
          </div>

          {message && <div className="alert alert-success py-2">{message}</div>}
          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address (Read-only)</label>
              <input
                type="text"
                disabled
                className="form-control bg-light"
                value={user?.email || ''}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name</label>
              <input
                type="text"
                required
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Contact Phone</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 017xxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">General Area / District</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mirpur, Dhaka"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-warning fw-bold px-4 py-2"
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
