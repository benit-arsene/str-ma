import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  RefreshCcw,
  Search,
} from "lucide-react";

import {
  fetchAdminFinance,
  isUnauthorizedError,
} from "../../api/admin";
import { useAdminAuth } from "../../context/useAdminAuth";
import PaymentTable from "../../components/admin/PaymentTable";
import "./AdminFinance.css";

const DEFAULT_LIMIT = 20;

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "initiated", label: "Initiated" },
  { value: "processing", label: "Processing" },
  { value: "succeeded", label: "Succeeded" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

function AdminFinance() {
  const navigate = useNavigate();
  const location = useLocation();
  useAdminAuth();

  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const activeRef = useRef(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    activeRef.current = true;
    let cancelled = false;

    const loadFinance = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchAdminFinance({
          page: currentPage,
          limit: DEFAULT_LIMIT,
          status: statusFilter,
          q: debouncedQuery,
        });

        if (cancelled) return;

        setFinance(data);
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

    loadFinance();
    return () => {
      cancelled = true;
      activeRef.current = false;
    };
  }, [currentPage, statusFilter, debouncedQuery, retryCount, refreshCount, navigate, location.pathname]);

  const handleRefresh = () => {
    setError(null);
    setRefreshCount((count) => count + 1);
  };

  const transactions = finance?.transactions;
  const pagination = transactions?.pagination;

  return (
    <div className="admin-finance">
      <header className="admin-page-header">
        <div className="admin-page-header-text">
          <h1>Finance</h1>
          <p>
            View and filter recorded payment transactions.
          </p>
        </div>
        <div className="admin-page-header-actions">
          <button
            type="button"
            className="admin-btn"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCcw size={18} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      <section className="admin-table-card">
        <div className="admin-table-card-header">
          <div className="admin-table-card-title">
            <div className="admin-table-card-title-row">
              <h2>Transaction history</h2>
              <span className="admin-count-badge">
                {pagination?.total ?? 0} items
              </span>
            </div>
            <p>Recorded payment attempts with reference, amount, and status.</p>
          </div>
          <div className="admin-finance-controls">
            <div className="admin-filter-tabs" role="tablist" aria-label="Filter by status">
              {STATUS_TABS.map((tab) => {
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
                  </button>
                );
              })}
            </div>
            <div className="admin-search-field">
              <Search className="admin-search-icon" aria-hidden="true" />
              <input
                id="finance-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Filter transaction or booking reference"
                aria-label="Search transactions"
              />
            </div>
          </div>
        </div>

        {error && finance && (
          <div className="admin-reservations-update-error" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <p>{error}</p>
            <button
              type="button"
              className="admin-state-action"
              onClick={handleRefresh}
            >
              Retry
            </button>
          </div>
        )}

        <PaymentTable
          transactions={transactions?.items || []}
          pagination={pagination}
          onPageChange={setCurrentPage}
          loading={loading && !finance}
        />
      </section>
    </div>
  );
}

export default AdminFinance;