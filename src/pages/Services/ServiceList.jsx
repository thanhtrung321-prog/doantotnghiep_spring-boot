import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  fetchSalons,
  fetchCategoriesBySalon,
  fetchServicesBySalon,
  getImageUrl,
} from "../../api/serviceoffering";

// Function to select service and redirect to booking
const selectServiceAndRedirect = async (service, navigate, salonId) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) throw new Error("User not logged in");

    // Store selected service in cookies using originalId or id
    const serviceId = service.originalId || service.id;
    const selectedServices = [serviceId.toString()];
    Cookies.set("selectedServices", JSON.stringify(selectedServices), {
      expires: 1,
    });

    // Navigate to booking page with user, salon, and service data
    navigate("/booking", {
      state: {
        userId: user.id,
        salonId,
        services: [service],
      },
    });
  } catch (error) {
    toast.error("Lỗi khi chọn dịch vụ: " + error.message);
    throw error;
  }
};

const ServiceList = () => {
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [showDetails, setShowDetails] = useState(null); // { id, activeIndex }
  const [displayMode, setDisplayMode] = useState("slider"); // "slider" or "steps"
  const navigate = useNavigate();

  // Initialize AOS and GSAP animations
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });

    // GSAP animation for header text
    gsap.fromTo(
      ".header-text",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" }
    );
  }, []);

  // Fetch salons on mount
  useEffect(() => {
    fetchSalons()
      .then((data) => setSalons(data || []))
      .catch(() => toast.error("Không thể tải danh sách salon"));
  }, []);

  // Fetch categories when salon is selected
  useEffect(() => {
    if (selectedSalon) {
      fetchCategoriesBySalon(selectedSalon)
        .then((data) => {
          if (data.length === 0) {
            toast.warn("Salon này hiện không có danh mục dịch vụ nào.");
            setCategories([]);
            setSelectedCategory(null);
            setServices([]);
          } else {
            setCategories(data);
            setSelectedCategory(null);
            setServices([]);
          }
        })
        .catch(() => toast.error("Không thể tải danh mục"));
    } else {
      setCategories([]);
      setSelectedCategory(null);
      setServices([]);
    }
  }, [selectedSalon]);

  // Fetch services when category is selected
  useEffect(() => {
    if (selectedSalon && selectedCategory) {
      fetchServicesBySalon(selectedSalon, selectedCategory.id)
        .then((data) => {
          if (data.length === 0) {
            toast.warn("Danh mục này hiện không có dịch vụ nào.");
            setServices([]);
          } else {
            setServices(data);
          }
        })
        .catch(() => toast.error("Không thể tải dịch vụ"));
    } else {
      setServices([]);
    }
  }, [selectedCategory, selectedSalon]);

  // Parse service steps
  const parseSteps = (service) => {
    const names = service.name.split("|").filter((name) => name.trim());
    const descriptions = service.description
      .split("|")
      .filter((desc) => desc.trim());
    const images = service.image.split("|").filter((img) => img.trim());

    // Cover is the first segment
    const cover = {
      name: names[0] || "Dịch vụ không xác định",
      description: descriptions[0] || "Không có mô tả",
      image: images[0] ? getImageUrl(images[0]) : "/api/placeholder/300/200",
    };

    // Steps start from the second segment
    const maxLength = Math.max(
      names.length,
      descriptions.length,
      images.length
    );
    const steps = Array.from({ length: maxLength - 1 }, (_, index) => ({
      name: names[index + 1] || `Bước ${index + 1}`,
      description: descriptions[index + 1] || "Không có mô tả",
      image: images[index + 1]
        ? getImageUrl(images[index + 1])
        : "/api/placeholder/300/200",
    })).filter((step) => step.name || step.description || step.image); // Remove empty steps

    return { cover, steps };
  };

  // Handle card click to show modal
  const handleCardClick = (e, service) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.className = "absolute bg-amber-300 opacity-50 rounded-full";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.transform = "translate(-50%, -50%) scale(0)";
    ripple.style.animation = "ripple 0.6s ease-out";
    card.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
      setShowDetails({ id: service.id, activeIndex: 0 });
      setDisplayMode("slider"); // Default to slider mode
    }, 600);
  };

  // Handle navigation in step-by-step mode
  const handleStepNavigation = (currentIndex, direction) => {
    const service = services.find((s) => s.id === showDetails.id);
    const { steps } = parseSteps(service);
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < steps.length) {
      setShowDetails((prev) => ({ ...prev, activeIndex: newIndex }));
    }
  };

  // Slider settings for modal
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 10000, // 10 seconds
    afterChange: (index) => {
      setShowDetails((prev) => ({ ...prev, activeIndex: index }));
    },
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="header-text text-4xl font-bold text-amber-800 mb-2">
            Dịch Vụ Của Chúng Tôi
          </h3>
          <div className="w-24 h-1 bg-amber-600 mx-auto"></div>
        </div>
        <div className="mb-8 text-center" data-aos="fade-up">
          <label className="block text-amber-900 font-medium mb-2">
            Chọn Salon
          </label>
          <select
            value={selectedSalon}
            onChange={(e) => {
              setSelectedSalon(e.target.value);
              setSelectedCategory(null);
            }}
            className="w-full max-w-xs p-3 border rounded-lg focus:ring-2 focus:ring-amber-600 mx-auto"
          >
            <option value="">Chọn salon</option>
            {salons.map((salon) => (
              <option key={salon.id} value={salon.id}>
                {salon.name}
              </option>
            ))}
          </select>
        </div>
        {selectedSalon && (
          <div
            className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            data-aos="fade-up"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`p-4 rounded-lg transition-all duration-300 flex flex-col items-center ${
                  selectedCategory?.id === category.id
                    ? "bg-amber-600 text-white shadow-lg"
                    : "bg-white shadow hover:shadow-lg"
                }`}
              >
                <img
                  src={`http://localhost:8086/category-images/${category.image}`}
                  alt={category.name}
                  className="w-32 h-32 object-cover rounded-lg mb-2"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/100/100";
                  }}
                />
                <span className="text-lg font-semibold">{category.name}</span>
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            const { cover } = parseSteps(service);
            return (
              <div
                key={service.id}
                onClick={(e) => handleCardClick(e, service)}
                className="relative bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden group"
                data-aos="fade-up"
                data-aos-delay={services.indexOf(service) * 100}
              >
                <img
                  src={cover.image}
                  alt={cover.name}
                  className="w-full h-48 object-cover rounded-lg mb-4 transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/300/200";
                  }}
                />
                <h4 className="text-xl font-semibold text-amber-800 mb-2">
                  {cover.name}
                </h4>
                <p className="text-gray-600 mb-4">{cover.description}</p>
                <p className="text-amber-600 font-bold mb-4">
                  {(service.price || 0).toLocaleString("vi-VN")} VND
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectServiceAndRedirect(service, navigate, selectedSalon);
                  }}
                  className="w-full py-2 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                  Đặt Lịch
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
          data-aos="zoom-in"
        >
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-10 w-full max-w-[80%] max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-cyan-400 relative">
            <button
              className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-300 text-4xl font-bold transition-colors duration-200"
              onClick={() => setShowDetails(null)}
            >
              ×
            </button>
            {(() => {
              const service = services.find((s) => s.id === showDetails.id);
              const { cover, steps } = parseSteps(service);
              return (
                <>
                  <img
                    src={cover.image}
                    alt={cover.name}
                    className="absolute top-4 left-4 w-24 h-24 object-cover rounded-lg border-2 border-cyan-300 shadow-md"
                    onError={(e) => {
                      e.target.src = "/api/placeholder/100/100";
                    }}
                  />
                  <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-cyan-400 to-pink-500 text-transparent bg-clip-text mb-8">
                    {cover.name}
                  </h2>
                </>
              );
            })()}
            <div className="flex justify-between items-center mb-8">
              <div className="flex space-x-4 mt-4">
                <button
                  className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    displayMode === "slider"
                      ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setDisplayMode("slider")}
                >
                  Chế độ Slider
                </button>
                <button
                  className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    displayMode === "steps"
                      ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setDisplayMode("steps")}
                >
                  Chế độ Từng Bước
                </button>
              </div>
              <div className="text-lg font-semibold text-yellow-300">
                <span className="mr-6">
                  Giá:{" "}
                  {(
                    services.find((s) => s.id === showDetails.id).price || 0
                  ).toLocaleString("vi-VN")}{" "}
                  VND
                </span>
                <span>
                  Thời gian:{" "}
                  {services.find((s) => s.id === showDetails.id).duration} phút
                </span>
              </div>
            </div>
            {(() => {
              const service = services.find((s) => s.id === showDetails.id);
              const { steps } = parseSteps(service);
              if (steps.length === 0) {
                // No steps case
                return (
                  <div className="flex flex-col items-center text-center">
                    <p className="text-lg text-gray-100 italic">
                      Không có bước chi tiết nào cho dịch vụ này.
                    </p>
                  </div>
                );
              } else if (steps.length === 1) {
                // Single step case
                const step = steps[0];
                return (
                  <div className="flex flex-col items-center">
                    <img
                      src={step.image}
                      alt={step.name}
                      className="w-[80%] aspect-square object-cover rounded-2xl border-2 border-cyan-300 shadow-lg mx-auto mb-6 transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/300/200";
                      }}
                    />
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-cyan-300 mb-3">
                        Bước 1: {step.name}
                      </h3>
                      <p className="text-lg text-gray-100 italic">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              } else if (displayMode === "slider") {
                // Slider mode
                return (
                  <div className="flex flex-col items-center">
                    <div className="w-[80%]">
                      <Slider {...sliderSettings}>
                        {steps.map((step, index) => (
                          <div key={index}>
                            <img
                              src={step.image}
                              alt={step.name}
                              className="w-full aspect-square object-cover rounded-2xl border-2 border-cyan-300 shadow-lg transition-transform duration-300 hover:scale-105"
                              onError={(e) => {
                                e.target.src = "/api/placeholder/300/200";
                              }}
                            />
                          </div>
                        ))}
                      </Slider>
                    </div>
                    <div className="mt-8 text-center">
                      <h3 className="text-2xl font-bold text-cyan-300 mb-3">
                        Bước {showDetails.activeIndex + 1}:{" "}
                        {steps[showDetails.activeIndex].name}
                      </h3>
                      <p className="text-lg text-gray-100 italic">
                        {steps[showDetails.activeIndex].description}
                      </p>
                    </div>
                  </div>
                );
              } else {
                // Step-by-step mode
                return (
                  <div>
                    {steps.map((step, index) => (
                      <div key={index} className="mb-8 flex flex-col">
                        <div className="flex flex-row items-start">
                          <img
                            src={step.image}
                            alt={step.name}
                            className="w-48 h-48 object-cover rounded-lg border-2 border-cyan-300 shadow-lg mr-6 transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              e.target.src = "/api/placeholder/100/100";
                            }}
                          />
                          <div className="flex flex-col">
                            <h3 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-500 text-transparent bg-clip-text mb-2">
                              Bước {index + 1}: {step.name}
                            </h3>
                            <p className="text-base text-gray-100 italic mt-2">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between mt-4">
                          {index > 0 && (
                            <button
                              className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg font-semibold transition-all duration-300"
                              onClick={() =>
                                handleStepNavigation(index, "prev")
                              }
                            >
                              Trước
                            </button>
                          )}
                          <div className="flex-1"></div>
                          {index < steps.length - 1 && (
                            <button
                              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-white hover:from-cyan-600 hover:to-pink-600 rounded-lg font-semibold transition-all duration-300"
                              onClick={() =>
                                handleStepNavigation(index, "next")
                              }
                            >
                              Tiếp
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
            })()}
            <button
              className="mt-8 w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                const service = services.find((s) => s.id === showDetails.id);
                selectServiceAndRedirect(service, navigate, selectedSalon);
              }}
            >
              Đặt Lịch
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          .relative {
            position: relative;
          }
          @keyframes ripple {
            to {
              transform: translate(-50%, -50%) scale(3);
              opacity: 0;
            }
          }
          .group:hover img {
            transform: scale(1.1);
          }
        `}
      </style>
    </div>
  );
};

export default ServiceList;
