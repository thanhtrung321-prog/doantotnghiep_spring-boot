import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { submitContactForm } from "../../api/contact";

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitContactForm(formData);
      toast.success("Tin nhắn đã được gửi thành công!");
      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
        message: "",
      });
    } catch (error) {
      toast.error(`Lỗi khi gửi tin nhắn: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
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
        /* Header */
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
                  <p className="text-gray-600">
                    236 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh
                  </p>
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
                  <p className="text-gray-600">0912 345 678</p>
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
                  <p className="text-gray-600">info@maitocdep.vn</p>
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
                  <h4 className="font-semibold text-amber-800">Giờ Mở Cửa</h4>
                  <p className="text-gray-600">Thứ 2 - Thứ 6: 9:00 - 20:00</p>
                  <p className="text-gray-600">
                    Thứ 7 - Chủ Nhật: 9:00 - 21:00
                  </p>
                </div>
              </div>
            </div>

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
                disabled={isSubmitting}
                className={`w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:from-cyan-600 hover:to-pink-600"
                }`}
              >
                {isSubmitting ? "Đang Gửi..." : "Gửi Tin Nhắn"}
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
