import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import UrgencyBadge from '../components/UrgencyBadge';
import StatusBadge from '../components/StatusBadge';

export default function ReportsListPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('');
  const [animalType, setAnimalType] = useState('All');
  const [reportType, setReportType] = useState('All');
  const [urgency, setUrgency] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('emergency'); // 'emergency' or 'newest'

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.set('search', search.trim());
      if (area.trim()) queryParams.set('area', area.trim());
      if (animalType !== 'All') queryParams.set('animal_type', animalType);
      if (reportType !== 'All') queryParams.set('report_type', reportType);
      if (urgency !== 'All') queryParams.set('urgency', urgency);
      if (status !== 'All') queryParams.set('status', status);
      queryParams.set('sort', sort);

      const data = await apiRequest(`/api/reports?${queryParams.toString()}`);
      setReports(data.reports || []);
    } catch (err) {
      setError(err.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, [search, area, animalType, reportType, urgency, status, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports();
    }, 250); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchReports]);

  const handleResetFilters = () => {
    setSearch('');
    setArea('');
    setAnimalType('All');
    setReportType('All');
    setUrgency('All');
    setStatus('All');
    setSort('emergency');
  };

  const hasActiveFilters =
    search || area || animalType !== 'All' || reportType !== 'All' || urgency !== 'All' || status !== 'All' || sort !== 'emergency';

  return (
    <div className="my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">🐾 Animal Rescue Feed</h2>
          <p className="text-muted small mb-0">
            Search, filter, and coordinate active animal rescues across Bangladesh.
          </p>
        </div>
        <Link to="/reports/new" className="btn btn-warning fw-bold shadow-sm">
          🚨 + Report Animal
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card shadow-sm border-0 p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center mb-3">
          {/* Keyword Search */}
          <div className="col-md-7 col-lg-8">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">🔍</span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by keywords (e.g., puppy injured, Dhanmondi, bleeding, stray cat)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearch('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Location / Area quick search */}
          <div className="col-md-5 col-lg-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">📍</span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Filter by area / neighborhood..."
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Multi-Criteria Filters Row */}
        <div className="row g-2 align-items-center">
          {/* Urgency Filter */}
          <div className="col-6 col-sm-4 col-md-2">
            <label className="form-label small fw-semibold text-muted mb-1">Urgency</label>
            <select
              className="form-select form-select-sm"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
            >
              <option value="All">All Urgencies</option>
              <option value="Critical">🔴 Critical</option>
              <option value="Urgent">🟠 Urgent</option>
              <option value="Normal">🔵 Normal</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-sm-4 col-md-2">
            <label className="form-label small fw-semibold text-muted mb-1">Status</label>
            <select
              className="form-select form-select-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Animal Category */}
          <div className="col-6 col-sm-4 col-md-2">
            <label className="form-label small fw-semibold text-muted mb-1">Animal</label>
            <select
              className="form-select form-select-sm"
              value={animalType}
              onChange={(e) => setAnimalType(e.target.value)}
            >
              <option value="All">All Animals</option>
              <option value="Cat">Cat</option>
              <option value="Dog">Dog</option>
              <option value="Bird">Bird</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Report Type */}
          <div className="col-6 col-sm-4 col-md-2">
            <label className="form-label small fw-semibold text-muted mb-1">Report Type</label>
            <select
              className="form-select form-select-sm"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Injured">Injured</option>
              <option value="Abandoned">Abandoned</option>
              <option value="Stray">Stray</option>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
            </select>
          </div>

          {/* Sorting Switcher */}
          <div className="col-8 col-sm-5 col-md-3">
            <label className="form-label small fw-semibold text-muted mb-1">Sort Order</label>
            <select
              className="form-select form-select-sm fw-semibold"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="emergency">🚨 Emergency Priority (Critical First)</option>
              <option value="newest">🕒 Newest First</option>
            </select>
          </div>

          {/* Clear Button */}
          {hasActiveFilters && (
            <div className="col-4 col-sm-3 col-md-1 d-flex align-items-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-sm btn-outline-danger w-100"
                title="Reset all filters"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Results Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted small">
          Showing <strong>{reports.length}</strong> rescue {reports.length === 1 ? 'case' : 'cases'}
          {sort === 'emergency' && ' (sorted by urgency priority)'}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading rescue reports...</span>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0">
          <h4 className="fw-bold text-muted">No rescue reports match your filters.</h4>
          <p className="text-muted small">Try adjusting your search keywords, area, or urgency filters.</p>
          {hasActiveFilters && (
            <div className="mt-2">
              <button onClick={handleResetFilters} className="btn btn-outline-secondary btn-sm">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {reports.map((report) => (
            <div key={report.id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0 position-relative">
                {report.image_url ? (
                  <img
                    src={report.image_url}
                    alt={report.animal_type}
                    className="card-img-top object-fit-cover"
                    style={{ height: '190px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    className="bg-light d-flex align-items-center justify-content-center text-muted fw-bold"
                    style={{ height: '150px' }}
                  >
                    🐾 {report.animal_type}
                  </div>
                )}

                <div className="card-body d-flex flex-column">
                  {/* Top Badges */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-light text-dark border">
                      {report.animal_type} • {report.report_type}
                    </span>
                    <UrgencyBadge urgency={report.urgency} />
                  </div>

                  <h5 className="card-title fw-bold text-truncate mb-1">{report.location}</h5>

                  <p className="card-text text-muted small flex-grow-1 mb-2">
                    {report.description.length > 115
                      ? `${report.description.substring(0, 115)}...`
                      : report.description}
                  </p>

                  {/* Coordination Stats */}
                  <div className="d-flex gap-3 small text-muted my-2 py-1 bg-light rounded px-2">
                    <span>
                      🤝 <strong>{report.offers_count || 0}</strong> {report.offers_count === 1 ? 'offer' : 'offers'}
                    </span>
                    <span>
                      ⏱ <strong>{report.updates_count || 0}</strong> {report.updates_count === 1 ? 'update' : 'updates'}
                    </span>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
                    <StatusBadge status={report.status} />
                    <Link to={`/reports/${report.id}`} className="btn btn-outline-dark btn-sm fw-semibold">
                      View Case &rarr;
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
