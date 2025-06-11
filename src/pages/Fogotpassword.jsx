import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { sendOtp, verifyOtp, resetPassword } from "../api/apifogot";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State cho modal

  const titleRef = useRef(null);
  const formRef = useRef(null);
  const navigate = useNavigate(); // Hook để chuyển hướng

  // Karaoke text animation
  const animateKaraokeText = (element, text, delay = 0) => {
    if (!element) return;

    element.innerHTML = "";
    const words = text.split(" ");

    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = "word";
      wordSpan.style.opacity = "0.3";
      wordSpan.style.transition = "all 0.3s ease";

      [...word].forEach((char, charIndex) => {
        const charSpan = document.createElement("span");
        charSpan.textContent = char;
        charSpan.style.opacity = "0.3";
        charSpan.style.color = "#64748b";
        charSpan.style.transition = "all 0.3s ease";
        wordSpan.appendChild(charSpan);
      });

      if (wordIndex < words.length - 1) {
        const space = document.createElement("span");
        space.innerHTML = " ";
        space.style.opacity = "0.3";
        wordSpan.appendChild(space);
      }

      element.appendChild(wordSpan);
    });

    setTimeout(() => {
      const chars = element.querySelectorAll("span span");
      chars.forEach((char, index) => {
        setTimeout(() => {
          char.style.opacity = "1";
          char.style.color = "#1e293b";
          char.style.transform = "scale(1.1)";
          setTimeout(() => {
            char.style.transform = "scale(1)";
          }, 150);
        }, index * 50);
      });
    }, delay);
  };

  useEffect(() => {
    if (titleRef.current) {
      const titles = ["Quên mật khẩu?", "Xác thực OTP", "Tạo mật khẩu mới"];
      animateKaraokeText(titleRef.current, titles[step - 1], 300);
    }

    if (formRef.current) {
      formRef.current.style.opacity = "0";
      formRef.current.style.transform = "translateY(30px)";
      setTimeout(() => {
        formRef.current.style.transition =
          "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
        formRef.current.style.opacity = "1";
        formRef.current.style.transform = "translateY(0)";
      }, 500);
    }
  }, [step]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập địa chỉ email!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendOtp(email);
      setStep(2);
      setCountdown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Vui lòng nhập mã OTP 6 chữ số!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyOtp(email, otp);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp hoặc chưa nhập!");
      return;
    }

    if (
      newPassword.length < 6 ||
      !/[A-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      setError("Mật khẩu không đáp ứng yêu cầu!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword(email, otp, newPassword);
      setShowSuccessModal(true); // Hiển thị modal thành công

      // Tự động đóng modal và chuyển hướng sau 3 giây
      setTimeout(() => {
        setShowSuccessModal(false);
        setStep(1);
        setEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        navigate("/login"); // Chuyển hướng đến trang login
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setCountdown(60);
    setLoading(true);
    setError("");

    try {
      await sendOtp(email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      {/* Modal thông báo thành công */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform scale-100 transition-transform duration-300 animate-pulse-once">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                Thành công!
              </h3>
              <p className="text-gray-600 mb-4">
                Mật khẩu của bạn đã được đổi thành công. Bạn sẽ được chuyển đến
                trang đăng nhập...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full animate-progress"
                  style={{ width: "100%", animationDuration: "3s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  stepNum <= step
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {stepNum}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm bg-opacity-95 border border-white/20">
          <div className="p-8">
            {/* Animated Title */}
            <h1
              ref={titleRef}
              className="text-3xl font-bold text-center mb-8 min-h-[2.5rem]"
            ></h1>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <div ref={formRef} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 pl-12"
                      placeholder="Nhập địa chỉ email của bạn"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      📧
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSendOTP}
                  disabled={loading || !email}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang gửi...
                    </div>
                  ) : (
                    "Gửi mã OTP"
                  )}
                </button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div ref={formRef} className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-gray-600">
                    Mã OTP đã được gửi đến email:{" "}
                    <span className="font-semibold text-blue-600">{email}</span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã OTP (6 chữ số)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-center text-2xl font-bold tracking-widest"
                      placeholder="000000"
                      maxLength="6"
                    />
                  </div>
                </div>
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-gray-500">
                      Gửi lại mã sau:{" "}
                      <span className="font-bold text-blue-600">
                        {countdown}s
                      </span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all duration-300"
                    >
                      Gửi lại mã OTP
                    </button>
                  )}
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang xác thực...
                    </div>
                  ) : (
                    "Xác thực OTP"
                  )}
                </button>
              </div>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form
                ref={formRef}
                onSubmit={handleResetPassword}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 pl-12"
                      placeholder="Nhập mật khẩu mới"
                      required
                      minLength="6"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔒
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 pl-12"
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      minLength="6"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔐
                    </div>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-red-500 text-sm mt-2">
                      Mật khẩu không khớp
                    </p>
                  )}
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Yêu cầu mật khẩu:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center">
                      <span
                        className={
                          newPassword.length >= 6
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        {newPassword.length >= 6 ? "✓" : "○"}
                      </span>
                      <span className="ml-2">Ít nhất 6 ký tự</span>
                    </li>
                    <li className="flex items-center">
                      <span
                        className={
                          /[A-Z]/.test(newPassword)
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        {/[A-Z]/.test(newPassword) ? "✓" : "○"}
                      </span>
                      <span className="ml-2">Có chữ hoa</span>
                    </li>
                    <li className="flex items-center">
                      <span
                        className={
                          /[0-9]/.test(newPassword)
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        {/[0-9]/.test(newPassword) ? "✓" : "○"}
                      </span>
                      <span className="ml-2">Có số</span>
                    </li>
                  </ul>
                </div>
                <button
                  type="submit"
                  disabled={
                    loading || !newPassword || newPassword !== confirmPassword
                  }
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang cập nhật...
                    </div>
                  ) : (
                    "Đổi mật khẩu"
                  )}
                </button>
              </form>
            )}

            {/* Back button for steps 2 and 3 */}
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="w-full mt-4 text-gray-600 hover:text-gray-800 py-2 px-4 rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                ← Quay lại
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Bạn đã nhớ mật khẩu?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all duration-300"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
