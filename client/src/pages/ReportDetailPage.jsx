import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import UrgencyBadge from '../components/UrgencyBadge';
import StatusBadge from '../components/StatusBadge';
import ReportTimeline from '../components/ReportTimeline';
import VolunteerOfferModal from '../components/VolunteerOfferModal';

export default function ReportDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [timelineUpdates, setTimelineUpdates] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & form state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const isOwner = user && report && user.id === report.reporter_id;
  const isAdmin = user && user.role === 'ADMIN';
  const isOwnerOrAdmin = isOwner || isAdmin;

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch Report Details
      const data = await apiRequest(`/api/reports/${id}`);
      setReport(data.report);

      // 2. Fetch Timeline Updates
      const timelineData = await apiRequest(`/api/reports/${id}/updates`);
      setTimelineUpdates(timelineData.updates || []);

      // 3. If Owner or Admin, fetch incoming offers
      if (user && (user.id === data.report.reporter_id || user.role === 'ADMIN')) {
        try {
          const offersData = await apiRequest(`/api/reports/${id}/offers`);
          setOffers(offersData.offers || []);
        } catch (offerErr) {
          console.error('Failed to load offers:', offerErr);
        }
      }
    } catch (err) {
      setError(err.message || 'Could not load report details.');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to transition this case to '${newStatus}'?`)) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setStatusMsg('');
      const res = await apiRequest(`/api/reports/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setReport(res.report);
      setStatusMsg(`Case status successfully changed to ${newStatus}.`);

      // Refresh timeline after status transition
      const timelineData = await apiRequest(`/api/reports/${id}/updates`);
      setTimelineUpdates(timelineData.updates || []);
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOfferStatusChange = async (offerId, newOfferStatus) => {
    try {
      await apiRequest(`/api/reports/${id}/offers/${offerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newOfferStatus }),
      });

      // Reload offers and timeline
      const offersData = await apiRequest(`/api/reports/${id}/offers`);
      setOffers(offersData.offers || []);

      const timelineData = await apiRequest(`/api/reports/${id}/updates`);
      setTimelineUpdates(timelineData.updates || []);
    } catch (err) {
      alert(err.message || 'Failed to update offer status.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading rescue report...</span>
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

  const isResolved = report.status === 'Resolved';

  return (
    <div className="my-4">
      {/* Breadcrumb */}
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

      {statusMsg && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {statusMsg}
          <button
            type="button"
            className="btn-close"
            onClick={() => setStatusMsg('')}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Report Details & Timeline */}
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
          </div>

          {/* Rescue Timeline Component */}
          <ReportTimeline
            reportId={report.id}
            updates={timelineUpdates}
            isOwnerOrAdmin={isOwnerOrAdmin}
            onUpdateAdded={loadReportData}
          />

          {/* Incoming Offers Section (Owner / Admin Only) */}
          {isOwnerOrAdmin && (
            <div className="card shadow-sm border-0 p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <h5 className="fw-bold mb-0">
                  📥 Received Volunteer Assistance Offers ({offers.length})
                </h5>
                <span className="badge bg-info text-dark">Confidential Contact Info</span>
              </div>

              {offers.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No volunteer assistance offers submitted yet for this case.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {offers.map((offer) => (
                    <div key={offer.id} className="card border bg-light p-3">
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                        <div>
                          <span className="badge bg-primary me-2">{offer.help_type}</span>
                          <span className="fw-bold text-dark">{offer.volunteer_name}</span>
                          {offer.volunteer_area && (
                            <span className="text-muted small ms-2">📍 {offer.volunteer_area}</span>
                          )}
                        </div>
                        <span
                          className={`badge ${
                            offer.status === 'Accepted'
                              ? 'bg-success'
                              : offer.status === 'Declined'
                              ? 'bg-danger'
                              : 'bg-secondary'
                          }`}
                        >
                          {offer.status}
                        </span>
                      </div>

                      {offer.message && (
                        <p className="small text-muted mb-2 ps-1 fst-italic">
                          &ldquo;{offer.message}&rdquo;
                        </p>
                      )}

                      <div className="bg-white p-2 rounded border small mb-2">
                        <strong>Contact Volunteer:</strong> 📞{' '}
                        <a href={`tel:${offer.volunteer_phone}`} className="me-3">
                          {offer.volunteer_phone || 'N/A'}
                        </a>
                        ✉️ <a href={`mailto:${offer.volunteer_email}`}>{offer.volunteer_email}</a>
                      </div>

                      {/* Reporter Actions on Offer */}
                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Offered on {new Date(offer.created_at).toLocaleString()}
                        </span>
                        <div className="d-flex gap-1">
                          {offer.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleOfferStatusChange(offer.id, 'Accepted')}
                                className="btn btn-sm btn-success py-0 px-2 fw-semibold"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleOfferStatusChange(offer.id, 'Declined')}
                                className="btn btn-sm btn-outline-danger py-0 px-2"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {offer.status === 'Accepted' && (
                            <button
                              onClick={() => handleOfferStatusChange(offer.id, 'Completed')}
                              className="btn btn-sm btn-outline-secondary py-0 px-2"
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Coordination, Status Controls & Actions */}
        <div className="col-lg-4">
          {/* Status Controls Card (for Reporter & Admin) */}
          {isOwnerOrAdmin && (
            <div className="card shadow-sm border-0 p-4 mb-4 bg-light">
              <h5 className="fw-bold border-bottom pb-2 mb-3">⚙️ Manage Case Status</h5>
              <p className="text-muted small mb-3">
                Update the operational status of this rescue case. This will notify volunteers and record a milestone in the timeline.
              </p>

              <div className="d-flex flex-column gap-2">
                <button
                  disabled={updatingStatus || report.status === 'Active'}
                  onClick={() => handleStatusChange('Active')}
                  className={`btn btn-sm text-start fw-semibold ${
                    report.status === 'Active' ? 'btn-primary' : 'btn-outline-primary bg-white'
                  }`}
                >
                  🔵 Active (Still needs rescue assistance)
                </button>
                <button
                  disabled={updatingStatus || report.status === 'In Progress'}
                  onClick={() => handleStatusChange('In Progress')}
                  className={`btn btn-sm text-start fw-semibold ${
                    report.status === 'In Progress' ? 'btn-warning text-dark' : 'btn-outline-warning text-dark bg-white'
                  }`}
                >
                  🟠 In Progress (Assistance / vet care underway)
                </button>
                <button
                  disabled={updatingStatus || report.status === 'Resolved'}
                  onClick={() => handleStatusChange('Resolved')}
                  className={`btn btn-sm text-start fw-semibold ${
                    report.status === 'Resolved' ? 'btn-success' : 'btn-outline-success bg-white'
                  }`}
                >
                  🟢 Resolved (Safe / treated / closed)
                </button>
              </div>
            </div>
          )}

          {/* Volunteer Action Card */}
          <div className="card shadow-sm border-0 p-4 mb-4">
            <h5 className="fw-bold border-bottom pb-2 mb-3">Rescue Coordination</h5>

            <div className="mb-3">
              <label className="text-muted small d-block">Reported By</label>
              <div className="fw-semibold">{report.reporter_name}</div>
            </div>

            <div className="mb-3">
              <label className="text-muted small d-block">Reporter Contact</label>
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

            {/* Volunteer Offer Action */}
            <div className="mt-4 pt-3 border-top">
              {isResolved ? (
                <div className="alert alert-secondary py-2 small mb-0 text-center fw-semibold">
                  ✅ This rescue case has been resolved. Volunteer offers are closed.
                </div>
              ) : isOwner ? (
                <div className="alert alert-light border py-2 small mb-0 text-center text-muted">
                  You are the author of this report. Manage incoming offers in the panel on the left.
                </div>
              ) : user ? (
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="btn btn-warning w-100 fw-bold shadow-sm py-2"
                >
                  🤝 I Can Help (Volunteer)
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-muted small mb-2">Want to volunteer to assist this animal?</p>
                  <Link to="/login" className="btn btn-outline-primary btn-sm w-100 fw-semibold">
                    Log in to Offer Help
                  </Link>
                </div>
              )}
            </div>
          </div>

          <Link to="/reports" className="btn btn-outline-secondary w-100">
            &larr; Back to Rescue Feed
          </Link>
        </div>
      </div>

      {/* Volunteer Offer Modal */}
      {showOfferModal && (
        <VolunteerOfferModal
          reportId={report.id}
          animalType={report.animal_type}
          location={report.location}
          onClose={() => setShowOfferModal(false)}
          onOfferSubmitted={loadReportData}
        />
      )}
    </div>
  );
}
