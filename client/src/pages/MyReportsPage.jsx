import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import UrgencyBadge from '../components/UrgencyBadge';
import StatusBadge from '../components/StatusBadge';

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyReports();
  }, []);

  async function fetchMyReports() {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest('/api/users/me/reports');
      setReports(data.reports || []);
    } catch (err) {
      setError(err.message || 'Failed to load your reports.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">📋 My Submitted Rescue Reports</h2>
          <p className="text-muted small mb-0">
            Monitor and coordinate all animal rescue cases you have published.
          </p>
        </div>
        <Link to="/reports/new" className="btn btn-warning fw-bold shadow-sm">
          🚨 + Report Another Animal
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading your reports...</span>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0">
          <h4 className="fw-bold text-muted">You have not submitted any rescue reports yet.</h4>
          <p className="text-muted small">
            When you report an animal in need, it will appear here so you can coordinate with volunteers.
          </p>
          <div className="mt-3">
            <Link to="/reports/new" className="btn btn-warning fw-bold">
              Submit a Rescue Report
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {reports.map((report) => (
            <div key={report.id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                {report.image_url ? (
                  <img
                    src={report.image_url}
                    alt={report.animal_type}
                    className="card-img-top object-fit-cover"
                    style={{ height: '170px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    className="bg-light d-flex align-items-center justify-content-center text-muted fw-bold"
                    style={{ height: '130px' }}
                  >
                    🐾 {report.animal_type}
                  </div>
                )}

                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-light text-dark border">
                      {report.animal_type} • {report.report_type}
                    </span>
                    <UrgencyBadge urgency={report.urgency} />
                  </div>

                  <h5 className="card-title fw-bold text-truncate mb-1">{report.location}</h5>
                  <p className="card-text text-muted small flex-grow-1 mb-3">
                    {report.description.length > 100
                      ? `${report.description.substring(0, 100)}...`
                      : report.description}
                  </p>

                  {/* Highlights */}
                  <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded small mb-3">
                    <span>
                      🤝 <strong>{report.offers_count || 0}</strong>{' '}
                      {report.offers_count === 1 ? 'Help Offer' : 'Help Offers'}
                    </span>
                    <span>
                      ⏱ <strong>{report.updates_count || 0}</strong> Timeline updates
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <StatusBadge status={report.status} />
                    <Link
                      to={`/reports/${report.id}`}
                      className="btn btn-sm btn-primary fw-semibold"
                    >
                      Manage Case &rarr;
                    </Link>
                  </div>
                </div>

                <div className="card-footer bg-white border-0 text-muted small pt-0 pb-3">
                  Reported on {new Date(report.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
