import { ArrowDown, CircleSlash, Clock, Copy, DollarSign, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import "./PaymentTable.css";

const STATUS_META = {
  initiated: { label: "Initiated", Icon: Clock },
  processing: { label: "Processing", Icon: Loader2 },
  succeeded: { label: "Succeeded", Icon: ArrowDown },
  failed: { label: "Failed", Icon: XCircle },
  cancelled: { label: "Cancelled", Icon: CircleSlash },
};

function formatCurrency(amount, currency) {
  if (amount === null || amount === undefined) {
    return "—";
  }
  const value = Number(amount);
  if (Number.isNaN(value)) {
    return "—";
  }
  const validCurrency =
    currency && typeof currency === "string" && /^[A-Z]{3}$/.test(currency)
      ? currency
      : undefined;
  try {
    return new Intl.NumberFormat(undefined, {
      style: validCurrency ? "currency" : "decimal",
      currency: validCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}

function formatDate(value) {
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
  const variant = STATUS_META[status] ? status : "unknown";
  const { label, Icon } = STATUS_META[variant] || { label: "Unknown", Icon: CircleSlash };
  return (
    <span
      className={`payment-status-badge payment-status-badge-${variant}`}
      title={`Payment status: ${label}`}
    >
      <Icon size={14} className="payment-status-icon" aria-hidden="true" />
      <span className="payment-status-label">{label}</span>
    </span>
  );
}

function CopyReferenceButton({ value }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable; nothing to do.
    }
  };
  return (
    <button
      type="button"
      className={copied ? "payment-ref-copy is-copied" : "payment-ref-copy"}
      onClick={handleCopy}
      title={copied ? "Copied" : "Copy reference"}
      aria-label={copied ? "Reference copied" : "Copy reference"}
    >
      <Copy size={14} aria-hidden="true" />
    </button>
  );
}

function PaymentTable({ transactions = [], pagination, onPageChange, loading }) {
  if (loading) {
    return (
      <div className="payment-table-state">
        <Loader2 size={32} className="spinner" />
        <p>Loading transactions…</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="payment-table-empty">
        <DollarSign size={32} />
        <p>No transactions found.</p>
        <span>Try adjusting the status filter or search query.</span>
      </div>
    );
  }

  const { total = 0, page = 1, limit = 20, totalPages = 1 } = pagination || {};
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="payment-table-wrapper">
      <table className="payment-table">
        <thead>
          <tr>
            <th scope="col">Transaction reference</th>
            <th scope="col">Booking reference</th>
            <th scope="col" className="col-amount">Amount</th>
            <th scope="col">Gateway fee</th>
            <th scope="col">Merchant net</th>
            <th scope="col">Status</th>
            <th scope="col" className="col-date">Created</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.transaction_reference}>
              <td className="col-ref">
                <div className="payment-ref-cell">
                  <span className="payment-reference-badge" title={tx.transaction_reference}>
                    {tx.transaction_reference}
                  </span>
                  <CopyReferenceButton value={tx.transaction_reference} />
                </div>
              </td>
              <td className="col-ref">
                <span className="payment-booking-badge" title={tx.booking_reference}>
                  {tx.booking_reference}
                </span>
              </td>
              <td className="col-amount">
                <span className="payment-amount" title={`${tx.amount} ${tx.currency}`}>
                  {formatCurrency(tx.amount, tx.currency)}
                </span>
              </td>
              <td>{formatCurrency(tx.gatewayFees, tx.currency)}</td>
              <td>{formatCurrency(tx.merchantNet, tx.currency)}</td>
              <td>
                <StatusBadge status={tx.status} />
              </td>
              <td className="col-date">{formatDate(tx.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="payment-table-footer">
        <span className="payment-table-footer-text">
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{" "}
          <strong>{total}</strong> transactions
        </span>
        {totalPages > 1 && (
          <div className="payment-pagination" role="navigation" aria-label="Transaction pagination">
            <button
              type="button"
              className="payment-page-nav"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (p) => (
                <button
                  key={p}
                  type="button"
                  className={p === page ? "payment-page-number is-active" : "payment-page-number"}
                  onClick={() => onPageChange(p)}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              className="payment-page-nav"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentTable;