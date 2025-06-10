import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/register.css"; // File CSS riêng cho Register
import { motion } from "framer-motion";
import { loginUser } from "../utils/loginUser";

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !username || !email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const userData = {
        fullName,
        username,
        email,
        password,
        phone: null,
        role: "USER",
        salonId: null,
      };

      const registeredUser = await registerUser(userData);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại!");
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

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

        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Họ và tên"
              className="register-input"
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập"
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

        <p className="login-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </p>
      </motion.div>

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

const registerUser = async (newUser) => {
  try {
    const response = await fetch("http://localhost:8082/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      let errorMessage = "Đăng ký thất bại! Vui lòng kiểm tra lại thông tin.";
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

    const createdUser = await response.json();

    if (!createdUser.email || !createdUser.username) {
      throw new Error("Dữ liệu từ server không hợp lệ!");
    }

    const { password, ...safeUserData } = createdUser;

    const loginResponse = await loginUser(newUser.email, newUser.password);

    localStorage.setItem("token", loginResponse.token);
    localStorage.setItem("user", JSON.stringify(safeUserData));
    localStorage.setItem("userId", safeUserData.id.toString());

    console.log("Đăng ký thành công:", safeUserData);
    return safeUserData;
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error.message);
    throw error;
  }
};

export default Register;
