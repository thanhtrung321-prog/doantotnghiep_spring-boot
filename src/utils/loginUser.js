const loginUser = async (email, password) => {
  try {
    const response = await fetch("http://localhost:8082/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorMessage = "Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        if (response.statusText === "Failed to fetch") {
          errorMessage =
            "Không thể kết nối đến server. Vui lòng kiểm tra backend.";
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.token || !data.user) {
      throw new Error("Dữ liệu đăng nhập không hợp lệ!");
    }

    return { token: data.token, user: data.user };
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error.message);
    throw error;
  }
};

export { loginUser };
