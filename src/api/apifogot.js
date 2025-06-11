const BASE_URL = "http://localhost:8082";

// Gửi yêu cầu gửi OTP đến email
export const sendOtp = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      let errorMessage = "Gửi OTP thất bại! Vui lòng kiểm tra email.";
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

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Xác thực mã OTP
export const verifyOtp = async (email, otp) => {
  try {
    const response = await fetch(`${BASE_URL}/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      let errorMessage = "Xác thực OTP thất bại! Vui lòng kiểm tra mã.";
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

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await fetch(`${BASE_URL}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    if (!response.ok) {
      let errorMessage = "Đổi mật khẩu thất bại! Vui lòng thử lại.";
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

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};
