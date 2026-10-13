import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CalendarX,
  Loader2,
  Search,
} from "lucide-react";

import {
  fetchAdminReservations,
  isUnauthorizedError,
} from "../../api/admin";
import ReservationTable from "../../components/admin/ReservationTable";
import Pagination from "../pagination";
import "./AdminReservations.css";

const DEFAULT_LIMIT = 10;
const ALL_STATUSES = ["pending", "confirmed", "cancelled", "completed"];

function AdminReservations() {
  const navigate = useNavigate();
  const location = useLocation();

  const [reservations, setReservations] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;

    const loadReservations = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchAdminReservations({
          page: currentPage,
          limit: DEFAULT_LIMIT,
          status: statusFilter,
          q: debouncedQuery,
        });

        if (cancelled) return;
        setReservations(data.items || []);
        setPagination(
          data.pagination || {
            total: 0,
            page: 1,
            limit: DEFAULT_LIMIT,
            totalPages: 1,
          }
        );
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

    loadReservations();
    return () => {
      cancelled = true;
    };
  }, [currentPage, statusFilter, debouncedQuery, retryCount, navigate, location.pathname]);

  const filtersActive = Boolean(statusFilter || debouncedQuery);

  return (
    <div className="admin-reservations">
      <header className="admin-page-header">
        <h2>Reservations</h2>
        <p>Browse and search customer reservations.</p>
      </header>

      <section className="admin-section-card">
        <div className="admin-filters">
          <div className="admin-filter-field">
            <label htmlFor="reservation-status-filter">Status</label>
            <select
              id="reservation-status-filter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All statuses</option>
              {ALL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-filter-field admin-filter-search">
            <label htmlFor="reservation-search">Search</label>
            <div className="admin-search-wrapper">
              <Search className="admin-search-icon" aria-hidden="true" />
              <input
                id="reservation-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Booking reference, customer name, or email"
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="admin-state-block">
            <Loader2 size={32} className="spinner" />
            <p>Loading reservations...</p>
          </div>
        )}

        {error && (
          <div className="admin-state-block admin-state-error" role="alert">
            <AlertCircle size={32} />
            <p>Failed to load reservations.</p>
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

        {!loading && !error && (
          <>
            <p className="admin-results-count">
              {pagination.total}{" "}
              {pagination.total === 1 ? "reservation" : "reservations"}
              {filtersActive ? " matching your filters" : ""}
            </p>

            {reservations.length === 0 ? (
              <div className="admin-empty-state">
                <CalendarX size={32} />
                <p>No reservations found.</p>
                <span>
                  {filtersActive
                    ? "Try adjusting the status filter or search query."
                    : "Reservations submitted by customers will appear here."}
                </span>
              </div>
            ) : (
              <>
                <ReservationTable reservations={reservations} />
                {pagination.totalPages > 1 && (
                  <div className="admin-pagination">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default AdminReservations;
