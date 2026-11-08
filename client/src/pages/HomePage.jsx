import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import UrgencyBadge from '../components/UrgencyBadge';
import StatusBadge from '../components/StatusBadge';

export default function HomePage() {
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecent() {
      try {
        const data = await apiRequest('/api/reports');
        setRecentReports((data.reports || []).slice(0, 3));
      } catch (err) {
        console.error('Error fetching recent reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecent();
  }, []);

  return (
    <div>
      {/* Hero Header */}
      <section className="bg-dark text-white py-5 mb-5 rounded-3 p-4 p-md-5 text-center shadow-sm">
        <h1 className="display-4 fw-bold mb-3">
          Rescue. Care. Protect. 🐾
        </h1>
        <p className="lead mx-auto col-md-8 mb-4">
          PawPal connects animal lovers, responders, and pet owners in Bangladesh. Report injured or stray animals, coordinate rescue operations, and manage vital pet care schedules in one centralized platform.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/reports/new" className="btn btn-warning btn-lg fw-bold px-4">
            🚨 Report an Animal
          </Link>
          <Link to="/reports" className="btn btn-outline-light btn-lg px-4">
            🔍 Browse Rescue Feed
          </Link>
        </div>
      </section>

      {/* Feature Pillars */}
      <div className="row g-4 mb-5 text-center">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0 p-3">
            <div className="fs-1 text-danger mb-2">🆘</div>
            <h5 className="fw-bold">Emergency Prioritization</h5>
            <p className="text-muted small">
              Critical animal cases are prioritized so local volunteers and helpers can respond promptly without delays.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0 p-3">
            <div className="fs-1 text-primary mb-2">🤝</div>
            <h5 className="fw-bold">Volunteer Assistance</h5>
            <p className="text-muted small">
              Structured assistance offers enable transportation, temporary fostering, and clinic coordination without chaotic social feeds.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0 p-3">
            <div className="fs-1 text-success mb-2">📋</div>
            <h5 className="fw-bold">Pet Health Tracking</h5>
            <p className="text-muted small">
              Digital records for vaccinations, medications, and deworming with automatic due-date alerts.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Rescue Feed Preview */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold mb-0">🚨 Recent Rescue Reports</h3>
          <Link to="/reports" className="btn btn-outline-primary btn-sm">
            View All Reports &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : recentReports.length === 0 ? (
          <div className="alert alert-info">No active rescue reports submitted yet.</div>
        ) : (
          <div className="row g-3">
            {recentReports.map((report) => (
              <div key={report.id} className="col-md-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-light text-dark border">
                        {report.animal_type} • {report.report_type}
                      </span>
                      <UrgencyBadge urgency={report.urgency} />
                    </div>
                    <h5 className="card-title fw-bold text-truncate">{report.location}</h5>
                    <p className="card-text text-muted small text-truncate-2">
                      {report.description}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                      <StatusBadge status={report.status} />
                      <Link to={`/reports/${report.id}`} className="btn btn-sm btn-outline-dark">
                        Details &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
