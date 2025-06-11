import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import "../assets/login.css";
import { loginUser } from "../api/login";

const LoginSuccessModal = ({ isOpen, onClose, userName = "Khách" }) => {
  const [showContent, setShowContent] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 3,
      }));
      setParticles(newParticles);

      setTimeout(() => setShowContent(true), 200);

      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowContent(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          showContent ? "bg-opacity-50" : "bg-opacity-0"
        }`}
        onClick={handleClose}
      />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-80"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
      <div
        className={`relative bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm max-w-md w-full mx-4 overflow-hidden transform transition-all duration-500 ${
          showContent
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-75 opacity-0 translate-y-8"
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white/100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200 z-10"
        >
          ✕
        </button>
        <div className="text-center pt-8 pb-4">
          <div
            className={`inline-block transform transition-all duration-700 ${
              showContent ? "scale-100 rotate-0" : "scale-0 rotate-180"
            }`}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-2 bg-green-300 rounded-full animate-pulse opacity-30"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                    className={`transition-all duration-1000 ${
                      showContent
                        ? "stroke-dasharray-none"
                        : "stroke-dasharray-100 stroke-dashoffset-100"
                    }`}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="px-8 pb-8">
          <div
            className={`transform transition-all duration-500 delay-300 ${
              showContent
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              🎉 Đăng nhập thành công!
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Chào mừng{" "}
              <span className="font-semibold text-blue-600">{userName}</span>{" "}
              trở lại!
            </p>
          </div>
          <div
            className={`transform transition-all duration-500 delay-500 ${
              showContent
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <div className="bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-4000 ease-out"
                style={{
                  width: showContent ? "100%" : "0%",
                }}
              />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Đang chuyển hướng...
            </p>
          </div>
          <div
            className={`flex gap-3 mt-6 justify-center transform transition-all duration-500 delay-700 ${
              showContent
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <button
              onClick={handleClose}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Tiếp tục
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              Đóng
            </button>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-300 rounded-full opacity-20 blur-xl"></div>
      </div>
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.5;
          }
        }
        @keyframes ping {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

const Login = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    const splitText = (element) => {
      const text = element.textContent;
      element.innerHTML = "";
      text.split("").forEach((char) => {
        const span = document.createElement("span");
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.display = "inline-block";
        element.appendChild(span);
      });
    };

    if (titleRef.current) {
      splitText(titleRef.current);
      gsap.fromTo(
        titleRef.current.querySelectorAll("span"),
        { opacity: 0, scale: 0.8, color: "#ccc" },
        {
          opacity: 1,
          scale: 1,
          color: "#ff4d4d",
          stagger: 0.05,
          duration: 0.4,
          ease: "power2.out",
        }
      );
    }

    if (subtitleRef.current) {
      splitText(subtitleRef.current);
      gsap.fromTo(
        subtitleRef.current.querySelectorAll("span"),
        { opacity: 0, y: 10, color: "#ccc" },
        {
          opacity: 1,
          y: 0,
          color: "#2196f3",
          stagger: 0.03,
          duration: 0.5,
          ease: "power2.out",
          delay: 0.5,
        }
      );
    }
  }, []);

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

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user.id.toString());

      setShowSuccessModal(true);

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
      }, 4000);
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
        <h1 className="login-title" ref={titleRef}>
          Đăng Nhập Salon
        </h1>
        <p className="login-subtitle" ref={subtitleRef}>
          Trải nghiệm dịch vụ đỉnh cao ngay hôm nay!
        </p>

        <form onSubmit={handleSubmit} className="login-form" data-aos="fade-up">
          <div className="input-group" data-aos="fade-up" data-aos-delay="100">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn"
              className="login-input"
            />
          </div>
          <div className="input-group" data-aos="fade-up" data-aos-delay="200">
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
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Đăng Nhập
          </motion.button>
        </form>
        <div className="links-container">
          <p className="signup-link">
            Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
          </p>
          <p className="forgot-password-link">
            Quên mật khẩu? <a href="/fogotpassword">Lấy lại mật khẩu</a>
          </p>
          <p className="contact-support">
            Cần hỗ trợ? <a href="/contact">Liên hệ với chúng tôi</a>
          </p>
          <p className="privacy-policy">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <a href="/privacy-policy">Chính sách bảo mật</a> và{" "}
            <a href="/terms-of-service">Điều khoản dịch vụ</a>.
          </p>
          <p className="version-info">Phiên bản 1.0.0</p>
        </div>

        <LoginSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          userName={email || "Khách"}
        />
      </motion.div>
    </div>
  );
};

export default Login;
