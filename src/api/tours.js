const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }
  return "";
};

export async function fetchTours() {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/tours`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tours: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}