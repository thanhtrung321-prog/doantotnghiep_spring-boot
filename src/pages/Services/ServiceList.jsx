import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as THREE from "three";

// API Service Functions
const fetchSalons = async () => {
  try {
    const response = await axios.get("http://localhost:8084/salon", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    toast.error("Không thể tải danh sách salon: " + error.message);
    throw error;
  }
};

const fetchCategoriesBySalon = async (salonId) => {
  try {
    const response = await axios.get(
      `http://localhost:8086/categories/salon/${salonId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    toast.error("Không thể tải danh mục: " + error.message);
    throw error;
  }
};

const fetchServicesByCategory = async (salonId, categoryId) => {
  try {
    const response = await axios.get(
      `http://localhost:8083/service-offering/salon/${salonId}?categoryId=${categoryId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    toast.error("Không thể tải dịch vụ: " + error.message);
    throw error;
  }
};

const selectServiceAndRedirect = async (service, navigate, salonId) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) throw new Error("User not logged in");

    // Store selected service in cookies
    const selectedServices = [service.id.toString()];
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

// Three.js Background Component
const ThreeBackground = () => {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.zIndex = "-1";
    renderer.domElement.style.opacity = "0.3";
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff7800,
      wireframe: true,
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    camera.position.z = 30;

    const animate = () => {
      requestAnimationFrame(animate);
      torusKnot.rotation.x += 0.01;
      torusKnot.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return null;
};

const ServiceList = () => {
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  // Fetch salons on mount
  useEffect(() => {
    fetchSalons()
      .then((data) => setSalons(data || []))
      .catch(() => {});
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
        .catch(() => {});
    } else {
      setCategories([]);
      setSelectedCategory(null);
      setServices([]);
    }
  }, [selectedSalon]);

  // Fetch services when category is selected
  useEffect(() => {
    if (selectedCategory && selectedSalon) {
      fetchServicesByCategory(selectedSalon, selectedCategory.id)
        .then((data) => {
          if (data.length === 0) {
            toast.warn("Danh mục này hiện không có dịch vụ nào.");
            setServices([]);
          } else {
            setServices(data);
          }
        })
        .catch(() => {});
    } else {
      setServices([]);
    }
  }, [selectedCategory, selectedSalon]);

  const handleServiceClick = (service) => {
    selectServiceAndRedirect(service, navigate, selectedSalon);
  };

  // Handle ripple effect on click
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
      handleServiceClick(service);
    }, 600); // Match animation duration
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <ThreeBackground />
      <ToastContainer />
      <div className="container mx-auto px-4 py-16 animate-slide-in">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-amber-800 mb-2">
            Dịch Vụ Của Chúng Tôi
          </h3>
          <div className="w-24 h-1 bg-amber-600 mx-auto"></div>
        </div>
        <div className="mb-8 text-center">
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
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                    e.target.src = "/placeholder-image.png"; // Fallback image
                  }}
                />
                <span className="text-lg font-semibold">{category.name}</span>
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={(e) => handleCardClick(e, service)}
              className="relative bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden"
            >
              <img
                src={`http://localhost:8083/service-offering-images/${service.image}`}
                alt={service.name}
                className="w-full h-48 object-cover rounded-lg mb-4 transition-transform duration-300 group-hover:scale-110"
              />
              <h4 className="text-xl font-semibold text-amber-800 mb-2">
                {service.name}
              </h4>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <p className="text-amber-600 font-bold mb-4">
                {(service.price || 0).toLocaleString("vi-VN")} VND
              </p>
              <button className="w-full py-2 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-300 flex items-center justify-center gap-2">
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
          ))}
        </div>
      </div>
      <style>
        {`
          .animate-slide-in {
            animation: slideIn 0.5s ease-out;
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes ripple {
            to {
              transform: translate(-50%, -50%) scale(3);
              opacity: 0;
            }
          }
          .relative {
            position: relative;
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
