import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import UrgencyBadge from '../components/UrgencyBadge';
import StatusBadge from '../components/StatusBadge';

export default function ReportsListPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      setLoading(true);
      const data = await apiRequest('/api/reports');
      setReports(data.reports || []);
    } catch (err) {
      setError(err.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">🐾 Animal Rescue Feed</h2>
          <p className="text-muted small mb-0">
            Active and ongoing animal rescue reports across Bangladesh.
          </p>
        </div>
        <Link to="/reports/new" className="btn btn-warning fw-bold">
          + New Rescue Report
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading rescue reports...</span>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0">
          <h4 className="fw-bold text-muted">No rescue reports submitted yet.</h4>
          <p className="text-muted">Be the first to report an animal needing assistance.</p>
          <div className="mt-3">
            <Link to="/reports/new" className="btn btn-warning fw-bold">
              Report an Animal
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
                    style={{ height: '180px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    className="bg-light d-flex align-items-center justify-content-center text-muted fw-bold"
                    style={{ height: '140px' }}
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
                  <p className="card-text text-muted small flex-grow-1">
                    {report.description.length > 120
                      ? `${report.description.substring(0, 120)}...`
                      : report.description}
                  </p>

                  <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                    <StatusBadge status={report.status} />
                    <Link to={`/reports/${report.id}`} className="btn btn-outline-dark btn-sm fw-semibold">
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
                <div className="card-footer bg-white border-0 text-muted small pt-0 pb-3">
                  Reported by {report.reporter_name} •{' '}
                  {new Date(report.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
