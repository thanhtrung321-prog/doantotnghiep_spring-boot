import React, { useState, useEffect } from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { motion } from "framer-motion";
import "../assets/login.css";
import { loginUser, loginWithGoogle, loginWithFacebook } from "../api/login.js";

const Login = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  useEffect(() => {
    // Initialize Google Sign-In
    const initGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id:
            "663187924578-rh4nbs6ge3rt61fru6n9sj2v2i72hi64.apps.googleusercontent.com",
          callback: handleGoogleSignIn,
        });
        setGoogleScriptLoaded(true);
        console.log("Google Sign-In initialized successfully");
      } else {
        console.error("Google SDK not loaded");
        setError("Không thể tải Google SDK. Vui lòng kiểm tra kết nối mạng.");
      }
    };

    // Initialize Facebook SDK
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: "YOUR_FACEBOOK_APP_ID",
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });
      console.log("Facebook SDK initialized successfully");
    };

    // Load Google SDK
    const googleScript = document.createElement("script");
    googleScript.src = "https://accounts.google.com/gsi/client";
    googleScript.async = true;
    googleScript.defer = true;
    googleScript.onload = initGoogleSignIn;
    googleScript.onerror = () => {
      console.error("Failed to load Google SDK");
      setError("Không thể tải Google SDK. Vui lòng thử lại sau.");
    };
    document.body.appendChild(googleScript);

    // Load Facebook SDK
    const facebookScript = document.createElement("script");
    facebookScript.src = "https://connect.facebook.net/en_US/sdk.js";
    facebookScript.async = true;
    facebookScript.defer = true;
    facebookScript.onerror = () => {
      console.error("Failed to load Facebook SDK");
      setError("Không thể tải Facebook SDK. Vui lòng thử lại sau.");
    };
    document.body.appendChild(facebookScript);

    return () => {
      if (document.body.contains(googleScript)) {
        document.body.removeChild(googleScript);
      }
      if (document.body.contains(facebookScript)) {
        document.body.removeChild(facebookScript);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const user = await loginUser(email, password);

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", user.token);
      //lưu tokens của staff vào localStorage
      localStorage.setItem("userId", user.id); // Store user ID
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
      }, 2000);
    } else {
      setError("Sai email hoặc mật khẩu.");
    }
  };

  const handleGoogleSignIn = async (response) => {
    if (!response.credential) {
      setError("Không nhận được thông tin đăng nhập Google.");
      return;
    }

    const idToken = response.credential;
    const user = await loginWithGoogle(idToken);

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", user.token);
      setShowSuccessModal(true);

      setTimeout(() => {
        switch (user.role.toUpperCase()) {
          case "ADMIN":
            window.location.href = "/admin";
            break;
          case "STAFF":
            window.location.href = "/staff";
            break;
          case "USER":
          default:
            window.location.href = "/";
            break;
        }
      }, 2000);
    } else {
      setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
    }
  };

  const handleGoogleLogin = () => {
    setError("");
    if (!googleScriptLoaded || !window.google || !window.google.accounts) {
      setError("Google SDK chưa sẵn sàng. Vui lòng thử lại sau.");
      return;
    }
    window.google.accounts.id.prompt();
  };

  const handleFacebookLogin = () => {
    setError("");
    if (!window.FB) {
      setError("Facebook SDK chưa sẵn sàng. Vui lòng thử lại sau.");
      return;
    }
    window.FB.login(
      async (response) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          const user = await loginWithFacebook(accessToken);

          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", user.token);
            setShowSuccessModal(true);

            setTimeout(() => {
              switch (user.role.toUpperCase()) {
                case "ADMIN":
                  window.location.href = "/admin";
                  break;
                case "STAFF":
                  window.location.href = "/staff";
                  break;
                case "USER":
                default:
                  window.location.href = "/";
                  break;
              }
            }, 2000);
          } else {
            setError("Đăng nhập Facebook thất bại. Vui lòng thử lại.");
          }
        } else {
          setError("Đăng nhập Facebook bị hủy.");
        }
      },
      { scope: "public_profile,email" }
    );
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
              <p>Chào mừng bạn trở lại, {email || "Khách"}.</p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
