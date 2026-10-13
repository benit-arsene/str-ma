import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";

import {
  fetchAdminReservations,
  fetchAdminStats,
  isUnauthorizedError,
} from "../../api/admin";
import ReservationTable from "../../components/admin/ReservationTable";
import "./AdminReservations.css";

const DEFAULT_LIMIT = 10;

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

function AdminPagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="admin-pagination" role="navigation" aria-label="Pagination">
      <button
        type="button"
        className="admin-page-nav"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (page) => (
          <button
            key={page}
            type="button"
            className={
              page === currentPage
                ? "admin-page-number is-active"
                : "admin-page-number"
            }
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}
      <button
        type="button"
        className="admin-page-nav"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

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
  const [stats, setStats] = useState(null);
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

  useEffect(() => {
    let cancelled = false;

    fetchAdminStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        // Tab counts are supplementary; filters work without them.
      });

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const filtersActive = Boolean(statusFilter || debouncedQuery);

  const tabCount = (tabValue) => {
    if (!stats) return null;
    if (tabValue === "") return stats.total;
    return stats.byStatus?.[tabValue];
  };

  const startItem =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="admin-reservations">
      <header className="admin-page-header">
        <div className="admin-page-header-text">
          <div className="admin-eyebrow">
            <span className="admin-eyebrow-dot" aria-hidden="true" />
            <span>Reservations Console</span>
          </div>
          <h1>Reservations</h1>
          <p>Browse and search customer reservations.</p>
        </div>
      </header>

      <section className="admin-table-card">
        <div className="admin-table-card-header">
          <div className="admin-table-card-title">
            <div className="admin-table-card-title-row">
              <h2>All Reservations</h2>
              <span className="admin-count-badge">
                {pagination.total} items
              </span>
            </div>
            <p>Central register of upcoming guest bookings and ticketing status.</p>
          </div>
          <div className="admin-reservations-controls">
            <div
              className="admin-filter-tabs"
              role="tablist"
              aria-label="Filter by status"
            >
              {STATUS_TABS.map((tab) => {
                const count = tabCount(tab.value);
                const isActive = statusFilter === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={
                      isActive ? "admin-filter-tab is-active" : "admin-filter-tab"
                    }
                    onClick={() => {
                      setStatusFilter(tab.value);
                      setCurrentPage(1);
                    }}
                  >
                    {tab.label}
                    {typeof count === "number" && (
                      <span className="admin-filter-tab-count">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="admin-search-field">
              <Search className="admin-search-icon" aria-hidden="true" />
              <input
                id="reservation-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Filter reference, client..."
                aria-label="Search reservations"
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
                <div className="admin-table-footer">
                  <span className="admin-table-footer-text">
                    Showing <strong>{startItem}</strong> to{" "}
                    <strong>{endItem}</strong> of{" "}
                    <strong>{pagination.total.toLocaleString()}</strong>{" "}
                    reservations
                  </span>
                  {pagination.totalPages > 1 && (
                    <AdminPagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default AdminReservations;
