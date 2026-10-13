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

function StatusBadge({ status }) {
  return (
    <span className={`admin-status-badge admin-status-${status}`}>{status}</span>
  );
}

function ReservationTable({ reservations }) {
  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Booking reference</th>
            <th scope="col">Customer</th>
            <th scope="col">Tour</th>
            <th scope="col">Travel date</th>
            <th scope="col" className="admin-table-th-number">Travelers</th>
            <th scope="col">Status</th>
            <th scope="col">Created</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.id}>
              <td>
                <span className="admin-reference-badge">
                  {reservation.bookingReference}
                </span>
              </td>
              <td>
                <div className="admin-table-customer">
                  <span className="admin-table-name">
                    {reservation.fullName}
                  </span>
                  <span className="admin-table-email">{reservation.email}</span>
                </div>
              </td>
              <td>
                <div className="admin-table-tour">
                  <span>{reservation.tour ? reservation.tour.name : "—"}</span>
                  {reservation.tour && reservation.tour.destinationName && (
                    <span className="admin-table-destination">
                      {reservation.tour.destinationName}
                    </span>
                  )}
                </div>
              </td>
              <td>{formatDate(reservation.travelDate)}</td>
              <td className="admin-table-number">{reservation.travelers}</td>
              <td>
                <StatusBadge status={reservation.status} />
              </td>
              <td>{formatDate(reservation.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReservationTable;
