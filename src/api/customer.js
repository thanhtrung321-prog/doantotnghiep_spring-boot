const BASE_URL = "http://localhost:8082";

export const fetchUser = async (userId) => {
  if (!userId) {
    throw new Error("User ID là bắt buộc");
  }

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Không tìm thấy token. Vui lòng đăng nhập.");
  }

  try {
    const response = await fetch(`${BASE_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.trim()}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "401: Truy cập không được phép. Vui lòng đăng nhập lại."
        );
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Không tìm thấy thông tin người dùng");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Không thể lấy dữ liệu người dùng");
  }
};

export const updateUser = async (userId, updatedFields) => {
  if (!userId) {
    throw new Error("User ID là bắt buộc");
  }

  if (!updatedFields || Object.keys(updatedFields).length === 0) {
    throw new Error("Không có thay đổi để cập nhật");
  }

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Không tìm thấy token. Vui lòng đăng nhập.");
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

    const response = await fetch(`${BASE_URL}/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.trim()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "401: Truy cập không được phép. Vui lòng đăng nhập lại."
        );
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const updatedUser = await response.json();
    if (!updatedUser || Object.keys(updatedUser).length === 0) {
      throw new Error("Cập nhật không thành công");
    }

    return updatedUser;
  } catch (error) {
    throw new Error(error.message || "Không thể cập nhật dữ liệu người dùng");
  }
};
