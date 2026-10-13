import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Loader2, Route } from "lucide-react";

import { STATUS_ACTIONS } from "./statusActions";
import "./ReservationTable.css";

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

function guestInitials(name) {
  if (!name) return "—";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function CopyReferenceButton({ value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context); nothing to do.
    }
  };

  return (
    <button
      type="button"
      className={copied ? "admin-ref-copy is-copied" : "admin-ref-copy"}
      onClick={handleCopy}
      title={copied ? "Copied" : "Copy reference"}
      aria-label={
        copied ? "Booking reference copied" : "Copy booking reference"
      }
    >
      <Copy size={14} aria-hidden="true" />
    </button>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-badge-${status}`}>
      <span className="status-badge-dot" aria-hidden="true" />
      {status}
    </span>
  );
}

function ReservationTable({ reservations, onStatusChange, savingId = null }) {
  return (
    <div className="admin-table-wrapper">
      <table className="recent-reservations-table">
        <thead>
          <tr>
            <th scope="col" className="col-ref">
              Ref Code
            </th>
            <th scope="col">Guest / Client</th>
            <th scope="col">Tour Program</th>
            <th scope="col" className="col-date">
              Travel Date
            </th>
            <th scope="col" className="col-pax">
              Pax
            </th>
            <th scope="col">Status</th>
            <th scope="col" className="col-date">
              Logged
            </th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.id}>
              <td className="col-ref">
                <div className="admin-ref-cell">
                  <Link
                    to={`/admin/reservations/${reservation.id}`}
                    className="admin-reference-badge"
                    title={`View reservation ${reservation.bookingReference}`}
                  >
                    {reservation.bookingReference}
                  </Link>
                  <CopyReferenceButton value={reservation.bookingReference} />
                </div>
              </td>
              <td>
                <div className="admin-guest-cell">
                  <span className="admin-guest-avatar" aria-hidden="true">
                    {guestInitials(reservation.fullName)}
                  </span>
                  <div className="admin-guest-text">
                    <span className="admin-guest-name">
                      {reservation.fullName}
                    </span>
                    <span className="admin-guest-email">
                      {reservation.email}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <div className="admin-tour-cell">
                  <Route
                    size={16}
                    className="admin-tour-icon"
                    aria-hidden="true"
                  />
                  <div className="admin-tour-text">
                    <span className="admin-tour-name">
                      {reservation.tour ? reservation.tour.name : "—"}
                    </span>
                    {reservation.tour && reservation.tour.destinationName && (
                      <span className="admin-tour-destination">
                        {reservation.tour.destinationName}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="col-date">{formatDate(reservation.travelDate)}</td>
              <td className="col-pax">
                <span className="admin-pax-badge">{reservation.travelers}</span>
              </td>
              <td>
                <div className="admin-status-cell">
                  <div className="admin-status-wrapper">
                    <div className="admin-status-badge-wrapper">
                      <StatusBadge status={reservation.status} />
                    </div>
                    {onStatusChange &&
                      STATUS_ACTIONS[reservation.status]?.length > 0 && (
                        <div
                          className={
                            savingId === reservation.id
                              ? "admin-row-actions is-saving"
                              : "admin-row-actions"
                          }
                        >
                          {savingId === reservation.id && (
                            <span className="admin-row-saving" role="status">
                              <Loader2
                                size={12}
                                className="spinner"
                                aria-hidden="true"
                              />
                              <span>Saving...</span>
                            </span>
                          )}
                          {STATUS_ACTIONS[reservation.status].map((action) => (
                            <button
                              key={action.status}
                              type="button"
                              className={
                                action.tone === "danger"
                                  ? "admin-row-action admin-row-action-danger"
                                  : "admin-row-action"
                              }
                              onClick={() =>
                                onStatusChange(reservation, action.status)
                              }
                              disabled={savingId === reservation.id}
                              title={`${action.label} for ${reservation.bookingReference}`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </td>
              <td className="col-date">{formatDate(reservation.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReservationTable;
