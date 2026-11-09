import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import UrgencyBadge from '../components/UrgencyBadge';
import StatusBadge from '../components/StatusBadge';

export default function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const data = await apiRequest(`/api/reports/${id}`);
        setReport(data.report);
      } catch (err) {
        setError(err.message || 'Could not load report details.');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading report...</span>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="my-5 text-center">
        <div className="alert alert-danger d-inline-block px-4">{error || 'Report not found.'}</div>
        <div>
          <Link to="/reports" className="btn btn-outline-secondary mt-2">
            &larr; Back to Rescue Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/reports">Rescue Feed</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Case #{report.id.substring(0, 8)}
          </li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* Left Column: Details */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
              <div>
                <span className="badge bg-light text-dark border me-2 fs-6">
                  {report.animal_type} • {report.report_type}
                </span>
                <UrgencyBadge urgency={report.urgency} />
              </div>
              <StatusBadge status={report.status} />
            </div>

            <h2 className="fw-bold mb-3">{report.location}</h2>

            {report.image_url && (
              <div className="mb-4">
                <img
                  src={report.image_url}
                  alt={report.animal_type}
                  className="img-fluid rounded shadow-sm w-100"
                  style={{ maxHeight: '420px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="mb-4">
              <h5 className="fw-bold border-bottom pb-2">Description</h5>
              <p className="lead fs-6" style={{ whiteSpace: 'pre-line' }}>
                {report.description}
              </p>
            </div>

            {report.animal_condition && (
              <div className="mb-4">
                <h5 className="fw-bold border-bottom pb-2">Observed Condition</h5>
                <p className="text-muted">{report.animal_condition}</p>
              </div>
            )}

            {/* Placeholder for Member 2 (Timeline & Updates) */}
            <div className="bg-light p-3 rounded border text-muted small mt-4">
              <h6 className="fw-bold mb-1">⏱ Rescue Timeline & Progress Updates</h6>
              <p className="mb-0">
                Chronological updates will appear here once rescue activity begins.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Coordination & Meta */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 p-4 mb-4">
            <h5 className="fw-bold border-bottom pb-2 mb-3">Rescue Coordination</h5>

            <div className="mb-3">
              <label className="text-muted small d-block">Reported By</label>
              <div className="fw-semibold">{report.reporter_name}</div>
            </div>

            <div className="mb-3">
              <label className="text-muted small d-block">Contact Details</label>
              <div className="fw-bold text-primary fs-5">{report.contact_information}</div>
            </div>

            <div className="mb-3">
              <label className="text-muted small d-block">Reported At</label>
              <div>{new Date(report.created_at).toLocaleString()}</div>
            </div>

            <div className="mb-3">
              <label className="text-muted small d-block">Admin Verification</label>
              <div>
                <span
                  className={`badge ${
                    report.verification_status === 'Verified' ? 'bg-success' : 'bg-secondary'
                  }`}
                >
                  {report.verification_status}
                </span>
              </div>
            </div>

            {/* Placeholder for Member 2 (I Can Help Button) */}
            <div className="mt-4 pt-3 border-top">
              <div className="alert alert-secondary py-2 small mb-0 text-center">
                🤝 Volunteer assistance offers will be enabled here in Phase 2.
              </div>
            </div>
          </div>

          <Link to="/reports" className="btn btn-outline-secondary w-100">
            &larr; Back to Rescue Feed
          </Link>
        </div>
      </div>
    </div>
  );
}
