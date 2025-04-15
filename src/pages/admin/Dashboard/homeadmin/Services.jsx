import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchSalons,
  fetchCategoriesBySalon,
  fetchServicesBySalon,
  createService,
  updateService,
  deleteService,
  getImageUrl,
} from "../../api/apiadmin/serviceoffering";

const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const threeContainer = useRef(null);

  // Form state for creating/updating services
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    categoryId: "",
    salonId: "",
    image: "",
  });

  // Fetch salons on mount
  useEffect(() => {
    const loadSalons = async () => {
      try {
        const salonData = await fetchSalons();
        setSalons(salonData);
      } catch (error) {
        toast.error(error.message);
      }
    };
    loadSalons();
  }, []);

  // Fetch categories and services when salon changes
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
          fetchServicesBySalon(selectedSalon),
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
  }, [selectedSalon]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!threeContainer.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / 200,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, 200);
    threeContainer.current.appendChild(renderer.domElement);

    // Ensure canvas doesn't block clicks
    renderer.domElement.style.pointerEvents = "none";

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: "#FF7E1F",
    });

    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    camera.position.z = 2;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event) => {
      mouseX = event.clientX / window.innerWidth - 0.5;
      mouseY = event.clientY / window.innerHeight - 0.5;
    };

    document.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.002;
      particlesMesh.rotation.x += 0.001;
      particlesMesh.rotation.x += mouseY * 0.05;
      particlesMesh.rotation.y += mouseX * 0.05;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / 200;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      if (threeContainer.current) {
        threeContainer.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "salonId" && value !== formData.salonId) {
      setFormData((prev) => ({ ...prev, categoryId: "" }));
      if (value) {
        fetchCategoriesBySalon(value)
          .then(setCategories)
          .catch((error) => toast.error(error.message));
      } else {
        setCategories([]);
      }
    }
  };

  // Handle image file selection (store filename only)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file.name });
    }
  };

  // Handle form submission (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        categoryId: parseInt(formData.categoryId),
        salonId: parseInt(formData.salonId),
        image: formData.image,
      };

      if (isEditing) {
        const updatedService = await updateService(
          currentService.id,
          serviceData
        );
        setServices(
          services.map((s) => (s.id === currentService.id ? updatedService : s))
        );
        toast.success("Dịch vụ đã được cập nhật thành công!");
      } else {
        const newService = await createService(serviceData);
        setServices([...services, newService]);
        toast.success("Dịch vụ đã được tạo thành công!");
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle edit button click
  const handleEdit = (service) => {
    setIsEditing(true);
    setCurrentService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      categoryId: service.categoryId.toString(),
      salonId: service.salonId.toString(),
      image: service.image || "",
    });
    fetchCategoriesBySalon(service.salonId)
      .then(setCategories)
      .catch((error) => toast.error(error.message));
    setShowModal(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa dịch vụ này không?")) {
      try {
        await deleteService(id);
        setServices(services.filter((s) => s.id !== id));
        toast.success("Dịch vụ đã được xóa thành công!");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      categoryId: "",
      salonId: "",
      image: "",
    });
    setIsEditing(false);
    setCurrentService(null);
    // Do not reset categories here to preserve header dropdown
  };

  // Filter services based on category and search term
  const filteredServices = services.filter((service) => {
    const matchesCategory =
      !selectedCategory || service.categoryId === parseInt(selectedCategory);
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Không xác định";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <ToastContainer />
      <div
        ref={threeContainer}
        className="absolute top-0 left-0 w-full h-48 z-0 pointer-events-none"
      />
      <header className="relative z-10 bg-gradient-to-b from-black to-transparent pt-8 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-2">
            <span className="text-orange-500">Salon</span> Quản lý dịch vụ
          </h1>
          <p className="text-center text-gray-400 mb-8">
            Quản lý dịch vụ salon của bạn một cách phong cách
          </p>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Tìm kiếm dịch vụ..."
                className="w-full p-3 pl-10 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="w-full md:w-1/3">
              <select
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={selectedSalon}
                onChange={(e) => setSelectedSalon(e.target.value)}
              >
                <option value="">Chọn salon</option>
                {salons.map((salon) => (
                  <option key={salon.id} value={salon.id}>
                    {salon.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-1/3">
              <select
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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

            <button
              className="w-full md:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-all duration-300 font-medium"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              Thêm dịch vụ mới
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 relative z-10 -mt-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-orange-500/20 transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-48">
                  <img
                    src={getImageUrl(service.image)}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 rounded-bl-lg font-medium">
                    {service.price} VND
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <span className="inline-block bg-gray-800 text-orange-500 text-xs px-2 py-1 rounded-full">
                      {getCategoryName(service.categoryId)}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                  <p className="text-gray-400 mb-4">{service.description}</p>

                  <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1 text-orange-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {service.duration} phút
                    </div>
                    <div>ID: {service.id}</div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded transition-colors duration-300"
                      onClick={() => handleEdit(service)}
                    >
                      Sửa
                    </button>
                    <button
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded transition-colors duration-300"
                      onClick={() => handleDelete(service.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredServices.length === 0 && (
          <div className="bg-gray-900 rounded-xl p-10 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-700 mb-4"
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
            <h3 className="text-xl font-medium mb-1">Không tìm thấy dịch vụ</h3>
            <p className="text-gray-500">
              Vui lòng điều chỉnh tìm kiếm hoặc bộ lọc để tìm dịch vụ bạn cần.
            </p>
          </div>
        )}
      </main>

      {/* Modal for Create/Edit Service */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">
              {isEditing ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Salon</label>
                <select
                  name="salonId"
                  value={formData.salonId}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Chọn salon</option>
                  {salons.map((salon) => (
                    <option key={salon.id} value={salon.id}>
                      {salon.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên dịch vụ
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Giá (VND)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  step="1000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Thời gian (phút)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Danh mục
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  disabled={!formData.salonId}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Hình ảnh
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {formData.image && (
                  <div className="mt-2">
                    <span className="text-gray-400">
                      Tên ảnh: {formData.image}
                    </span>
                  </div>
                )}
              </div>
              <div className="md:col-span-2 flex space-x-4 mt-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded transition-colors duration-300"
                >
                  {isEditing ? "Cập nhật" : "Tạo mới"}
                </button>
                <button
                  type="button"
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded transition-colors duration-300"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
