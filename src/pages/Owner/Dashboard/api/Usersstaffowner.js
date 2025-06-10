import axios from "axios";

// Base URL của API
const API_URL = "http://localhost:8082/user";
const SALON_API_URL = "http://localhost:8084/salon";

// Helper function to get token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Không tìm thấy token. Vui lòng đăng nhập.");
  }
  return { Authorization: `Bearer ${token.trim()}` };
};

// Lấy danh sách tất cả người dùng
export const getAllUsers = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("401: Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    }
    throw new Error(
      error.response?.data?.message || "Không thể lấy danh sách người dùng."
    );
  }
};

// Lấy thông tin người dùng theo ID
export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin người dùng với ID ${id}:`, error);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("401: Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    }
    throw new Error(
      error.response?.data?.message ||
        `Không thể lấy thông tin người dùng với ID ${id}.`
    );
  }
};

// Thêm người dùng mới
export const createUser = async (userData) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        fullName: userData.fullName,
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: userData.role, // Use role from userData
        salonId: userData.salonId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("401: Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    }
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
      role: userData.role, // Use role from userData
      salonId: userData.salonId,
    };
    // Only include password if provided and non-empty
    if (userData.password && userData.password.trim() !== "") {
      updatePayload.password = userData.password;
    }
    const response = await axios.put(`${API_URL}/${id}`, updatePayload, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật người dùng với ID ${id}:`, error);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("401: Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    }
    throw new Error(
      error.response?.data?.message ||
        `Không thể cập nhật người dùng với ID ${id}.`
    );
  }
};

// Xoá người dùng theo ID
export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xoá người dùng:", error);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("401: Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    }
    throw new Error(
      error.response?.data?.message || "Không thể xoá người dùng."
    );
  }
};

// Lấy thông tin salon theo ID
export const getSalonById = async (salonId) => {
  try {
    const response = await axios.get(`${SALON_API_URL}/${salonId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin salon:", error);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("401: Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    }
    throw new Error(
      error.response?.data?.message || "Không thể lấy thông tin salon."
    );
  }
};
