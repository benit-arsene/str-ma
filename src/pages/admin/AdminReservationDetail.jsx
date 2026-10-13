import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarRange,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Route,
  SearchX,
  User,
  Users,
} from "lucide-react";

import { fetchAdminReservation, isUnauthorizedError } from "../../api/admin";
import "./AdminReservationDetail.css";

function formatDate(value) {
  if (!value) return "—";

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-badge-${status}`}>
      <span className="status-badge-dot" aria-hidden="true" />
      {status}
    </span>
  );
}

function DetailField({ icon: Icon, label, value }) {
  return (
    <div className="admin-detail-field">
      <span className="admin-detail-field-icon" aria-hidden="true">
        <Icon size={16} />
      </span>
      <div className="admin-detail-field-text">
        <span className="admin-detail-field-label">{label}</span>
        <span className="admin-detail-field-value">{value}</span>
      </div>
    </div>
  );
}

function AdminReservationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadReservation = async () => {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        const data = await fetchAdminReservation(id);

        if (cancelled) return;
        setReservation(data);
      } catch (err) {
        if (cancelled) return;
        if (isUnauthorizedError(err)) {
          navigate("/admin/login", {
            state: {
              from: location.pathname,
              reason: "Your session has expired. Please sign in again.",
            },
            replace: true,
          });
          return;
        }
        if (err.status === 404) {
          setNotFound(true);
          return;
        }
        setError(err.message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReservation();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, location.pathname, retryCount]);

  const specialRequests = reservation?.specialRequests?.trim();
  const tour = reservation?.tour;

  return (
    <div className="admin-reservation-detail">
      <header className="admin-page-header">
        <div className="admin-page-header-text">
          <div className="admin-eyebrow">
            <span className="admin-eyebrow-dot" aria-hidden="true" />
            <span>Reservations Console</span>
          </div>
          <h1>{reservation ? reservation.bookingReference : "Reservation"}</h1>
          <p>
            {reservation
              ? `Booking record for ${reservation.fullName || "this guest"}.`
              : "Complete record of the selected booking."}
          </p>
        </div>
        <div className="admin-page-header-actions">
          <Link to="/admin/reservations" className="admin-btn admin-btn-primary">
            <ArrowLeft size={18} aria-hidden="true" />
            <span>Back to reservations</span>
          </Link>
        </div>
      </header>

      {loading && (
        <div className="admin-state-block">
          <Loader2 size={32} className="spinner" />
          <p>Loading reservation...</p>
        </div>
      )}

      {error && (
        <div className="admin-state-block admin-state-error" role="alert">
          <AlertCircle size={32} />
          <p>Failed to load reservation.</p>
          <p className="admin-state-detail">{error}</p>
          <button
            type="button"
            className="admin-state-action"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {notFound && (
        <div className="admin-empty-state">
          <SearchX size={32} />
          <p>Reservation not found.</p>
          <span>
            This reservation may no longer exist, or the link may be incorrect.
          </span>
          <Link to="/admin/reservations" className="admin-state-action">
            Back to reservations
          </Link>
        </div>
      )}

      {!loading && !error && !notFound && reservation && (
        <section className="admin-table-card">
          <div className="admin-table-card-header">
            <div className="admin-table-card-title">
              <div className="admin-table-card-title-row">
                <h2>Reservation details</h2>
                <StatusBadge status={reservation.status} />
              </div>
              <p>Guest contact information, tour and booking metadata.</p>
            </div>
          </div>

          <div className="admin-detail-body">
            <div className="admin-detail-group">
              <h3 className="admin-detail-group-title">Guest</h3>
              <div className="admin-detail-fields">
                <DetailField
                  icon={User}
                  label="Full name"
                  value={reservation.fullName || "—"}
                />
                <DetailField
                  icon={Mail}
                  label="Email"
                  value={reservation.email || "—"}
                />
                <DetailField
                  icon={Phone}
                  label="Phone"
                  value={reservation.phone || "—"}
                />
              </div>
            </div>

            <div className="admin-detail-group">
              <h3 className="admin-detail-group-title">Tour</h3>
              <div className="admin-detail-fields">
                <DetailField
                  icon={Route}
                  label="Tour"
                  value={tour?.name || "—"}
                />
                <DetailField
                  icon={MapPin}
                  label="Destination"
                  value={tour?.destinationName || "—"}
                />
              </div>
            </div>

            <div className="admin-detail-group">
              <h3 className="admin-detail-group-title">Booking</h3>
              <div className="admin-detail-fields">
                <DetailField
                  icon={CalendarRange}
                  label="Travel date"
                  value={formatDate(reservation.travelDate)}
                />
                <DetailField
                  icon={Users}
                  label="Travelers"
                  value={reservation.travelers ?? "—"}
                />
              </div>
            </div>

            <div className="admin-detail-group">
              <h3 className="admin-detail-group-title">Timestamps</h3>
              <div className="admin-detail-fields">
                <DetailField
                  icon={Clock}
                  label="Created"
                  value={formatDateTime(reservation.createdAt)}
                />
                <DetailField
                  icon={Clock}
                  label="Last updated"
                  value={formatDateTime(reservation.updatedAt)}
                />
              </div>
            </div>

            <div className="admin-detail-requests">
              <h3 className="admin-detail-group-title">Special requests</h3>
              {specialRequests ? (
                <p className="admin-detail-requests-text">
                  {reservation.specialRequests}
                </p>
              ) : (
                <p className="admin-detail-none">None provided</p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminReservationDetail;
