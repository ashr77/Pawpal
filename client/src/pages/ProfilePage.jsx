import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  // Profile details state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    area: user?.area || '',
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password state
  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setSavingProfile(true);

    try {
      await updateProfile(formData);
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileErr(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdErr('');

    if (pwdData.newPassword.length < 6) {
      setPwdErr('New password must be at least 6 characters long.');
      return;
    }

    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdErr('New password and confirmation do not match.');
      return;
    }

    setSavingPwd(true);
    try {
      await apiRequest('/api/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword: pwdData.currentPassword,
          newPassword: pwdData.newPassword,
        }),
      });
      setPwdMsg('Password updated successfully!');
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdErr(err.message || 'Failed to update password.');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="row justify-content-center my-4 g-4">
      {/* Profile Information Card */}
      <div className="col-lg-6">
        <div className="card shadow-sm border-0 p-4 h-100">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
            <h3 className="fw-bold mb-0">👤 Profile Details</h3>
            <span className={`badge ${user?.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
              {user?.role}
            </span>
          </div>

          {profileMsg && <div className="alert alert-success py-2">{profileMsg}</div>}
          {profileErr && <div className="alert alert-danger py-2">{profileErr}</div>}

          <form onSubmit={handleProfileSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address (Fixed)</label>
              <input
                type="text"
                disabled
                className="form-control bg-light"
                value={user?.email || ''}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name *</label>
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
              disabled={savingProfile}
              className="btn btn-warning fw-bold px-4 py-2"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* Security & Password Card */}
      <div className="col-lg-6">
        <div className="card shadow-sm border-0 p-4 h-100">
          <div className="border-bottom pb-3 mb-3">
            <h3 className="fw-bold mb-0">🔒 Account Security</h3>
            <p className="text-muted small mb-0">Change your password to keep your account safe</p>
          </div>

          {pwdMsg && <div className="alert alert-success py-2">{pwdMsg}</div>}
          {pwdErr && <div className="alert alert-danger py-2">{pwdErr}</div>}

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Current Password *</label>
              <input
                type="password"
                required
                className="form-control"
                placeholder="Enter current password"
                value={pwdData.currentPassword}
                onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">New Password *</label>
              <input
                type="password"
                required
                className="form-control"
                placeholder="At least 6 characters"
                value={pwdData.newPassword}
                onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Confirm New Password *</label>
              <input
                type="password"
                required
                className="form-control"
                placeholder="Re-enter new password"
                value={pwdData.confirmPassword}
                onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={savingPwd}
              className="btn btn-outline-dark fw-bold px-4 py-2"
            >
              {savingPwd ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
