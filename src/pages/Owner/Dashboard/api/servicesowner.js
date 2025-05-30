import axios from "axios";

// API base URLs
const SALON_API = "http://localhost:8084/salon";
const CATEGORY_API = "http://localhost:8086/categories/salon";
const SERVICE_API = "http://localhost:8083/service-offering";
const SERVICE_OWNER_API = "http://localhost:8083/service-offering/salon-owner";
const IMAGE_BASE_URL = "http://localhost:8083/service-offering-images";

// Fetch all salons
export const fetchSalons = async () => {
  try {
    const response = await axios.get(SALON_API);
    return response.data;
  } catch (error) {
    console.error("Error fetching salons:", error);
    throw new Error("Không thể tải danh sách salon");
  }
};

// Fetch categories for a specific salon
export const fetchCategoriesBySalon = async (salonId) => {
  try {
    const response = await axios.get(`${CATEGORY_API}/${salonId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching categories for salon ${salonId}:`, error);
    throw new Error("Không thể tải danh sách danh mục");
  }
};

// Fetch services for a specific salon
export const fetchServicesBySalon = async (salonId) => {
  try {
    const response = await axios.get(`${SERVICE_API}/salon/${salonId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching services for salon ${salonId}:`, error);
    throw new Error("Không thể tải danh sách dịch vụ");
  }
};

// Create a new service
export const createService = async (serviceData) => {
  try {
    const response = await axios.post(SERVICE_OWNER_API, serviceData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating service:", error);
    throw new Error("Không thể tạo dịch vụ");
  }
};

// Update an existing service
export const updateService = async (serviceId, serviceData) => {
  try {
    const response = await axios.put(
      `${SERVICE_OWNER_API}/${serviceId}`,
      serviceData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating service ${serviceId}:`, error);
    throw new Error("Không thể cập nhật dịch vụ");
  }
};

// Delete a service
export const deleteService = async (serviceId) => {
  try {
    await axios.delete(`${SERVICE_OWNER_API}/${serviceId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting service ${serviceId}:`, error);
    throw new Error("Không thể xóa dịch vụ");
  }
};

// Get image URL
export const getImageUrl = (filename) => {
  return filename
    ? `${IMAGE_BASE_URL}/${filename}`
    : "/api/placeholder/300/200";
};
