path = "src/components/admin/ReservationTable.jsx"
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()
old = """                <div className="admin-status-cell">
                  <StatusBadge status={reservation.status} />
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
                </div>"""
new = """                <div className="admin-status-cell">
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
                </div>"""
if old not in s:
    print("no")
else:
    s2 = s.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(s2)
    print("yes")
