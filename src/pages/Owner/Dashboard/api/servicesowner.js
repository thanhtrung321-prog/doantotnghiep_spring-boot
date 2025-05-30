import axios from "axios";

const USER_API = "http://localhost:8082/user";
const SALON_API = "http://localhost:8084/salon";
const CATEGORY_API = "http://localhost:8086/categories/salon";
const SERVICE_API = "http://localhost:8083/service-offering";
const SERVICE_OWNER_API = "http://localhost:8083/service-offering/salon-owner";
const IMAGE_BASE_URL = "http://localhost:8083/service-offering-images";

export const fetchUserData = async (userId) => {
  if (!userId || typeof userId !== "string") {
    console.error("Invalid userId provided:", userId);
    throw new Error("ID người dùng không hợp lệ");
  }

  try {
    const response = await axios.get(`${USER_API}/${userId}`);
    const user = response.data;
    if (user.role !== "OWNER" || !user.salonId) {
      throw new Error(
        "Người dùng không phải là chủ salon hoặc không có salonId"
      );
    }
    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tải thông tin người dùng"
    );
  }
};

export const fetchSalonData = async (salonId) => {
  if (!salonId || isNaN(salonId)) {
    console.error("Invalid salonId provided:", salonId);
    throw new Error("ID salon không hợp lệ");
  }

  try {
    const response = await axios.get(`${SALON_API}/${salonId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching salon data for salon ${salonId}:`, error);
    throw new Error(
      error.response?.data?.message || "Không thể tải thông tin salon"
    );
  }
};

export const fetchCategoriesBySalon = async (salonId) => {
  if (!salonId || isNaN(salonId)) {
    console.error("Invalid salonId provided:", salonId);
    throw new Error("ID salon không hợp lệ");
  }

  try {
    const response = await axios.get(`${CATEGORY_API}/${salonId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching categories for salon ${salonId}:`, error);
    throw new Error(
      error.response?.data?.message || "Không thể tải danh sách danh mục"
    );
  }
};

export const fetchServicesBySalon = async (salonId) => {
  if (!salonId || isNaN(salonId)) {
    console.error("Invalid salonId provided:", salonId);
    throw new Error("ID salon không hợp lệ");
  }

  try {
    const response = await axios.get(`${SERVICE_API}/salon/${salonId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching services for salon ${salonId}:`, error);
    throw new Error(
      error.response?.data?.message || "Không thể tải danh sách dịch vụ"
    );
  }
};

export const createService = async (serviceData) => {
  try {
    const response = await axios.post(SERVICE_OWNER_API, serviceData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating service:", error);
    throw new Error(error.response?.data?.message || "Không thể tạo dịch vụ");
  }
};

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
    throw new Error(
      error.response?.data?.message || "Không thể cập nhật dịch vụ"
    );
  }
};

export const deleteService = async (serviceId) => {
  try {
    await axios.delete(`${SERVICE_OWNER_API}/${serviceId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting service ${serviceId}:`, error);
    throw new Error(error.response?.data?.message || "Không thể xóa dịch vụ");
  }
};

export const getImageUrl = (filename) => {
  return filename ? `${IMAGE_BASE_URL}/${filename}` : "/images/placeholder.png";
};
