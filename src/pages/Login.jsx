import React, { useState } from "react";
import { motion } from "framer-motion";
import "../assets/login.css"; // File CSS riêng cho Login
import { loginUser } from "../api/login";

const Login = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const loginResponse = await loginUser(email, password);

      if (!loginResponse || !loginResponse.token || !loginResponse.user) {
        throw new Error("Dữ liệu đăng nhập không hợp lệ!");
      }

      const { token, user } = loginResponse;

      // Store token and user data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user.id.toString()); // Ensure userId is a string

      setShowSuccessModal(true);

      // Redirect based on role after 2 seconds
      setTimeout(() => {
        switch (user.role.toUpperCase()) {
          case "ADMIN":
            window.location.href = "/admin";
            break;
          case "STAFF":
            window.location.href = "/staff";
            break;
          case "OWNER":
            window.location.href = "/owner";
            break;
          case "USER":
          default:
            window.location.href = "/";
            break;
        }
      }, 2000);
    } catch (err) {
      setError(err.message || "Sai email hoặc mật khẩu. Vui lòng thử lại!");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-box"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="login-title">Đăng Nhập Salon</h1>
        <p className="login-subtitle">
          Trải nghiệm dịch vụ đỉnh cao ngay hôm nay!
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn"
              className="login-input"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="login-input"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="login-button"
          >
            Đăng Nhập
          </motion.button>
        </form>

        <p className="signup-link">
          Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
        </p>

        {showSuccessModal && (
          <div className="modal-overlay">
            <motion.div
              className="modal-box"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h2>🎉 Đăng nhập thành công!</h2>
              <p>Chào mừng bạn trở lại, {email || "Khách"}.</p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
