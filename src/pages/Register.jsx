import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/register.css"; // File CSS riêng cho Register
import { FaGoogle, FaFacebook } from "react-icons/fa"; // Icon cho Google và Facebook
import { motion } from "framer-motion"; // Animation library
import registerUser from "../utils/registerUser"; // Import registerUser từ utils

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State để hiển thị modal

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const userData = {
        full_name: name,
        email,
        password,
        phone: "",
        username: email.split("@")[0],
        role: "USER",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await registerUser(userData);
      setShowSuccessModal(true); // Hiển thị modal khi đăng ký thành công
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại!");
    }
  };

  // Xử lý đóng modal và chuyển hướng
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  // Xử lý đăng ký Google
  const handleGoogleRegister = () => {
    console.log("Đăng ký bằng Google");
  };

  // Xử lý đăng ký Facebook
  const handleFacebookRegister = () => {
    console.log("Đăng ký bằng Facebook");
  };

  // Animation variants cho form
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // Animation variants cho modal
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
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
        <h1 className="register-title">Đăng Ký Salon</h1>
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
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </p>
      </motion.div>

      {/* Modal thông báo thành công */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <motion.div
            className="modal-content"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="modal-title">Đăng Ký Thành Công!</h2>
            <p className="modal-message">
              Tài khoản của bạn đã được tạo. Hãy đăng nhập để tiếp tục.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCloseModal}
              className="modal-button"
            >
              Đi đến Đăng Nhập
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Register;
