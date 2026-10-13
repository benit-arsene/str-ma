import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";

import {
  fetchAdminReservations,
  fetchAdminStats,
  isUnauthorizedError,
} from "../../api/admin";
import { useAdminAuth } from "../../context/useAdminAuth";
import ReservationTable from "../../components/admin/ReservationTable";
import "./AdminDashboard.css";

const RECENT_RESERVATIONS_LIMIT = 5;

function formatMetric(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return value.toLocaleString();
}

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="admin-stat-card">
      <div className={`admin-stat-icon admin-stat-icon--${tone}`}>
        <Icon size={20} />
      </div>
      <div className="admin-stat-content">
        <span className="admin-stat-value">{value}</span>
        <span className="admin-stat-label">{label}</span>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin } = useAdminAuth();

  const [stats, setStats] = useState(null);
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsData, reservationsData] = await Promise.all([
          fetchAdminStats(),
          fetchAdminReservations({
            page: 1,
            limit: RECENT_RESERVATIONS_LIMIT,
          }),
        ]);

        if (cancelled) return;
        setStats(statsData);
        setRecentReservations(reservationsData.items || []);
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
        setError(err.message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [navigate, location.pathname, retryCount]);

  const statCards = stats
    ? [
        {
          label: "Total reservations",
          value: formatMetric(stats.total),
          icon: ClipboardList,
          tone: "total",
        },
        {
          label: "Pending reservations",
          value: formatMetric(stats.byStatus?.pending),
          icon: Clock,
          tone: "pending",
        },
        {
          label: "Confirmed reservations",
          value: formatMetric(stats.byStatus?.confirmed),
          icon: CheckCircle2,
          tone: "confirmed",
        },
        {
          label: "Cancelled reservations",
          value: formatMetric(stats.byStatus?.cancelled),
          icon: XCircle,
          tone: "cancelled",
        },
      ]
    : [];

  return (
    <div className="admin-dashboard">
      <header className="admin-page-header">
        <h2>Overview</h2>
        <p>
          Welcome back{admin ? `, ${admin.username}` : ""}. Here is the current
          state of your reservations.
        </p>
      </header>

      {loading && (
        <div className="admin-state-block">
          <Loader2 size={32} className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      )}

      {error && (
        <div className="admin-state-block admin-state-error" role="alert">
          <AlertCircle size={32} />
          <p>Failed to load dashboard data.</p>
          <p className="admin-state-detail">{error}</p>
            <button
              type="button"
              className="admin-state-action"
              onClick={() => {
                setError(null);
                setRetryCount((count) => count + 1);
              }}
            >
              Retry
            </button>
        </div>
      )}

      {!loading && !error && stats && (
        <>
          <section className="admin-stat-grid" aria-label="Reservation statistics">
            {statCards.map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
              />
            ))}
          </section>

          <section className="admin-section-card">
            <div className="admin-section-header">
              <h3>Recent reservations</h3>
              <Link to="/admin/reservations" className="admin-section-link">
                View all <ArrowRight size={15} />
              </Link>
            </div>

            {recentReservations.length === 0 ? (
              <div className="admin-empty-state">
                <ClipboardList size={32} />
                <p>No reservations yet.</p>
                <span>Reservations submitted by customers will appear here.</span>
              </div>
            ) : (
              <ReservationTable reservations={recentReservations} />
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
