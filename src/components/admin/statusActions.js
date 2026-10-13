export const STATUS_ACTIONS = {
  pending: [
    { status: "confirmed", label: "Confirm booking", tone: "primary" },
    { status: "cancelled", label: "Cancel booking", tone: "danger" },
  ],
  confirmed: [
    { status: "completed", label: "Mark completed", tone: "primary" },
    { status: "cancelled", label: "Cancel booking", tone: "danger" },
  ],
  cancelled: [
    { status: "pending", label: "Reopen as pending", tone: "primary" },
  ],
  completed: [],
};
