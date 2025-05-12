import axios from "axios";

const API_URL = "http://localhost:8084/salon";
const USER_API_URL = "http://localhost:8082/user";

// Lấy tất cả salon
export const getAllSalons = async () => {
  try {
    const response = await axios.get(`${API_URL}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all salons:", error);
    throw error;
  }
};

// Lấy salon theo ID
export const getSalonById = async (salonId) => {
  try {
    const response = await axios.get(`${API_URL}/${salonId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching salon by ID:", error);
    throw error;
  }
};

// Lấy salon theo owner_id
export const getSalonByOwnerId = async (ownerId) => {
  try {
    const response = await axios.get(`${API_URL}/owner/${ownerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching salon by owner ID:", error);
    throw error;
  }
};

// Tìm kiếm salon theo thành phố
export const searchSalonsByCity = async (city) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { city },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching salons by city:", error);
    throw error;
  }
};

// Tạo salon mới
export const createSalon = async (salon) => {
  try {
    const response = await axios.post(`${API_URL}`, salon);
    return response.data;
  } catch (error) {
    console.error("Error creating salon:", error);
    throw error;
  }
};

// Cập nhật salon
export const updateSalon = async (salonId, salon) => {
  try {
    const response = await axios.patch(`${API_URL}/${salonId}`, salon);
    return response.data;
  } catch (error) {
    console.error("Error updating salon:", error);
    throw error;
  }
};

// Xóa salon
export const deleteSalon = async (salonId) => {
  try {
    const response = await axios.delete(`${API_URL}/${salonId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting salon:", error);
    throw error;
  }
};

// Lấy danh sách owner
export const getOwners = async () => {
  try {
    const response = await axios.get(`${USER_API_URL}`);
    return response.data.filter((user) => user.role === "OWNER");
  } catch (error) {
    console.error("Error fetching owners:", error);
    throw error;
  }
};

// Lấy thông tin owner theo ID
export const getOwnerById = async (ownerId) => {
  try {
    const response = await axios.get(`${USER_API_URL}/${ownerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching owner by ID:", error);
    throw error;
  }
};
