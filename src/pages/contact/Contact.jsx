import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { submitContactForm } from "../../api/contact";

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    message: "",
    salonId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [submissionCount, setSubmissionCount] = useState({});
  const [lockoutTime, setLockoutTime] = useState(0);
  const lockoutTimerRef = useRef(null);

  // Fetch salons
  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const response = await fetch("http://localhost:8084/salon");
        if (!response.ok) throw new Error("Không thể tải danh sách salon");
        const data = await response.json();
        setSalons(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, salonId: data[0].id }));
          setSelectedSalon(data[0]);
        }
      } catch (error) {
        toast.error("Lỗi khi tải danh sách salon: " + error.message);
      }
    };
    fetchSalons();
  }, []);

  // Handle lockout countdown
  useEffect(() => {
    if (lockoutTime > 0) {
      lockoutTimerRef.current = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            clearInterval(lockoutTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(lockoutTimerRef.current);
  }, [lockoutTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "salonId") {
      const salon = salons.find((s) => s.id === parseInt(value));
      setSelectedSalon(salon);
    }
  };

  // Input validation
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,11}$/;
    const profanityList = ["fuck", "shit", "damn", "asshole", "bitch"];

    if (!emailRegex.test(formData.email)) {
      toast.error("Vui lòng nhập email hợp lệ");
      return false;
    }

    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error("Số điện thoại phải có 10-11 chữ số");
      return false;
    }

    const messageLower = formData.message.toLowerCase();
    if (profanityList.some((word) => messageLower.includes(word))) {
      toast.error("Tin nhắn chứa từ ngữ không phù hợp");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check submission limit
    const email = formData.email;
    const currentCount = submissionCount[email] || 0;
    if (currentCount >= 3 && lockoutTime === 0) {
      setLockoutTime(30);
      setSubmissionCount((prev) => ({ ...prev, [email]: 0 }));
      toast.warn("Bạn đã gửi quá 3 tin nhắn. Vui lòng đợi 30 giây.");
      return;
    }

    if (lockoutTime > 0) {
      toast.warn(`Vui lòng đợi ${lockoutTime} giây trước khi gửi lại`);
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContactForm(formData);
      toast.success("Tin nhắn đã được gửi thành công!");
      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
        message: "",
        salonId: salons[0]?.id || "",
      });
      setSelectedSalon(salons[0]);
      setSubmissionCount((prev) => ({
        ...prev,
        [email]: (prev[email] || 0) + 1,
      }));
    } catch (error) {
      toast.error(`Lỗi khi gửi tin nhắn: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const RGBGradientText = ({ text, className = "", direction = "right" }) => {
    const gradientDirection =
      direction === "left"
        ? "bg-gradient-to-l"
        : direction === "right"
        ? "bg-gradient-to-r"
        : direction === "top"
        ? "bg-gradient-to-t"
        : direction === "bottom"
        ? "bg-gradient-to-b"
        : "bg-gradient-to-r";
    return (
      <span
        className={`${gradientDirection} from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent ${className}`}
      >
        {text}
      </span>
    );
  };

  // Parse address
  const parseAddress = (address) => {
    if (!address) return { province: "", district: "", town: "", specific: "" };
    const parts = address.split("|");
    return {
      province: parts[0]?.trim() || "",
      district: parts[1]?.trim() || "",
      town: parts[2]?.trim() || "",
      specific: parts[3]?.trim() || "",
    };
  };

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    adaptiveHeight: true,
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-200 min-h-screen py-36">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <RGBGradientText
            text="Beauty Salon"
            className="text-5xl font-extrabold mb-2 block"
            direction="right"
          />
          <RGBGradientText
            text="Kết nối để nhận tư vấn tốt nhất"
            className="text-cyan-200 text-lg font-semibold block"
            direction="left"
          />
          <div className="w-32 h-1 bg-gradient-to-r from-cyan-500 to-pink-500 mx-auto mt-4"></div>
        </div>
        {/* Contact Info & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Information */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
            <RGBGradientText
              text="Thông Tin Liên Hệ"
              className="text-3xl font-bold mb-6"
              direction="left"
            />
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Chọn Salon
              </label>
              <select
                name="salonId"
                value={formData.salonId}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300"
              >
                {salons.map((salon) => (
                  <option key={salon.id} value={salon.id}>
                    {salon.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedSalon && (
              <>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-cyan-500 mr-4 mt-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-amber-800">Địa Chỉ</h4>
                      {(() => {
                        const { province, district, town, specific } =
                          parseAddress(selectedSalon.address);
                        return (
                          <>
                            {province && (
                              <p className="text-gray-600">Tỉnh: {province}</p>
                            )}
                            {district && (
                              <p className="text-gray-600">Huyện: {district}</p>
                            )}
                            {town && (
                              <p className="text-gray-600">
                                Thị trấn/Phường: {town}
                              </p>
                            )}
                            {specific && (
                              <p className="text-gray-600">
                                Địa chỉ cụ thể: {specific}
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-cyan-500 mr-4 mt-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-amber-800">
                        Số Điện Thoại
                      </h4>
                      <p className="text-gray-600">{selectedSalon.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-cyan-500 mr-4 mt-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-amber-800">Email</h4>
                      <p className="text-gray-600">{selectedSalon.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-cyan-500 mr-4 mt-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-amber-800">
                        Giờ Mở Cửa
                      </h4>
                      <p className="text-gray-600">
                        {selectedSalon.openingTime} -{" "}
                        {selectedSalon.closingTime}
                      </p>
                    </div>
                  </div>
                </div>
                {selectedSalon.images && selectedSalon.images.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-amber-800 mb-4">
                      Hình Ảnh Salon
                    </h4>
                    <Slider {...sliderSettings}>
                      {selectedSalon.images.map((image, index) => (
                        <div key={index}>
                          <img
                            src={`http://localhost:8084/salon-images/${image}`}
                            alt={`Salon ${selectedSalon.name} image ${
                              index + 1
                            }`}
                            className="w-full h-64 object-cover rounded-lg shadow-md"
                          />
                        </div>
                      ))}
                    </Slider>
                  </div>
                )}
              </>
            )}
            {/* Social Media */}
            <h4 className="text-lg font-semibold text-amber-800 mt-8 mb-4">
              Kết Nối Với Chúng Tôi
            </h4>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center text-white hover:from-cyan-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110 shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center text-white hover:from-cyan-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110 shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center text-white hover:from-cyan-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110 shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
            <RGBGradientText
              text="Gửi Tin Nhắn Cho Chúng Tôi"
              className="text-3xl font-bold mb-6"
              direction="right"
            />
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Họ Tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300"
                  placeholder="Nhập họ tên của bạn"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Số Điện Thoại
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300"
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Tin Nhắn
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300"
                  rows="5"
                  placeholder="Nhập tin nhắn hoặc yêu cầu của bạn"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || lockoutTime > 0}
                className={`w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md ${
                  isSubmitting || lockoutTime > 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:from-cyan-600 hover:to-pink-600"
                }`}
              >
                {isSubmitting
                  ? "Đang Gửi..."
                  : lockoutTime > 0
                  ? `Đợi ${lockoutTime}s`
                  : "Gửi Tin Nhắn"}
              </button>
            </form>
          </div>
        </div>
        {/* Map Section */}
        <div className="bg-gradient-to-r from-cyan-900 to-gray-900 py-16 rounded-2xl shadow-xl">
          <RGBGradientText
            text="Tìm Đến Chúng Tôi"
            className="text-3xl font-bold text-center text-white mb-8"
            direction="left"
          />
          <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg border-2 border-cyan-300">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.6696841868067!2d106.69058931474887!3d10.759917192321414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1c06f4e1dd%3A0x43900e8a06a977dc!2s236%20Nguy%E1%BB%85n%20Tr%C3%A3i%2C%20Ph%C6%B0%E1%BB%9Dng%20Nguy%E1%BB%85n%20C%C6%B0%20Trinh%2C%20Qu%E1%BA%ADn%201%2C%20Th%C3%A0nh%20ph%E1%BB%91%20H%E1%BB%93%20Ch%C3%AD%20Minh%2C%20Vietnam!5e0!3m2!1sen!2s!4v1698765432100!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
