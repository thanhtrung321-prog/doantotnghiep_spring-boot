import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AOS from "aos";
import "aos/dist/aos.css";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import "react-horizontal-scrolling-menu/dist/styles.css";
import {
  Scissors,
  Facebook,
  Instagram,
  Youtube,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Star,
} from "lucide-react";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [admins, setAdmins] = useState([]);
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const footerRef = useRef(null);
  const clockRef = useRef(null);
  const modalRef = useRef(null);
  const titleRefs = useRef([]);
  const salonCardsRef = useRef([]);

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

  // Initialize AOS with optimized settings
  useEffect(() => {
    AOS.init({ 
      duration: 800, 
      once: true,
      easing: 'ease-out-cubic',
      offset: 100,
      delay: 0,
      disable: window.innerWidth < 768 ? true : false // Disable on mobile for better performance
    });
    
    // Refresh AOS when data loads
    if (!loading) {
      setTimeout(() => AOS.refresh(), 100);
    }
  }, [loading]);

  // Optimized GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Clock animation with ScrollTrigger
      if (clockRef.current) {
        gsap.set(clockRef.current, { opacity: 0, y: -30, scale: 0.9 });
        
        ScrollTrigger.create({
          trigger: footerRef.current,
          start: "top 80%",
          onEnter: () => {
            gsap.to(clockRef.current, { 
              opacity: 1, 
              y: 0, 
              scale: 1,
              duration: 1,
              ease: "back.out(1.7)"
            });
          }
        });
      }

      // Title animations with stagger
      titleRefs.current.forEach((el, index) => {
        if (el) {
          gsap.set(el, { opacity: 0, y: 30 });
          
          ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            onEnter: () => {
              gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                delay: index * 0.1
              });
            }
          });
        }
      });

      // Salon cards animation
      salonCardsRef.current.forEach((el, index) => {
        if (el) {
          gsap.set(el, { opacity: 0, x: 50, scale: 0.95 });
          
          ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            onEnter: () => {
              gsap.to(el, {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.6,
                ease: "power2.out",
                delay: index * 0.1
              });
            }
          });
        }
      });
    });

    return () => ctx.revert();
  }, [salons, admins]);

  // Modal animations
  useEffect(() => {
    if (selectedSalon && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { 
          opacity: 0, 
          scale: 0.8, 
          y: 50,
          filter: "blur(10px)"
        },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          filter: "blur(0px)",
          duration: 0.5, 
          ease: "back.out(1.4)" 
        }
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

  const openModal = (salon, imageIndex = 0) => {
    setSelectedSalon(salon);
    setSelectedImageIndex(imageIndex);
  };

  const closeModal = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.8,
        y: 50,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setSelectedSalon(null);
          setSelectedImageIndex(0);
        }
      });
    }
  };

  const getSalonNameBySalonId = (salonId) => {
    const salon = salons.find((s) => s.id === salonId);
    return salon ? salon.name : "Không có salon";
  };

  // Arrow components for horizontal scroll
  const LeftArrow = () => {
    const { scrollPrev, isFirstItemVisible } = React.useContext(VisibilityContext);
    
    return (
      <button
        onClick={scrollPrev}
        disabled={isFirstItemVisible}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
    );
  };

  const RightArrow = () => {
    const { scrollNext, isLastItemVisible } = React.useContext(VisibilityContext);
    
    return (
      <button
        onClick={scrollNext}
        disabled={isLastItemVisible}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
    );
  };

  // Salon Card Component
  const SalonCard = ({ salon, index }) => (
    <div
      key={salon.id}
      ref={(el) => (salonCardsRef.current[index] = el)}
      className="group p-6 rounded-3xl relative overflow-hidden flex-shrink-0 w-80 snap-center transition-all duration-500 hover:scale-105 cursor-pointer"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
        border: "1px solid rgba(255,255,255,0.3)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      }}
      onClick={() => openModal(salon)}
    >
      {/* Salon Image */}
      <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
        {salon.images && salon.images.length > 0 ? (
          <img
            src={`http://localhost:8084/salon-images/${salon.images[0]}`}
            alt={salon.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/300x200?text=No+Image&bg=667eea&color=white";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Scissors className="w-12 h-12 text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <div className="flex items-center gap-2 text-white">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Xem chi tiết</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
          {salon.name}
        </h4>
        
        <div className="space-y-2 text-gray-300">
          <p className="flex items-center gap-2 text-sm">
            <MapPin size={14} className="text-purple-400" /> 
            <span className="truncate">{salon.address}</span>
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-green-400" /> 
            {formatSchedule(salon.openingTime, salon.closingTime)}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-0.5">
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <footer
      ref={footerRef}
      className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #7209b7 100%)",
      }}
    >
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-32 right-16 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-10 right-1/4 w-32 h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      {/* Enhanced RGB Digital Clock */}
      <div
        ref={clockRef}
        className="absolute top-8 left-8 z-20"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,0,150,0.2) 0%, rgba(0,204,255,0.2) 50%, rgba(150,255,0,0.2) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)",
        }}
      >
        <div className="text-center">
          <div
            className="text-4xl font-black mb-2 tracking-wider"
            style={{
              background:
                "linear-gradient(45deg, #ff0096, #00ccff, #96ff00, #ff0096)",
              backgroundSize: "300% 300%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "rainbow 3s ease-in-out infinite",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
          >
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-gray-300 font-semibold tracking-wide">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-8 py-16">
        <div className="max-w-6xl mx-auto text-center space-y-16 mt-16">
          {/* Enhanced Brand Section */}
          <div className="space-y-8">
            <div
              className="flex items-center justify-center gap-4"
              data-aos="fade-up"
            >
              <div
                className="p-4 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 12px 24px rgba(102, 126, 234, 0.4)",
                }}
              >
                <Scissors className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2
                  ref={(el) => (titleRefs.current[0] = el)}
                  className="text-5xl font-black tracking-tight"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Beauty Salon
                </h2>
                <p className="text-gray-300 text-xl font-medium tracking-wide">
                  Professional Hair Studio
                </p>
              </div>
            </div>
            <p
              className="text-gray-300 leading-relaxed text-xl max-w-3xl mx-auto font-light"
              data-aos="fade-up"
              data-aos-delay="200"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Salon tóc chuyên nghiệp hàng đầu với đội ngũ stylist giàu kinh
              nghiệm, mang đến những xu hướng làm đẹp hiện đại nhất.
            </p>
          </div>

          {/* Enhanced Admin Section */}
          <div className="space-y-10">
            <h3
              ref={(el) => (titleRefs.current[1] = el)}
              className="text-4xl font-black tracking-tight"
              style={{
                background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Đội Ngũ Quản Trị
            </h3>
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <p className="text-red-400 text-lg">{error}</p>
            ) : admins.length === 0 ? (
              <p className="text-gray-300 text-lg">Không tìm thấy quản trị viên</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {admins.map((admin, index) => (
                  <div
                    key={admin.id}
                    className="group p-8 rounded-3xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      backdropFilter: "blur(20px)",
                    }}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <p className="text-2xl font-bold text-gray-100" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {admin.fullName || "N/A"}
                      </p>
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          admin.role === "ADMIN"
                            ? "bg-gradient-to-r from-purple-500 to-blue-500"
                            : "bg-gradient-to-r from-pink-500 to-red-500"
                        } text-white shadow-lg`}
                      >
                        {admin.role === "ADMIN" ? "Quản trị viên" : "Chủ salon"}
                      </span>
                    </div>
                    <p className="text-gray-300 text-lg mb-2">{admin.email}</p>
                    {admin.role === "OWNER" && (
                      <p className="text-gray-400 text-sm">
                        Salon: {getSalonNameBySalonId(admin.salonId)}
                      </p>
                    )}
                    {admin.role === "ADMIN" && (
                      <p className="text-gray-400 text-sm">
                        Quản lý tất cả salon
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Salon Section with Horizontal Scrolling */}
          <div className="space-y-10">
            <h3
              ref={(el) => (titleRefs.current[2] = el)}
              className="text-4xl font-black tracking-tight"
              style={{
                background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Các Salon Của Chúng Tôi
            </h3>
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <p className="text-red-400 text-lg">{error}</p>
            ) : salons.length === 0 ? (
              <p className="text-gray-300 text-lg">Không tìm thấy salon</p>
            ) : (
              <div className="relative">
                <ScrollMenu
                  LeftArrow={LeftArrow}
                  RightArrow={RightArrow}
                  wrapperClassName="scroll-wrapper"
                  scrollContainerClassName="scroll-container"
                >
                  {salons.map((salon, index) => (
                    <SalonCard
                      key={salon.id}
                      salon={salon}
                      index={index}
                      itemId={salon.id.toString()}
                    />
                  ))}
                </ScrollMenu>
              </div>
            )}
          </div>

          {/* Enhanced Social Media Section */}
          <div className="space-y-10">
            <h3
              ref={(el) => (titleRefs.current[3] = el)}
              className="text-4xl font-black tracking-tight"
              style={{
                background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Kết Nối Với Chúng Tôi
            </h3>
            <p
              className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto font-light"
              data-aos="fade-up"
              data-aos-delay="200"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Theo dõi chúng tôi trên các mạng xã hội để cập nhật những xu hướng
              làm đẹp mới nhất!
            </p>
            <div className="flex justify-center gap-10">
              {[
                { icon: Facebook, color: "#1877f2", name: "Facebook" },
                { icon: Instagram, color: "#e4405f", name: "Instagram" },
                { icon: Youtube, color: "#ff0000", name: "YouTube" },
              ].map((social, index) => (
                <div
                  key={social.name}
                  className="w-24 h-24 rounded-3xl flex items-center justify-center cursor-pointer transition-all duration-500 hover:scale-125 hover:rotate-12 group"
                  style={{
                    background: `linear-gradient(135deg, ${social.color}40, ${social.color}20)`,
                    border: `2px solid ${social.color}60`,
                    boxShadow: `0 12px 24px ${social.color}30`,
                  }}
                  data-aos="zoom-in"
                  data-aos-delay={index * 150}
                >
                  <social.icon
                    className="w-12 h-12 transition-all duration-300 group-hover:scale-110"
                    style={{ color: social.color }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Salon Details Modal */}
      {selectedSalon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-5xl w-full mx-4 shadow-2xl border border-white/30 relative max-h-[90vh] overflow-y-auto"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)",
            }}
          >
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90"
              style={{
                background: "linear-gradient(135deg, #ff4757, #ff3742)",
                boxShadow: "0 4px 15px rgba(255, 71, 87, 0.4)",
              }}
            >
              <X className="w-6 h-6 text-white font-bold" />
            </button>
            
            <div className="space-y-8">
              <div className="text-center">
                <h2
                  className="text-4xl font-black mb-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {selectedSalon.name}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-gray-600 ml-2 font-medium">5.0 (100+ reviews)</span>
                </div>
              </div>

              {/* Enhanced Images with Horizontal Scrolling */}
              {selectedSalon.images && selectedSalon.images.length > 0 && (
                <div className="relative">
                  <ScrollMenu
                    LeftArrow={() => (
                      <button className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}
                    RightArrow={() => (
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  >
                    {selectedSalon.images.map((image, index) => (
                      <div
                        key={index}
                        className="w-80 h-48 flex-shrink-0 mx-2"
                        itemId={index.toString()}
                      >
                        <img
                          src={`http://localhost:8084/salon-images/${image}`}
                          alt={`${selectedSalon.name} ${index + 1}`}
                          className="w-full h-full object-cover rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={() => setSelectedImageIndex(index)}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/320x192?text=No+Image&bg=667eea&color=white";
                          }}
                        />
                      </div>
                    ))}
                  </ScrollMenu>
                </div>
              )}

              {/* Enhanced Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Thông Tin Liên Hệ
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50">
                      <MapPin className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800">Địa chỉ</p>
                        <p className="text-gray-600">{selectedSalon.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50">
                      <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800">Liên hệ</p>
                        <p className="text-gray-600">{selectedSalon.contact}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50">
                      <Mail className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800">Email</p>
                        <p className="text-gray-600">{selectedSalon.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Thông Tin Khác
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-yellow-50">
                      <MapPin className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800">Thành phố</p>
                        <p className="text-gray-600">{selectedSalon.city}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50">
                      <Clock className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800">Giờ hoạt động</p>
                        <p className="text-gray-600">
                          {formatSchedule(selectedSalon.openingTime, selectedSalon.closingTime)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Thứ 2 - Chủ nhật</p>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-pink-600" />
                        <p className="font-semibold text-gray-800">Đánh giá</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="text-gray-600 text-sm">5.0 (100+ đánh giá)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center pt-6">
                <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-1">
                  Đặt lịch ngay
                </button>
                <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1">
                  Xem dịch vụ
                </button>
                <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:-translate-y-1">
                  Liên hệ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
        
        @keyframes rainbow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-pulse {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.05);
          }
        }

        /* Custom scrollbar for modal */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #764ba2, #667eea);
        }

        /* Horizontal scroll menu styles */
        .scroll-wrapper {
          display: flex;
          align-items: center;
          position: relative;
        }

        .scroll-container {
          display: flex;
          gap: 1.5rem;
          overflow-x: auto;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 1rem 0;
        }

        .scroll-container::-webkit-scrollbar {
          display: none;
        }

        /* Smooth transitions for all interactive elements */
        * {
          transition-property: transform, opacity, box-shadow, background, color, border;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Performance optimizations */
        .group {
          contain: layout style paint;
        }

        /* Better focus styles for accessibility */
        button:focus-visible {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }

        /* Smooth scrolling for better UX */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </footer>
  );
};

export default Footer;