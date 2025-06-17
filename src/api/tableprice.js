const BASE_URL = "http://localhost:8084";
const SERVICE_URL = "http://localhost:8083";
const CATEGORY_URL = "http://localhost:8086";

export const fetchSalons = async () => {
  try {
    const response = await fetch(`${BASE_URL}/salon`);
    if (!response.ok) throw new Error("Failed to fetch salons");
    return await response.json();
  } catch (error) {
    console.error("Error fetching salons:", error);
    return [];
  }
};

export const fetchServicesBySalon = async (salonId) => {
  try {
    const response = await fetch(
      `${SERVICE_URL}/service-offering/salon/${salonId}`
    );
    if (!response.ok) throw new Error("Failed to fetch services");
    return await response.json();
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
};

export const fetchCategoriesBySalon = async (salonId) => {
  try {
    const response = await fetch(`${CATEGORY_URL}/categories/salon/${salonId}`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const getSalonImageUrl = (image) => `${BASE_URL}/salon-images/${image}`;
export const getServiceImageUrl = (image) =>
  `${SERVICE_URL}/service-offering-images/${image}`;
