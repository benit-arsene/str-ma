const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }
  return "";
};

// Thrown for HTTP responses that are not ok. A network/timeout failure
// (fetch itself throwing) is NOT an ApiError and has no `status`, which lets
// callers distinguish a definitive server reply from an ambiguous wire error.
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error || `Request failed: ${response.status} ${response.statusText}`
    );
  }
  return data;
}

export async function initiatePayment(reservationId) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/payments/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reservationId }),
  });
  return handleResponse(response);
}

export async function simulatePaymentOutcome(transactionReference, outcome) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/payments/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transactionReference, outcome }),
  });
  return handleResponse(response);
}

export async function fetchPayment(transactionReference) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/payments/${transactionReference}`);
  return handleResponse(response);
}

export { ApiError };
