import React, { useState, useEffect, useRef, memo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollMenu } from "react-horizontal-scrolling-menu";
import "react-horizontal-scrolling-menu/dist/styles.css";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Utility function to parse pipe-separated address
const parseAddress = (address) => {
  if (!address || typeof address !== "string") {
    return { province: "N/A", district: "N/A", ward: "N/A", street: "N/A" };
  }
  const [province, district, ward, street] = address
    .split("|")
    .map((part) => part.trim() || "N/A");
  return { province, district, ward, street };
};

// Utility function to format time
const formatTime = (date) =>
  date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

// Utility function to format date
const formatDate = (date) =>
  date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// Utility function to format schedule
const formatSchedule = (opening, closing) =>
  `${opening.slice(0, 5)} - ${closing.slice(0, 5)}`;

// Digital Clock Component
const DigitalClock = memo(({ currentTime }) => {
  const clockRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      clockRef.current,
      { opacity: 0, y: -20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: clockRef.current,
          start: "top 80%",
        },
      }
    );
  }, []);

  return (
    <div
      ref={clockRef}
      style={{
        position: "absolute",
        top: "24px",
        left: "24px",
        padding: "16px",
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(10px)",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          fontSize: "24px",
          fontFamily: "monospace",
          background: "linear-gradient(45deg, #ff0096, #00ccff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {formatTime(currentTime)}
      </div>
      <div style={{ fontSize: "12px", color: "#d1d5db" }}>
        {formatDate(currentTime)}
      </div>
    </div>
  );
});

DigitalClock.displayName = "DigitalClock";

// Admin Card Component
const AdminCard = memo(({ admin, getSalonNameBySalonId }) => (
  <div
    style={{
      padding: "16px",
      background: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "8px",
    }}
  >
    <p style={{ fontSize: "18px", fontWeight: "bold", color: "#fff" }}>
      {admin.fullName || "N/A"}
    </p>
    <span
      style={{
        padding: "4px 8px",
        fontSize: "12px",
        borderRadius: "9999px",
        color: "#fff",
        background: admin.role === "ADMIN" ? "#9333ff" : "#ec4899",
        display: "inline-block",
        marginTop: "4px",
      }}
    >
      {admin.role === "ADMIN" ? "Quản trị viên" : "Chủ salon"}
    </span>
    <p style={{ color: "#d1d5db", marginTop: "8px" }}>{admin.email}</p>
    {admin.role === "OWNER" && (
      <p style={{ fontSize: "14px", color: "#9ca3af" }}>
        Salon: {getSalonNameBySalonId(admin.salonId)}
      </p>
    )}
  </div>
));

AdminCard.displayName = "AdminCard";

// Salon Card Component
const SalonCard = memo(({ salon, index, openModal, preloadedImages }) => {
  const cardRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const maxIndex = preloadedImages[salon.id]?.length - 1 || 0;
    if (maxIndex <= 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % (maxIndex + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [preloadedImages, salon.id]);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: cardRef.current, start: "top 85%" },
      }
    );
  }, []);

  return (
    <div
      ref={cardRef}
      style={{
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(10px)",
        padding: "16px",
        borderRadius: "16px",
        width: "288px",
        margin: "0 8px",
        cursor: "pointer",
      }}
      onClick={() => openModal(salon)}
    >
      <div
        style={{
          width: "256px",
          height: "160px",
          marginBottom: "16px",
          overflow: "hidden",
          borderRadius: "8px",
        }}
      >
        <img
          src={
            preloadedImages[salon.id]?.[currentImageIndex] ||
            "https://via.placeholder.com/300x200?text=No+Image"
          }
          alt={salon.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="eager"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x200?text=Error";
          }}
        />
      </div>
      <h4
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#fff",
          marginBottom: "8px",
        }}
      >
        {salon.name}
      </h4>
      <p
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px",
          color: "#d1d5db",
        }}
      >
        <MapPin size={14} style={{ color: "#a78bfa" }} />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {parseAddress(salon.address).street}
        </span>
      </p>
      <p
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px",
          color: "#d1d5db",
        }}
      >
        <Clock size={14} style={{ color: "#4ade80" }} />
        {formatSchedule(salon.openingTime, salon.closingTime)}
      </p>
    </div>
  );
});

SalonCard.displayName = "SalonCard";

// Salon Modal Component
const SalonModal = memo(
  ({
    salon,
    closeModal,
    preloadedImages,
    handleContactAction,
    currentImageIndex,
    setCurrentImageIndex,
  }) => {
    const modalRef = useRef(null);
    const textRefs = useRef([]);
    const closeButtonRef = useRef(null);
    const [isImageLoading, setIsImageLoading] = useState(true);

    useEffect(() => {
      setIsImageLoading(true);
      const timer = setTimeout(() => {
        setIsImageLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }, [currentImageIndex]);

    useEffect(() => {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
      );

      textRefs.current.forEach((el, index) => {
        if (el) {
          gsap.fromTo(
            el,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power3.out",
              delay: index * 0.1,
            }
          );
        }
      });

      if (closeButtonRef.current) {
        gsap.fromTo(
          closeButtonRef.current,
          { opacity: 0, scale: 0 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: "back.out(1.4)",
            delay: 0.4,
          }
        );
      }
    }, []);

    useEffect(() => {
      if (!isImageLoading) {
        AOS.refresh();
      }
    }, [isImageLoading, currentImageIndex]);

    const handleNextImage = () => {
      if (currentImageIndex < preloadedImages[salon.id]?.length - 1) {
        setCurrentImageIndex((prev) => prev + 1);
      }
    };

    const handlePrevImage = () => {
      if (currentImageIndex > 0) {
        setCurrentImageIndex((prev) => prev - 1);
      }
    };

    const handleCloseClick = (e) => {
      e.stopPropagation();
      closeModal();
    };

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          padding: "16px",
        }}
        onClick={handleCloseClick}
      >
        <div
          ref={modalRef}
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "16px",
            padding: "24px",
            maxWidth: "1024px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            ref={closeButtonRef}
            onClick={handleCloseClick}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#ef4444",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.2s ease",
              zIndex: 100,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <X style={{ width: "16px", height: "16px" }} />
          </button>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            <h2
              ref={(el) => (textRefs.current[0] = el)}
              style={{
                fontSize: "30px",
                fontWeight: "bold",
                textAlign: "center",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {salon.name}
            </h2>
            {preloadedImages[salon.id]?.length > 0 ? (
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "16px",
                    minHeight: "400px",
                  }}
                >
                  {isImageLoading ? (
                    <div
                      style={{
                        width: "600px",
                        height: "400px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#e5e7eb",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          border: "4px solid #9333ea",
                          borderTop: "4px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    </div>
                  ) : (
                    <img
                      src={
                        preloadedImages[salon.id][currentImageIndex] ||
                        "https://via.placeholder.com/600x400?text=No+Image"
                      }
                      alt={`${salon.name} ${currentImageIndex + 1}`}
                      style={{
                        width: "600px",
                        height: "400px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      }}
                      loading="eager"
                      data-aos="fade-up"
                      data-aos-duration="600"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/600x400?text=Error";
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 15px rgba(0,0,0,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  )}
                </div>
                {preloadedImages[salon.id].length > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "16px",
                      marginTop: "16px",
                    }}
                  >
                    <button
                      onClick={handlePrevImage}
                      disabled={currentImageIndex === 0 || isImageLoading}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.5)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity:
                          currentImageIndex === 0 || isImageLoading ? 0.5 : 1,
                        cursor:
                          currentImageIndex === 0 || isImageLoading
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      <ChevronLeft style={{ width: "16px", height: "16px" }} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      disabled={
                        currentImageIndex ===
                          preloadedImages[salon.id].length - 1 || isImageLoading
                      }
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.5)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity:
                          currentImageIndex ===
                            preloadedImages[salon.id].length - 1 ||
                          isImageLoading
                            ? 0.5
                            : 1,
                        cursor:
                          currentImageIndex ===
                            preloadedImages[salon.id].length - 1 ||
                          isImageLoading
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      <ChevronRight style={{ width: "16px", height: "16px" }} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p
                ref={(el) => (textRefs.current[1] = el)}
                style={{ textAlign: "center", color: "#4b5563" }}
              >
                Không có hình ảnh.
              </p>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <h4
                  ref={(el) => (textRefs.current[2] = el)}
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#1f2937",
                  }}
                >
                  Thông Tin Liên Hệ
                </h4>
                {(() => {
                  const { province, district, ward, street } = parseAddress(
                    salon.address
                  );
                  return (
                    <>
                      <p
                        ref={(el) => (textRefs.current[3] = el)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#4b5563",
                        }}
                      >
                        <MapPin
                          style={{
                            width: "16px",
                            height: "16px",
                            color: "#9333ea",
                          }}
                        />
                        Tỉnh/Thành: {province}
                      </p>
                      <p
                        ref={(el) => (textRefs.current[4] = el)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#4b5563",
                        }}
                      >
                        <MapPin
                          style={{
                            width: "16px",
                            height: "16px",
                            color: "#9333ea",
                          }}
                        />
                        Quận/Huyện: {district}
                      </p>
                      <p
                        ref={(el) => (textRefs.current[5] = el)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#4b5563",
                        }}
                      >
                        <MapPin
                          style={{
                            width: "16px",
                            height: "16px",
                            color: "#9333ea",
                          }}
                        />
                        Phường/Xã: {ward}
                      </p>
                      <p
                        ref={(el) => (textRefs.current[6] = el)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#4b5563",
                        }}
                      >
                        <MapPin
                          style={{
                            width: "16px",
                            height: "16px",
                            color: "#9333ea",
                          }}
                        />
                        Đường: {street}
                      </p>
                      <p
                        ref={(el) => (textRefs.current[7] = el)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#4b5563",
                        }}
                      >
                        <Phone
                          style={{
                            width: "16px",
                            height: "16px",
                            color: "#3b82f6",
                          }}
                        />
                        {salon.contact}
                      </p>
                      <p
                        ref={(el) => (textRefs.current[8] = el)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#4b5563",
                        }}
                      >
                        <Mail
                          style={{
                            width: "16px",
                            height: "16px",
                            color: "#22c55e",
                          }}
                        />
                        {salon.email}
                      </p>
                    </>
                  );
                })()}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <h4
                  ref={(el) => (textRefs.current[9] = el)}
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#1f2937",
                  }}
                >
                  Thông Tin Khác
                </h4>
                <p
                  ref={(el) => (textRefs.current[10] = el)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#4b5563",
                  }}
                >
                  <MapPin
                    style={{
                      width: "16px",
                      height: "16px",
                      color: "#f97316",
                    }}
                  />
                  {salon.city}
                </p>
                <p
                  ref={(el) => (textRefs.current[11] = el)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#4b5563",
                  }}
                >
                  <Clock
                    style={{
                      width: "16px",
                      height: "16px",
                      color: "#6366f1",
                    }}
                  />
                  {formatSchedule(salon.openingTime, salon.closingTime)}
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <a
                href="http://localhost:5173/booking"
                style={{
                  padding: "8px 24px",
                  background: "#9333ea",
                  color: "#fff",
                  borderRadius: "8px",
                }}
              >
                Đặt lịch
              </a>
              <button
                onClick={() => handleContactAction(salon.contact)}
                style={{
                  padding: "8px 24px",
                  background: "#22c55e",
                  color: "#fff",
                  borderRadius: "8px",
                }}
              >
                Liên hệ
              </button>
              <button
                onClick={handleCloseClick}
                style={{
                  padding: "8px 24px",
                  background: "#6b7280",
                  color: "#fff",
                  borderRadius: "8px",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SalonModal.displayName = "SalonModal";

// Contact Modal Component
const ContactModal = memo(({ closeContactModal }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
    );
  }, []);

  const handleCloseClick = (e) => {
    e.stopPropagation();
    closeContactModal();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "16px",
      }}
      onClick={handleCloseClick}
    >
      <div
        ref={modalRef}
        style={{
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "400px",
          width: "100%",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleCloseClick}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#ef4444",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 100,
          }}
        >
          <X style={{ width: "16px", height: "16px" }} />
        </button>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            textAlign: "center",
          }}
        >
          <AlertCircle
            style={{
              width: "48px",
              height: "48px",
              color: "#ef4444",
              margin: "0 auto",
            }}
          />
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#1f2937",
            }}
          >
            Không thể gọi điện
          </h3>
          <p style={{ color: "#4b5563" }}>
            Thiết bị này không hỗ trợ gọi điện trực tiếp. Vui lòng sử dụng điện
            thoại di động.
          </p>
          <button
            onClick={handleCloseClick}
            style={{
              padding: "8px 24px",
              background: "#3b82f6",
              color: "#fff",
              borderRadius: "8px",
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
});

ContactModal.displayName = "ContactModal";

// Main Footer Component
const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [admins, setAdmins] = useState([]);
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState({});

  const footerRef = useRef(null);
  const titleRefs = useRef([]);

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
    return () => {
      AOS.refreshHard();
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8082/user");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Không thể lấy dữ liệu người dùng"
        );
      }
      const data = await response.json();
      if (!data?.length) throw new Error("Không tìm thấy người dùng");
      return data;
    } catch (err) {
      throw err;
    }
  };

  const fetchSalons = async () => {
    try {
      const response = await fetch("http://localhost:8084/salon");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể lấy dữ liệu salon");
      }
      const data = await response.json();
      if (!data?.length) throw new Error("Không tìm thấy salon");
      return data;
    } catch (err) {
      throw err;
    }
  };

  const preloadSalonImages = async (salons) => {
    const imageCache = {};
    for (const salon of salons) {
      imageCache[salon.id] = [];
      if (salon.images?.length) {
        const images = await Promise.all(
          salon.images.slice(0, 3).map(async (image) => {
            const img = new Image();
            const imageUrl = `http://localhost:8084/salon-images/${image}`;
            img.src = imageUrl;
            return new Promise((resolve) => {
              img.onload = () => resolve(imageUrl);
              img.onerror = () =>
                resolve("https://via.placeholder.com/600x400?text=No+Image");
            });
          })
        );
        imageCache[salon.id] = images;
      }
      if (imageCache[salon.id].length === 0) {
        imageCache[salon.id] = [
          "https://via.placeholder.com/600x400?text=No+Image",
        ];
      }
    }
    return imageCache;
  };

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsMobile(/mobile|android|iphone|ipad|tablet/i.test(userAgent));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, salonData] = await Promise.all([
          fetchUsers(),
          fetchSalons(),
        ]);
        setAdmins(
          users.filter((user) => ["ADMIN", "OWNER"].includes(user.role))
        );
        setSalons(salonData);
        const images = await preloadSalonImages(salonData);
        setPreloadedImages(images);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    titleRefs.current.forEach((el, index) => {
      if (el) {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            delay: index * 0.1,
            scrollTrigger: { trigger: el, start: "top 85%" },
          }
        );
      }
    });
  }, []);

  const openModal = (salon) => {
    setSelectedSalon(salon);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedSalon(null);
  };

  const openContactModal = () => setShowContactModal(true);

  const closeContactModal = () => setShowContactModal(false);

  const handleContactAction = (phoneNumber) => {
    if (isMobile) window.location.href = `tel:${phoneNumber}`;
    else openContactModal();
  };

  const getSalonNameBySalonId = (salonId) =>
    salons.find((s) => s.id === salonId)?.name || "Không có salon";

  return (
    <footer
      ref={footerRef}
      style={{
        background: "linear-gradient(135deg, #1a1a2e, #533483)",
        color: "#fff",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.2,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "40px",
            width: "192px",
            height: "192px",
            background: "#9333ea",
            borderRadius: "50%",
            filter: "blur(32px)",
            animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            right: "40px",
            width: "256px",
            height: "256px",
            background: "#3b82f6",
            borderRadius: "50%",
            filter: "blur(32px)",
            animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            animationDelay: "2s",
          }}
        />
      </div>

      <DigitalClock currentTime={currentTime} />

      <div
        style={{ margin: "0 auto", padding: "48px 16px", maxWidth: "1280px" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
          <div style={{ textAlign: "center" }}>
            <h2
              ref={(el) => (titleRefs.current[0] = el)}
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Beauty Salon
            </h2>
            <p style={{ color: "#d1d5db", marginTop: "8px" }}>
              Professional Hair Studio
            </p>
          </div>

          <div>
            <h3
              ref={(el) => (titleRefs.current[1] = el)}
              style={{
                fontSize: "30px",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "24px",
                background: "linear-gradient(135deg, #ffecd2, #fcb69f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Đội Ngũ Quản Trị
            </h3>
            {loading ? (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-block",
                    width: "32px",
                    height: "32px",
                    border: "2px solid #9333ea",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
            ) : error ? (
              <p style={{ color: "#f87171", textAlign: "center" }}>{error}</p>
            ) : admins.length === 0 ? (
              <p style={{ color: "#d1d5db", textAlign: "center" }}>
                Không tìm thấy quản trị viên
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "16px",
                }}
              >
                {admins.map((admin) => (
                  <AdminCard
                    key={admin.id}
                    admin={admin}
                    getSalonNameBySalonId={getSalonNameBySalonId}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h3
              ref={(el) => (titleRefs.current[2] = el)}
              style={{
                fontSize: "30px",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "24px",
                background: "linear-gradient(135deg, #ffecd2, #fcb69f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Các Salon Của Chúng Tôi
            </h3>
            {loading ? (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-block",
                    width: "32px",
                    height: "32px",
                    border: "2px solid #9333ea",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
            ) : error ? (
              <p style={{ color: "#f87171", textAlign: "center" }}>{error}</p>
            ) : salons.length === 0 ? (
              <p style={{ color: "#d1d5db", textAlign: "center" }}>
                Không tìm thấy salon
              </p>
            ) : (
              <div style={{ cursor: "grab" }}>
                <ScrollMenu>
                  {salons.map((salon, index) => (
                    <SalonCard
                      key={salon.id}
                      salon={salon}
                      index={index}
                      openModal={openModal}
                      preloadedImages={preloadedImages}
                      itemId={salon.id.toString()}
                    />
                  ))}
                </ScrollMenu>
              </div>
            )}
          </div>

          <div style={{ textAlign: "center" }}>
            <h3
              ref={(el) => (titleRefs.current[3] = el)}
              style={{
                fontSize: "30px",
                fontWeight: "bold",
                marginBottom: "24px",
                background: "linear-gradient(135deg, #ffecd2, #fcb69f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Kết Nối Với Chúng Tôi
            </h3>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "24px" }}
            >
              {[
                { icon: Facebook, color: "#1877f2" },
                { icon: Instagram, color: "#e4405f" },
                { icon: Youtube, color: "#ff0000" },
              ].map((social, index) => (
                <div
                  key={social.color}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    background: `${social.color}20`,
                    border: `1px solid ${social.color}40`,
                  }}
                >
                  <social.icon
                    style={{
                      width: "24px",
                      height: "24px",
                      color: social.color,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedSalon && (
        <SalonModal
          salon={selectedSalon}
          closeModal={closeModal}
          preloadedImages={preloadedImages}
          handleContactAction={handleContactAction}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
        />
      )}

      {showContactModal && (
        <ContactModal closeContactModal={closeContactModal} />
      )}
    </footer>
  );
};

export default Footer;
