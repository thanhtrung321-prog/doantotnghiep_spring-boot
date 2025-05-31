import axios from "axios";

// Base URL của API
const API_URL = "http://localhost:8082/user";
const SALON_API_URL = "http://localhost:8084/salon";

// Lấy danh sách tất cả người dùng
export const getAllUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    throw new Error("Không thể lấy danh sách người dùng.");
  }
};

// Lấy thông tin người dùng theo ID
export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin người dùng với ID ${id}:`, error);
    throw new Error(`Không thể lấy thông tin người dùng với ID ${id}.`);
  }
};

// Thêm người dùng mới
export const createUser = async (userData) => {
  try {
    const response = await axios.post(API_URL, {
      fullName: userData.fullName,
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: "STAFF", // Hardcode role as STAFF
      salonId: userData.salonId,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tạo người dùng."
    );
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (id, userData) => {
  try {
    const updatePayload = {
      fullName: userData.fullName,
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      role: "STAFF", // Hardcode role as STAFF
      salonId: userData.salonId,
    };
    // Only include password if provided and non-empty
    if (userData.password && userData.password.trim() !== "") {
      updatePayload.password = userData.password;
    }
    const response = await axios.put(`${API_URL}/${id}`, updatePayload);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật người dùng với ID ${id}:`, error);
    throw new Error(
      error.response?.data?.message ||
        `Không thể cập nhật người dùng với ID ${id}.`
    );
  }
};

// Xoá người dùng theo ID
export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xoá người dùng:", error);
    throw new Error("Không thể xoá người dùng.");
  }
};

// Lấy thông tin salon theo ID
export const getSalonById = async (salonId) => {
  try {
    const response = await axios.get(`${SALON_API_URL}/${salonId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin salon:", error);
    throw new Error("Không thể lấy thông tin salon.");
  }
};
