import React, { useState } from "react";
import "../assets/register.css"; // File CSS riêng cho Register
import { FaGoogle, FaFacebook } from "react-icons/fa"; // Icon cho Google và Facebook
import { motion } from "framer-motion"; // Animation library

const Register = () => {
  // State để quản lý form input
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    // Logic xử lý đăng ký ở đây
    console.log("Đăng ký với:", { name, email, password });
    setError("");
  };

  // Xử lý đăng ký Google
  const handleGoogleRegister = () => {
    // Logic đăng ký Google (có thể dùng Firebase hoặc OAuth)
    console.log("Đăng ký bằng Google");
  };

  // Xử lý đăng ký Facebook
  const handleFacebookRegister = () => {
    // Logic đăng ký Facebook (có thể dùng Firebase hoặc OAuth)
    console.log("Đăng ký bằng Facebook");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="register-container">
      <motion.div
        className="register-box"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="register-title">Đăng Ký Salon </h1>
        <p className="register-subtitle">
          Tham gia ngay để trải nghiệm dịch vụ đỉnh cao!
        </p>

        {/* Form đăng ký */}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Họ và tên"
              className="register-input"
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn"
              className="register-input"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="register-input"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu"
              className="register-input"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="register-button"
          >
            Đăng Ký
          </motion.button>
        </form>

        {/* Đường phân cách */}
        <div className="divider">
          <span>Hoặc đăng ký bằng</span>
        </div>

        {/* Nút đăng ký Google và Facebook */}
        <div className="social-register">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleRegister}
            className="social-button google"
          >
            <FaGoogle className="social-icon" /> Google
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFacebookRegister}
            className="social-button facebook"
          >
            <FaFacebook className="social-icon" /> Facebook
          </motion.button>
        </div>

        {/* Link đăng nhập */}
        <p className="login-link">
          Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
