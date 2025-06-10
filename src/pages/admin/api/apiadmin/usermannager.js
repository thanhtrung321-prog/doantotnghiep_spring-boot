import axios from "axios";

// Base URLs của API
const API_URL = "http://localhost:8082/user";
const SALON_API_URL = "http://localhost:8084/salon";

// Helper function to get JWT token
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
    console.error("Lỗi khi lấy danh sách người dùng:", error.message);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("401: Truy cập không được phép. Vui lòng đăng nhập lại.");
    }
    throw new Error(
      error.response?.data?.message || "Không thể lấy danh sách người dùng"
    );
  }
};

// Thêm người dùng mới
export const createUser = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error.message);
    throw new Error(
      error.response?.data?.message || "Không thể tạo người dùng"
    );
  }
};

// Lấy thông tin người dùng theo ID
export const fetchUser = async (userId) => {
  if (!userId) {
    throw new Error("User ID là bắt buộc");
  }

  try {
    const response = await axios.get(`${API_URL}/${userId}`, {
      headers: getAuthHeader(),
    });
    if (!response.data || Object.keys(response.data).length === 0) {
      throw new Error("Không tìm thấy thông tin người dùng");
    }
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error.message);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("401: Truy cập không được phép. Vui lòng đăng nhập lại.");
    }
    throw new Error(
      error.response?.data?.message || "Không thể lấy thông tin người dùng"
    );
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (userId, updatedFields) => {
  if (!userId) {
    throw new Error("User ID là bắt buộc");
  }

  if (!updatedFields || Object.keys(updatedFields).length === 0) {
    throw new Error("Không có thay đổi để cập nhật");
  }

  try {
    // Validate optional fields
    if (
      updatedFields.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedFields.email)
    ) {
      throw new Error("Email không hợp lệ");
    }

    if (updatedFields.phone && !/^[0-9]{9,10}$/.test(updatedFields.phone)) {
      throw new Error("Số điện thoại không hợp lệ");
    }

    if (updatedFields.newPassword && updatedFields.newPassword.length < 6) {
      throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    // Map newPassword to password for backend compatibility
    const payload = {
      ...updatedFields,
      password: updatedFields.newPassword || updatedFields.password,
    };
    delete payload.newPassword;
    delete payload.oldPassword; // Remove oldPassword as backend doesn't use it

    const response = await axios.put(`${API_URL}/${userId}`, payload, {
      headers: getAuthHeader(),
    });

    if (!response.data || Object.keys(response.data).length === 0) {
      throw new Error("Cập nhật không thành công");
    }

    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error.message);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("401: Truy cập không được phép. Vui lòng đăng nhập lại.");
    }
    throw new Error(
      error.response?.data?.message || "Không thể cập nhật người dùng"
    );
  }
};

// Xóa người dùng theo ID
export const deleteUser = async (id) => {
  if (!id) {
    throw new Error("User ID là bắt buộc");
  }

  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error.message);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("401: Truy cập không được phép. Vui lòng đăng nhập lại.");
    }
    throw new Error(
      error.response?.data?.message || "Không thể xóa người dùng"
    );
  }
};

// Lấy danh sách tất cả salon
export const getAllSalons = async () => {
  try {
    const response = await axios.get(SALON_API_URL);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách salon:", error.message);
    throw new Error(
      error.response?.data?.message || "Không thể lấy danh sách salon"
    );
  }
};
