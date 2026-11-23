import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import UrgencyBadge from '../components/UrgencyBadge';
import StatusBadge from '../components/StatusBadge';

export default function MyOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyOffers();
  }, []);

  async function fetchMyOffers() {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest('/api/users/me/offers');
      setOffers(data.offers || []);
    } catch (err) {
      setError(err.message || 'Failed to load your volunteering offers.');
    } finally {
      setLoading(false);
    }
  }

  const getOfferStatusBadge = (status) => {
    if (status === 'Accepted') return 'bg-success';
    if (status === 'Declined') return 'bg-danger';
    if (status === 'Completed') return 'bg-info text-dark';
    return 'bg-warning text-dark';
  };

  return (
    <div className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">🤝 My Volunteering Activity</h2>
          <p className="text-muted small mb-0">
            Track all the rescue cases you have offered to assist with.
          </p>
        </div>
        <Link to="/reports" className="btn btn-outline-primary fw-semibold">
          🔍 Find Cases Needing Help
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading your volunteering activity...</span>
          </div>
        </div>
      ) : offers.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0">
          <h4 className="fw-bold text-muted">You haven't offered assistance to any rescue cases yet.</h4>
          <p className="text-muted small">
            Browse the rescue feed and look for cases where you can provide rescue, transport, fostering, or medical aid.
          </p>
          <div className="mt-3">
            <Link to="/reports" className="btn btn-warning fw-bold">
              Explore Active Rescue Cases
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {offers.map((offer) => (
            <div key={offer.id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                  <span className="badge bg-primary fs-6 fw-semibold">
                    {offer.help_type}
                  </span>
                  <span className={`badge ${getOfferStatusBadge(offer.offer_status)}`}>
                    Offer: {offer.offer_status}
                  </span>
                </div>

                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-light text-dark border">
                      {offer.animal_type} • {offer.report_type}
                    </span>
                    <UrgencyBadge urgency={offer.urgency} />
                  </div>

                  <h5 className="card-title fw-bold text-truncate mb-1">{offer.location}</h5>

                  {offer.message && (
                    <div className="bg-light p-2 rounded small text-muted fst-italic mb-3">
                      &ldquo;{offer.message}&rdquo;
                    </div>
                  )}

                  <div className="mt-auto pt-2 border-top">
                    <div className="small text-muted mb-2">
                      <strong>Report Status:</strong> <StatusBadge status={offer.report_status} />
                    </div>
                    <div className="small text-muted mb-3">
                      <strong>Reporter:</strong> {offer.reporter_name}
                      {offer.offer_status === 'Accepted' && offer.reporter_phone && (
                        <div>
                          📞 <strong>Contact:</strong> {offer.reporter_phone}
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/reports/${offer.report_id}`}
                      className="btn btn-outline-dark btn-sm w-100 fw-semibold"
                    >
                      View Rescue Report &rarr;
                    </Link>
                  </div>
                </div>

                <div className="card-footer bg-white border-0 text-muted small pt-0 pb-3">
                  Offered on {new Date(offer.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
