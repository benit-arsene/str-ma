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

export async function fetchTourBySlug(slug) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/tours/${slug}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Tour not found");
    }
    throw new Error(`Failed to fetch tour: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchDestinations() {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/destinations`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch destinations: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchCategories() {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/categories`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchItinerary(slug) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/tours/${slug}/itinerary`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Tour not found");
    }
    throw new Error(`Failed to fetch itinerary: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}