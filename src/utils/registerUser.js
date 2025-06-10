import { loginUser } from "../utils/loginUser";

const registerUser = async (newUser) => {
  try {
    // Send POST request to register endpoint
    const response = await fetch("http://localhost:8082/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    });

    // Check if response is not successful
    if (!response.ok) {
      let errorMessage = "Đăng ký thất bại! Vui lòng kiểm tra lại thông tin.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Handle non-JSON responses or network errors
        if (response.statusText === "Failed to fetch") {
          errorMessage =
            "Không thể kết nối đến server. Vui lòng kiểm tra backend.";
        }
      }
      throw new Error(errorMessage);
    }

    // Parse the response data
    const createdUser = await response.json();

    // Verify essential user data
    if (!createdUser.email || !createdUser.username) {
      throw new Error("Dữ liệu từ server không hợp lệ!");
    }

    // Remove password from user data for safety
    const { password, ...safeUserData } = createdUser;

    // Auto-login after successful registration
    const loginResponse = await loginUser(newUser.email, newUser.password);

    // Store token and user data in localStorage
    localStorage.setItem("token", loginResponse.token);
    localStorage.setItem("user", JSON.stringify(safeUserData));
    localStorage.setItem("userId", safeUserData.id.toString());

    console.log("Đăng ký thành công:", safeUserData);
    return safeUserData;
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error.message);
    throw error; // Re-throw error for component to handle
  }
};

export default registerUser;
