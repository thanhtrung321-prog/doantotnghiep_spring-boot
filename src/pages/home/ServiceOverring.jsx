import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchSalons,
  fetchCategoriesBySalon,
  fetchServicesBySalon,
  getImageUrl,
} from "../../api/serviceoffering";

const ServiceOffering = () => {
  const [salons, setSalons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const user = { id: 1 }; // Mock logged-in user

  useEffect(() => {
    const loadSalons = async () => {
      try {
        const salonData = await fetchSalons();
        setSalons(salonData);
        if (salonData.length > 0) {
          setSelectedSalon(salonData[0].id.toString());
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    loadSalons();
  }, []);

  useEffect(() => {
    if (!selectedSalon) {
      setCategories([]);
      setServices([]);
      setSelectedCategory("");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [categoryData, serviceData] = await Promise.all([
          fetchCategoriesBySalon(selectedSalon),
          fetchServicesBySalon(selectedSalon, selectedCategory || null),
        ]);
        setCategories(categoryData);
        setServices(serviceData);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedSalon, selectedCategory]);

  const handleBookNow = (service) => {
    navigate("/booking", {
      state: {
        userId: user.id,
        salonId: selectedSalon,
        services: [
          {
            id: service.id,
            name: service.name,
            duration: service.duration,
            price: service.price,
          },
        ],
      },
    });
  };

  return (
    <div className="py-16 bg-gray-50">
      <ToastContainer />
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-amber-800 mb-4">
          Dịch Vụ Nổi Bật
        </h2>
        <p className="text-gray-600 text-lg mb-8">
          Khám phá những dịch vụ được ưa chuộng nhất tại salon của chúng tôi.
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-12">
          <div className="w-full md:w-1/4">
            <select
              className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800"
              value={selectedSalon}
              onChange={(e) => {
                setSelectedSalon(e.target.value);
                setSelectedCategory("");
              }}
            >
              <option value="">Chọn salon</option>
              {salons.map((salon) => (
                <option key={salon.id} value={salon.id}>
                  {salon.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-1/4">
            <select
              className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={!selectedSalon}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-xl font-medium text-gray-800 mb-1">
              Không tìm thấy dịch vụ
            </h3>
            <p className="text-gray-500">
              Vui lòng chọn salon hoặc danh mục khác để xem dịch vụ.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition"
              >
                <img
                  src={getImageUrl(service.image)}
                  alt={service.name}
                  className="w-full h-56 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-amber-800 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="text-gray-500 text-sm mb-4">
                    <span>Giá: {service.price.toLocaleString()} VND</span> |{" "}
                    <span>Thời gian: {service.duration} phút</span>
                  </div>
                  <button
                    onClick={() => handleBookNow(service)}
                    className="bg-amber-800 text-white px-4 py-2 rounded-full hover:bg-amber-700 transition"
                  >
                    Đặt Lịch Ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceOffering;
