import React, { useState } from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { motion } from "framer-motion";
import "../assets/login.css";
import loginUser from "../api/login.js";

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

    const user = await loginUser(email, password);

    if (user) {
      setShowSuccessModal(true); // Hiện modal khi đăng nhập thành công
    } else {
      setError("Sai email hoặc mật khẩu.");
    }
  };

  const handleGoogleLogin = () => {
    console.log("Đăng nhập bằng Google");
    // TODO: Tích hợp OAuth nếu cần
  };

  const handleFacebookLogin = () => {
    console.log("Đăng nhập bằng Facebook");
    // TODO: Tích hợp OAuth nếu cần
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

        <div className="divider">
          <span>Hoặc đăng nhập bằng</span>
        </div>

        <div className="social-login">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleLogin}
            className="social-button google"
          >
            <FaGoogle className="social-icon" /> Google
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFacebookLogin}
            className="social-button facebook"
          >
            <FaFacebook className="social-icon" /> Facebook
          </motion.button>
        </div>

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
              <p>Chào mừng bạn trở lại, {email}.</p>
              <button
                onClick={() => (window.location.href = "/")}
                className="modal-button"
              >
                Tiếp tục
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
