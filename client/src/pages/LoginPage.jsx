import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/reports';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick fill helper for testing
  const quickFill = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="row justify-content-center my-4">
      <div className="col-md-5 col-lg-4">
        <div className="card shadow-sm border-0 p-4">
          <div className="text-center mb-4">
            <h2 className="fw-bold">Welcome Back</h2>
            <p className="text-muted small">Log in to manage your reports and rescue activities</p>
          </div>

          {error && <div className="alert alert-danger small py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="user@pawpal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                required
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-warning w-100 fw-bold py-2 mt-2"
            >
              {submitting ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          {/* Quick Demo Fill Buttons for Testing */}
          <div className="bg-light p-3 rounded mt-4 border">
            <div className="small fw-bold text-muted mb-2">⚡ Quick Test Credentials:</div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary flex-grow-1"
                onClick={() => quickFill('demo@pawpal.com', 'Password123!')}
              >
                Demo User
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary flex-grow-1"
                onClick={() => quickFill('admin@pawpal.com', 'Admin123!')}
              >
                Admin User
              </button>
            </div>
          </div>

          <div className="text-center mt-3 pt-3 border-top small">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary fw-semibold">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
