import axios from "axios";

// API base URLs
const SALON_API = "http://localhost:8084/salon";
const CATEGORY_API = "http://localhost:8086/categories/salon";
const SERVICE_API = "http://localhost:8083/service-offering";
const BOOKING_API = "http://localhost:8087/booking";
const IMAGE_BASE_URL = "http://localhost:8083/static/image";

// Fetch all salons
export const fetchSalons = async () => {
  try {
    const response = await axios.get(SALON_API, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching salons:", error);
    throw new Error("Không thể tải danh sách salon");
  }
};

// Fetch categories for a specific salon
export const fetchCategoriesBySalon = async (salonId) => {
  try {
    const response = await axios.get(`${CATEGORY_API}/${salonId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching categories for salon ${salonId}:`, error);
    throw new Error("Không thể tải danh sách danh mục");
  }
};

// Fetch services for a specific salon
export const fetchServicesBySalon = async (salonId, categoryId = null) => {
  try {
    const url = categoryId
      ? `${SERVICE_API}/salon/${salonId}?categoryId=${categoryId}`
      : `${SERVICE_API}/salon/${salonId}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching services for salon ${salonId}:`, error);
    throw new Error("Không thể tải danh sách dịch vụ");
  }
};

// Create a new service
export const createService = async (serviceData) => {
  try {
    const response = await axios.post(SERVICE_API, serviceData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating service:", error);
    throw new Error("Không thể tạo dịch vụ");
  }
};

// Update an existing service
export const updateService = async (id, serviceData) => {
  try {
    const response = await axios.put(`${SERVICE_API}/${id}`, serviceData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating service ${id}:`, error);
    throw new Error("Không thể cập nhật dịch vụ");
  }
};

// Delete a service
export const deleteService = async (id) => {
  try {
    await axios.delete(`${SERVICE_API}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
  } catch (error) {
    console.error(`Error deleting service ${id}:`, error);
    throw new Error("Không thể xóa dịch vụ");
  }
};

// Create a booking
export const createBooking = async (salonId, bookingRequest) => {
  try {
    const response = await axios.post(
      `${BOOKING_API}?salonId=${salonId}`,
      bookingRequest,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw new Error("Không thể tạo lịch hẹn");
  }
};

// Get image URL
export const getImageUrl = (filename) => {
  return filename
    ? `${IMAGE_BASE_URL}/${filename}`
    : "/api/placeholder/300/200";
};
