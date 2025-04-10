import axios from "axios";

// Base URL của API
const API_URL = "http://localhost:8082/user";

// Lấy danh sách tất cả người dùng
export const getAllUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    throw error;
  }
};

// Thêm người dùng mới
export const createUser = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    throw error;
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    throw error;
  }
};

// Xoá người dùng theo ID
export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xoá người dùng:", error);
    throw error;
  }
};
