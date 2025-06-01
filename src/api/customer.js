const BASE_URL = "http://localhost:8082";

export const fetchUser = async (userId) => {
  if (!userId) {
    throw new Error("User ID là bắt buộc");
  }

  const response = await fetch(`${BASE_URL}/user/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể lấy dữ liệu người dùng");
  }

  const data = await response.json();
  if (!data || Object.keys(data).length === 0) {
    throw new Error("Không tìm thấy thông tin người dùng");
  }

  return data;
};

export const updateUser = async (userId, updatedFields) => {
  if (!userId) {
    throw new Error("User ID là bắt buộc");
  }

  if (!updatedFields || Object.keys(updatedFields).length === 0) {
    throw new Error("Không có thay đổi để cập nhật");
  }

  if (
    !updatedFields.username ||
    !updatedFields.email ||
    !updatedFields.role ||
    !updatedFields.password
  ) {
    throw new Error(
      "Thiếu các trường bắt buộc: username, email, role, password"
    );
  }

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

  const response = await fetch(`${BASE_URL}/user/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedFields),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Không thể cập nhật dữ liệu người dùng"
    );
  }

  const updatedUser = await response.json();
  if (!updatedUser || Object.keys(updatedUser).length === 0) {
    throw new Error("Cập nhật không thành công");
  }

  return updatedUser;
};
