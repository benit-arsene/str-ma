import { ArrowDown, CalendarClock, DollarSign, Loader2, XCircle } from "lucide-react";
import "./FinanceSummary.css";

function formatCurrency(amount, currency) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return "—";
  }
  const value = Number(amount);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

function formatCount(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  return Number(value).toLocaleString();
}

function CountRow({ label, value, tone }) {
  return (
    <li className="finance-count-row">
      <span className="finance-count-label">{label}</span>
      <span className={`finance-count-value ${tone || ""}`}>{formatCount(value)}</span>
    </li>
  );
}

function SummaryCard({ currency, data }) {
  const counts = data?.counts || {};
  return (
    <section className="finance-currency-card" aria-label={`Summary for ${currency}`}>
      <div className="finance-currency-head">
        <span className="finance-currency-code" title="Currency">
          {currency}
        </span>
        <span className="finance-currency-note">Simulated figures only</span>
      </div>

      <dl className="finance-metrics">
        <div className="finance-metric">
          <dt>Simulated collected</dt>
          <dd>
            <ArrowDown size={16} aria-hidden="true" className="finance-metric-icon" />
            {formatCurrency(data?.collected, currency)}
          </dd>
        </div>

        <div className="finance-metric">
          <dt>Pending attempts</dt>
          <dd>
            <CalendarClock size={16} aria-hidden="true" className="finance-metric-icon" />
            {formatCurrency(data?.pending, currency)}
            <span className="finance-metric-note">
              {formatCount(data?.pendingCount)} in-flight attempt
              {data?.pendingCount === 1 ? "" : "s"}
            </span>
          </dd>
        </div>

        <div className="finance-metric">
          <dt>Gateway fees</dt>
          <dd>{formatCurrency(data?.gatewayFees, currency)}</dd>
        </div>

        <div className="finance-metric">
          <dt>Merchant net</dt>
          <dd>{formatCurrency(data?.merchantNet, currency)}</dd>
        </div>
      </dl>

      <div className="finance-counts">
        <span className="finance-counts-title">Transactions</span>
        <ul className="finance-counts-list">
          <CountRow label="Total" value={counts.total} tone="total" />
          <CountRow label="Initiated" value={counts.initiated} tone="initiated" />
          <CountRow label="Processing" value={counts.processing} tone="processing" />
          <CountRow label="Succeeded" value={counts.succeeded} tone="succeeded" />
          <CountRow label="Failed" value={counts.failed} tone="failed" />
          <CountRow label="Cancelled" value={counts.cancelled} tone="cancelled" />
        </ul>
      </div>
    </section>
  );
}

function ReservationCounts({ reservations }) {
  return (
    <section className="finance-reservations" aria-label="Reservation counts">
      <h2>Reservations</h2>
      <div className="finance-reservation-grid">
        <div className="finance-reservation-card">
          <span className="finance-reservation-label">Total</span>
          <span className="finance-reservation-value">{formatCount(reservations?.total)}</span>
        </div>
        <div className="finance-reservation-card finance-reservation-card-paid">
          <span className="finance-reservation-label">Paid</span>
          <span className="finance-reservation-value">{formatCount(reservations?.paid)}</span>
        </div>
        <div className="finance-reservation-card finance-reservation-card-unpaid">
          <span className="finance-reservation-label">Unpaid</span>
          <span className="finance-reservation-value">{formatCount(reservations?.unpaid)}</span>
        </div>
      </div>
      <p className="finance-reservation-note">
        A reservation is "paid" when it has at least one succeeded transaction.
        Failed or cancelled attempts do not count as paid.
      </p>
    </section>
  );
}

function FinanceSummary({ summary, reservations, loading, error }) {
  const currencies = summary ? Object.keys(summary) : [];

  return (
    <div className="finance-summary">
      <section className="finance-banner" role="status">
        <div className="finance-banner-text">
          <p className="finance-banner-primary">
            Simulated payment figures — no real money has been collected.
          </p>
          <p className="finance-banner-secondary">
            These figures are for testing and are not withdrawable funds.
          </p>
          <p className="finance-banner-note">
            Pending totals sum in-flight payment attempts, which may include
            multiple attempts for a single reservation and are not guaranteed
            unique amounts owed.
          </p>
        </div>
      </section>

      {loading && (
        <div className="finance-summary-loading">
          <Loader2 size={32} className="spinner" />
          <p>Calculating financial summary…</p>
        </div>
      )}

      {error && !loading && (
        <div className="finance-summary-error" role="alert">
          <XCircle size={32} />
          <p>Failed to load financial summary.</p>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          <ReservationCounts reservations={reservations} />

          {currencies.length === 0 ? (
            <div className="finance-empty">
              <DollarSign size={32} />
              <p>No payment transactions yet.</p>
              <span>Completed payments will appear here.</span>
            </div>
          ) : (
            <div className="finance-currency-grid">
              {currencies.map((currency) => (
                <SummaryCard
                  key={currency}
                  currency={currency}
                  data={summary[currency]}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FinanceSummary;