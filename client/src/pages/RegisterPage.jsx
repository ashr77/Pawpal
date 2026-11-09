import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    area: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await register(formData);
      navigate('/reports');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="row justify-content-center my-4">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-sm border-0 p-4">
          <div className="text-center mb-4">
            <h2 className="fw-bold">Create Account</h2>
            <p className="text-muted small">Join PawPal to report animals and coordinate rescues</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                className="form-control"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                className="form-control"
                placeholder="e.g. user@pawpal.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password *</label>
              <input
                type="password"
                name="password"
                required
                className="form-control"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  placeholder="017xxxxxxxx"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">General Area</label>
                <input
                  type="text"
                  name="area"
                  className="form-control"
                  placeholder="e.g. Dhanmondi, Dhaka"
                  value={formData.area}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-warning w-100 fw-bold py-2 mt-2"
            >
              {submitting ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div className="text-center mt-3 pt-3 border-top small">
            Already have an account?{' '}
            <Link to="/login" className="text-primary fw-semibold">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
