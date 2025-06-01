import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Scissors,
  Facebook,
  Instagram,
  Youtube,
  Clock,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [admins, setAdmins] = useState([]);
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSalon, setSelectedSalon] = useState(null);
  const footerRef = useRef(null);
  const clockRef = useRef(null);
  const modalRef = useRef(null);
  const titleRefs = useRef([]);

  // API Functions
  const fetchUsers = async () => {
    const response = await fetch("http://localhost:8082/user", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể lấy dữ liệu người dùng");
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      throw new Error("Không tìm thấy người dùng");
    }

    return data;
  };

  const fetchSalons = async () => {
    const response = await fetch("http://localhost:8084/salon", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể lấy dữ liệu salon");
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      throw new Error("Không tìm thấy salon");
    }

    return data;
  };

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch admin users and salons
  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await fetchUsers();
        const adminUsers = users.filter((user) =>
          ["ADMIN", "OWNER"].includes(user.role)
        );
        setAdmins(adminUsers);

        const salonData = await fetchSalons();
        setSalons(salonData);
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // Animations for clock and titles
  useEffect(() => {
    // Clock animation
    const animateClock = () => {
      if (clockRef.current) {
        gsap.fromTo(
          clockRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateClock();
        }
      });
    });

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    // Title animations
    titleRefs.current.forEach((el) => {
      if (el) {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.2 }
        );
      }
    });

    return () => observer.disconnect();
  }, []);

  // Modal animation
  useEffect(() => {
    if (selectedSalon && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, [selectedSalon]);

  const formatTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatSchedule = (opening, closing) => {
    return `${opening.slice(0, 5)} - ${closing.slice(0, 5)}`;
  };

  const openModal = (salon) => {
    setSelectedSalon(salon);
  };

  const closeModal = () => {
    setSelectedSalon(null);
  };

  const getSalonNameBySalonId = (salonId) => {
    const salon = salons.find((s) => s.id === salonId);
    return salon ? salon.name : "Không có salon";
  };

  return (
    <footer
      ref={footerRef}
      className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #7209b7 100%)",
      }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-pink-400 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-32 right-16 w-80 h-80 bg-blue-400 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-400 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* RGB Digital Clock */}
      <div
        ref={clockRef}
        className="absolute top-8 left-8 z-20"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,0,150,0.2) 0%, rgba(0,204,255,0.2) 50%, rgba(150,255,0,0.2) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <div className="text-center">
          <div
            className="text-4xl font-bold mb-2 tracking-wider"
            style={{
              background:
                "linear-gradient(45deg, #ff0096, #00ccff, #96ff00, #ff0096)",
              backgroundSize: "300% 300%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "rainbow 3s ease-in-out infinite",
            }}
          >
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-gray-300 font-medium">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-8 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-12 mt-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <div
              className="flex items-center justify-center gap-3"
              data-aos="fade-up"
            >
              <div
                className="p-3 rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)",
                }}
              >
                <Scissors className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2
                  ref={(el) => (titleRefs.current[0] = el)}
                  className="text-4xl font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Beauty Salon
                </h2>
                <p className="text-gray-300 text-lg">
                  Professional Hair Studio
                </p>
              </div>
            </div>
            <p
              className="text-gray-300 leading-relaxed text-xl max-w-2xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Salon tóc chuyên nghiệp hàng đầu với đội ngũ stylist giàu kinh
              nghiệm, mang đến những xu hướng làm đẹp hiện đại nhất.
            </p>
          </div>

          {/* Admin Section */}
          <div className="space-y-8">
            <h3
              ref={(el) => (titleRefs.current[1] = el)}
              className="text-3xl font-bold"
              style={{
                background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Đội Ngũ Quản Trị
            </h3>
            {loading ? (
              <p className="text-gray-300">Đang tải...</p>
            ) : error ? (
              <p className="text-red-400">{error}</p>
            ) : admins.length === 0 ? (
              <p className="text-gray-300">Không tìm thấy quản trị viên</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {admins.map((admin, index) => (
                  <div
                    key={admin.id}
                    className="p-6 rounded-2xl hover:shadow-xl transition-shadow"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      backdropFilter: "blur(20px)",
                    }}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xl font-semibold text-gray-100">
                        {admin.fullName || "N/A"}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${
                          admin.role === "ADMIN"
                            ? "bg-gradient-to-r from-purple-500 to-blue-500"
                            : "bg-gradient-to-r from-pink-500 to-red-500"
                        } text-white`}
                      >
                        {admin.role === "ADMIN" ? "Quản trị viên" : "Chủ salon"}
                      </span>
                    </div>
                    <p className="text-gray-300">{admin.email}</p>
                    {admin.role === "OWNER" && (
                      <p className="text-gray-400 text-sm mt-1">
                        Salon: {getSalonNameBySalonId(admin.salonId)}
                      </p>
                    )}
                    {admin.role === "ADMIN" && (
                      <p className="text-gray-400 text-sm mt-1">
                        Quản lý tất cả salon
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Salon Section */}
          <div className="space-y-8">
            <h3
              ref={(el) => (titleRefs.current[2] = el)}
              className="text-3xl font-bold"
              style={{
                background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Các Salon Của Chúng Tôi
            </h3>
            {loading ? (
              <p className="text-gray-300">Đang tải...</p>
            ) : error ? (
              <p className="text-red-400">{error}</p>
            ) : salons.length === 0 ? (
              <p className="text-gray-300">Không tìm thấy salon</p>
            ) : (
              <div className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory">
                {salons.map((salon, index) => (
                  <div
                    key={salon.id}
                    className="p-6 rounded-2xl relative overflow-hidden flex-shrink-0 w-80 snap-center hover:shadow-xl transition-shadow"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      backdropFilter: "blur(20px)",
                    }}
                    data-aos="fade-right"
                    data-aos-delay={index * 100}
                  >
                    {/* Salon Image */}
                    <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                      {salon.images && salon.images.length > 0 ? (
                        <img
                          src={`http://localhost:8084/salon-images/${salon.images[0]}`}
                          alt={salon.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/300x200?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <p className="text-gray-400">No Image</p>
                        </div>
                      )}
                    </div>
                    <h4 className="text-xl font-semibold text-gray-100 mb-2">
                      {salon.name}
                    </h4>
                    <div className="space-y-2 text-gray-300">
                      <p className="flex items-center gap-2">
                        <MapPin size={16} /> {salon.address}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock size={16} />{" "}
                        {formatSchedule(salon.openingTime, salon.closingTime)}
                      </p>
                    </div>
                    <button
                      onClick={() => openModal(salon)}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      Chi tiết
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Social Media Section */}
          <div className="space-y-8">
            <h3
              ref={(el) => (titleRefs.current[3] = el)}
              className="text-3xl font-bold"
              style={{
                background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Kết Nối Với Chúng Tôi
            </h3>
            <p
              className="text-gray-300 text-xl leading-relaxed max-w-xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Theo dõi chúng tôi trên các mạng xã hội để cập nhật những xu hướng
              làm đẹp mới nhất!
            </p>
            <div className="flex justify-center gap-8">
              {[
                { icon: Facebook, color: "#1877f2", name: "Facebook" },
                { icon: Instagram, color: "#e4405f", name: "Instagram" },
                { icon: Youtube, color: "#ff0000", name: "YouTube" },
              ].map((social, index) => (
                <div
                  key={social.name}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-12"
                  style={{
                    background: `linear-gradient(135deg, ${social.color}40, ${social.color}20)`,
                    border: `2px solid ${social.color}60`,
                    boxShadow: `0 8px 16px ${social.color}30`,
                  }}
                  data-aos="zoom-in"
                  data-aos-delay={index * 100}
                >
                  <social.icon
                    className="w-10 h-10"
                    style={{ color: social.color }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Salon Details Modal */}
      {selectedSalon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 max-w-3xl w-full mx-4 shadow-2xl border border-white/20 relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 px-4 py-2 text-lg font-bold rounded-xl"
              style={{
                background:
                  "linear-gradient(45deg, #ff0096, #00ccff, #96ff00, #ff0096)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "rainbow 3s ease-in-out infinite",
                border: "2px solid transparent",
                borderImage:
                  "linear-gradient(45deg, #ff0096, #00ccff, #96ff00, #ff0096) 1",
              }}
            >
              Đóng
            </button>
            <div className="space-y-6">
              <h2
                className="text-2xl font-bold text-center"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {selectedSalon.name}
              </h2>
              {/* Images Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 max-h-96 overflow-y-auto">
                {selectedSalon.images && selectedSalon.images.length > 0 ? (
                  selectedSalon.images.map((image, index) => (
                    <img
                      key={index}
                      src={`http://localhost:8084/salon-images/${image}`}
                      alt={`${selectedSalon.name} ${index + 1}`}
                      className="w-full h-40 object-cover rounded-xl"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />
                  ))
                ) : (
                  <div className="w-full h-40 bg-gray-700 flex items-center justify-center rounded-xl">
                    <p className="text-gray-400">No Image</p>
                  </div>
                )}
              </div>
              {/* Details */}
              <div className="space-y-2 text-gray-800">
                <p className="flex items-center gap-2">
                  <MapPin size={16} /> <strong>Địa chỉ:</strong>{" "}
                  {selectedSalon.address}
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={16} /> <strong>Liên hệ:</strong>{" "}
                  {selectedSalon.contact}
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={16} /> <strong>Email:</strong>{" "}
                  {selectedSalon.email}
                </p>
                <p className="flex items-center gap-2">
                  <strong>Thành phố:</strong> {selectedSalon.city}
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={16} /> <strong>Lịch hoạt động:</strong>{" "}
                  {formatSchedule(
                    selectedSalon.openingTime,
                    selectedSalon.closingTime
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes rainbow {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
