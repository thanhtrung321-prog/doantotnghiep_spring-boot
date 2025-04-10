import axios from "axios";

const API_URL = "http://localhost:8084/salon"; // Thay đổi URL nếu cần

// Lấy tất cả salon
export const getAllSalons = async () => {
  try {
    const response = await axios.get(`${API_URL}`);
    return response.data; // Trả về List<SalonDTO>
  } catch (error) {
    console.error("Error fetching all salons:", error);
    throw error;
  }
};

// Lấy salon theo ID
export const getSalonById = async (salonId) => {
  try {
    const response = await axios.get(`${API_URL}/${salonId}`);
    return response.data; // Trả về SalonDTO
  } catch (error) {
    console.error("Error fetching salon by ID:", error);
    throw error;
  }
};

// Lấy salon theo owner_id
export const getSalonByOwnerId = async (ownerId) => {
  try {
    const response = await axios.get(`${API_URL}/owner/${ownerId}`);
    return response.data; // Trả về SalonDTO
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
    return response.data; // Trả về List<SalonDTO>
  } catch (error) {
    console.error("Error searching salons by city:", error);
    throw error;
  }
};

// Tạo salon mới
export const createSalon = async (salon) => {
  try {
    const response = await axios.post(`${API_URL}`, salon);
    return response.data; // Trả về SalonDTO
  } catch (error) {
    console.error("Error creating salon:", error);
    throw error;
  }
};

// Cập nhật salon
export const updateSalon = async (salonId, salon) => {
  try {
    const response = await axios.patch(`${API_URL}/${salonId}`, salon);
    return response.data; // Trả về SalonDTO
  } catch (error) {
    console.error("Error updating salon:", error);
    throw error;
  }
};
