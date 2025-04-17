import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost";

export const fetchCategoriesBySalon = async (salonId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}:8086/categories/salon/${salonId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    toast.error("Không thể tải danh mục: " + error.message);
    throw error;
  }
};

export const fetchServicesBySalon = async (salonId, categoryId) => {
  try {
    const url = categoryId
      ? `${API_BASE_URL}:8083/service-offering/salon/${salonId}?categoryId=${categoryId}`
      : `${API_BASE_URL}:8083/service-offering/salon/${salonId}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    toast.error("Không thể tải dịch vụ: " + error.message);
    throw error;
  }
};

export const createBooking = async (salonId, bookingRequest) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}:8080/booking/salon/${salonId}`,
      bookingRequest,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    toast.error("Không thể tạo booking: " + error.message);
    throw error;
  }
};

export const fetchSalonById = async (salonId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}:8084/salon/${salonId}`);
    return response.data;
  } catch (error) {
    toast.error("Không thể tải thông tin salon: " + error.message);
    throw error;
  }
};

export const fetchSalons = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}:8084/salon`);
    return response.data;
  } catch (error) {
    toast.error("Không thể tải danh sách salon: " + error.message);
    throw error;
  }
};
