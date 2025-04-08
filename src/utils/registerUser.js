const registerUser = async (newUser) => {
  try {
    // Gửi yêu cầu POST tới API
    const response = await fetch("http://localhost:8082/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    });

    // Kiểm tra nếu phản hồi không thành công
    if (!response.ok) {
      const errorText = await response.text(); // Lấy thông tin lỗi từ server nếu có
      throw new Error(
        errorText || "Đăng ký thất bại! Vui lòng kiểm tra lại thông tin."
      );
    }

    // Parse dữ liệu trả về từ API
    const createdUser = await response.json();

    // Kiểm tra dữ liệu trả về có hợp lệ không
    if (!createdUser.email || !createdUser.password) {
      throw new Error("Dữ liệu từ server không hợp lệ!");
    }

    // Giả lập token và lưu vào localStorage
    const fakeToken = btoa(`${createdUser.email}:${createdUser.password}`);
    localStorage.setItem("token", fakeToken);
    localStorage.setItem("user", JSON.stringify(createdUser));

    console.log("Đăng ký thành công:", createdUser);
    return createdUser;
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error.message);
    throw error; // Ném lỗi để component gọi hàm này xử lý
  }
};

export default registerUser;
