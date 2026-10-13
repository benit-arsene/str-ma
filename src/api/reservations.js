const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }
  return "";
};

export async function createReservation(data) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/reservations`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error(responseData.error || "Validation failed");
    }
    if (response.status === 404) {
      throw new Error(responseData.error || "Tour not found");
    }
    if (response.status === 409) {
      throw new Error(responseData.error || "An active reservation already exists for this tour, date, and email");
    }
    throw new Error(responseData.error || `Failed to create reservation: ${response.status} ${response.statusText}`);
  }

  return responseData;
}