import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
  const [showDetails, setShowDetails] = useState(null);
  const [displayMode, setDisplayMode] = useState("slider"); // 'slider' or 'steps'
  const threeContainer = useRef(null);

  // Form state for creating/updating services
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    categoryId: "",
    salonId: "",
    steps: [{ name: "", description: "", image: "", preview: null }],
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

    renderer.domElement.className = "pointer-events-none";

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
      color: "#F97316",
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

  // Handle step input changes
  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  // Handle image file selection for steps with preview
  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newSteps = [...formData.steps];
      newSteps[index] = {
        ...newSteps[index],
        image: file.name,
        preview: URL.createObjectURL(file),
      };
      setFormData({ ...formData, steps: newSteps });
    }
  };

  // Add new step
  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        { name: "", description: "", image: "", preview: null },
      ],
    });
  };

  // Remove step
  const removeStep = (index) => {
    if (formData.steps.length === 1) {
      toast.error("Phải có ít nhất một bước!");
      return;
    }
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const serviceData = {
        name: formData.steps.map((step) => step.name).join("|"),
        description: formData.steps.map((step) => step.description).join("|"),
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        categoryId: parseInt(formData.categoryId),
        salonId: parseInt(formData.salonId),
        image: formData.steps.map((step) => step.image).join("|"),
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
    const names = service.name.split("|");
    const descriptions = service.description.split("|");
    const images = service.image.split("|");
    const steps = names.map((name, index) => ({
      name,
      description: descriptions[index] || "",
      image: images[index] || "",
      preview: images[index] ? getImageUrl(images[index]) : null,
    }));
    setFormData({
      name: service.name.split("|")[0],
      description: service.description.split("|")[0],
      price: service.price.toString(),
      duration: service.duration.toString(),
      categoryId: service.categoryId.toString(),
      salonId: service.salonId.toString(),
      steps,
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
      steps: [{ name: "", description: "", image: "", preview: null }],
    });
    setIsEditing(false);
    setCurrentService(null);
  };

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesCategory =
      !selectedCategory || service.categoryId === parseInt(selectedCategory);
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Không xác định";
  };

  // Parse service steps
  const parseSteps = (service) => {
    const names = service.name.split("|");
    const descriptions = service.description.split("|");
    const images = service.image.split("|");
    return names.map((name, index) => ({
      name,
      description: descriptions[index] || "",
      image: images[index] || "",
    }));
  };

  // Slider settings for multiple images
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
    <div className="min-h-screen bg-gray-900 text-white">
      <ToastContainer />
      <div
        ref={threeContainer}
        className="absolute top-0 left-0 w-full h-48 z-0"
      />
      <header className="relative z-10 bg-gradient-to-b from-gray-900 to-transparent pt-8 pb-16">
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
                className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
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
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                value={selectedSalon}
                onChange={(e) => setSelectedSalon(e.target.value)}
              >
                <option value="" className="bg-gray-800">
                  Chọn salon
                </option>
                {salons.map((salon) => (
                  <option
                    key={salon.id}
                    value={salon.id}
                    className="bg-gray-800"
                  >
                    {salon.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-1/3">
              <select
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white disabled:opacity-50"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={!selectedSalon}
              >
                <option value="" className="bg-gray-800">
                  Tất cả danh mục
                </option>
                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    className="bg-gray-800"
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="w-full md:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors duration-300 font-medium"
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
            {filteredServices.map((service) => {
              const firstStep = parseSteps(service)[0];
              return (
                <div
                  key={service.id}
                  className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-orange-500/20 transform hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-48">
                    <img
                      src={getImageUrl(firstStep.image)}
                      alt={firstStep.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 rounded-bl-lg font-medium">
                      {service.price} VND
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                      <span className="inline-block bg-gray-700 text-orange-500 text-xs px-2 py-1 rounded-full">
                        {getCategoryName(service.categoryId)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-2">{firstStep.name}</h3>
                    <p className="text-gray-400 mb-4">
                      {firstStep.description}
                    </p>

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
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors duration-300"
                        onClick={() => handleEdit(service)}
                      >
                        Sửa
                      </button>
                      <button
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors duration-300"
                        onClick={() =>
                          setShowDetails({
                            id: service.id,
                            activeIndex: 0,
                          })
                        }
                      >
                        Chi tiết
                      </button>
                      <button
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors duration-300"
                        onClick={() => handleDelete(service.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && filteredServices.length === 0 && (
          <div className="bg-gray-800 rounded-xl p-10 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-500 mb-4"
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
            <p className="text-gray-400">
              Vui lòng điều chỉnh tìm kiếm hoặc bộ lọc để tìm dịch vụ bạn cần.
            </p>
          </div>
        )}
      </main>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-10 w-full max-w-[80%] max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-cyan-400 relative">
            <button
              className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-300 text-4xl font-bold transition-colors duration-200"
              onClick={() => setShowDetails(null)}
            >
              ×
            </button>
            {(() => {
              const service = services.find((s) => s.id === showDetails.id);
              const steps = parseSteps(service);
              const serviceName = steps[0]?.name || "Dịch vụ không xác định";
              return (
                <>
                  <img
                    src={getImageUrl(steps[0]?.image)}
                    alt={serviceName}
                    className="absolute top-4 left-4 w-24 h-24 object-cover rounded-lg border-2 border-cyan-300 shadow-md"
                  />
                  <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-cyan-400 to-pink-500 text-transparent bg-clip-text mb-8">
                    {serviceName}
                  </h2>
                </>
              );
            })()}
            <div className="flex justify-between items-center mt-32 mb-8">
              <div className="flex space-x-4">
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
                  Giá: {services.find((s) => s.id === showDetails.id).price} VND
                </span>
                <span>
                  Thời gian:{" "}
                  {services.find((s) => s.id === showDetails.id).duration} phút
                </span>
              </div>
            </div>
            {(() => {
              const service = services.find((s) => s.id === showDetails.id);
              const steps = parseSteps(service);
              const displaySteps = steps.slice(1); // Start from second step
              if (steps.length <= 1) {
                // Single image case
                const step = steps[0];
                return (
                  <div className="flex flex-col items-center">
                    <img
                      src={getImageUrl(step.image)}
                      alt={step.name}
                      className="w-[80%] aspect-square object-cover rounded-2xl border-2 border-cyan-300 shadow-lg mx-auto mb-6 transition-transform duration-300 hover:scale-105"
                    />
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-cyan-300 mb-3">
                        {step.name || "Không có tên"}
                      </h3>
                      <p className="text-lg text-gray-100 italic">
                        {step.description || "Không có mô tả"}
                      </p>
                    </div>
                  </div>
                );
              } else if (displayMode === "slider") {
                // Slider mode: single image in slider
                if (displaySteps.length === 1) {
                  // Only one step after first, display statically
                  const step = displaySteps[0];
                  return (
                    <div className="flex flex-col items-center">
                      <img
                        src={getImageUrl(step.image)}
                        alt={step.name}
                        className="w-[80%] aspect-square object-cover rounded-2xl border-2 border-cyan-300 shadow-lg mx-auto mb-8 transition-transform duration-300 hover:scale-105"
                      />
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-cyan-300 mb-3">
                          Bước 1: {step.name || "Không có tên"}
                        </h3>
                        <p className="text-lg text-gray-100 italic">
                          {step.description || "Không có mô tả"}
                        </p>
                      </div>
                    </div>
                  );
                } else {
                  // Multiple steps, use slider
                  return (
                    <div className="flex flex-col items-center">
                      <div className="w-[80%]">
                        <Slider {...sliderSettings}>
                          {displaySteps.map((step, index) => (
                            <div key={index}>
                              <img
                                src={getImageUrl(step.image)}
                                alt={step.name}
                                className="w-full aspect-square object-cover rounded-2xl border-2 border-cyan-300 shadow-lg transition-transform duration-300 hover:scale-105"
                              />
                            </div>
                          ))}
                        </Slider>
                      </div>
                      <div className="mt-8 text-center">
                        <h3 className="text-2xl font-bold text-cyan-300 mb-3">
                          Bước {showDetails.activeIndex + 1}:{" "}
                          {displaySteps[showDetails.activeIndex]?.name ||
                            "Không có tên"}
                        </h3>
                        <p className="text-lg text-gray-100 italic">
                          {displaySteps[showDetails.activeIndex]?.description ||
                            "Không có mô tả"}
                        </p>
                      </div>
                    </div>
                  );
                }
              } else {
                // Step-by-step mode: horizontal layout with smaller image
                return (
                  <div>
                    {displaySteps.map((step, index) => (
                      <div
                        key={index}
                        className="mb-8 flex flex-row items-start"
                      >
                        <img
                          src={getImageUrl(step.image)}
                          alt={step.name}
                          className="w-48 h-48 object-cover rounded-lg border-2 border-cyan-300 shadow-lg mr-6 transition-transform duration-300 hover:scale-105"
                        />
                        <div>
                          <h3 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-500 text-transparent bg-clip-text mb-2">
                            Bước {index + 1}: {step.name || "Không có tên"}
                          </h3>
                          <p className="text-base text-gray-100 italic mt-2">
                            {step.description || "Không có mô tả"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
            })()}
            <button
              className="mt-8 w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={() => setShowDetails(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {isEditing ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Salon
                </label>
                <select
                  name="salonId"
                  value={formData.salonId}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                  required
                >
                  <option value="" className="bg-gray-700">
                    Chọn salon
                  </option>
                  {salons.map((salon) => (
                    <option
                      key={salon.id}
                      value={salon.id}
                      className="bg-gray-700"
                    >
                      {salon.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Giá (VND)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                  step="1000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Thời gian (phút)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Danh mục
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white disabled:opacity-50"
                  required
                  disabled={!formData.salonId}
                >
                  <option value="" className="bg-gray-700">
                    Chọn danh mục
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                      className="bg-gray-700"
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Các bước thực hiện
                </label>
                {formData.steps.map((step, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-200">
                          {index === 0 ? "Tên dịch vụ" : `Tên bước ${index}`}
                        </label>
                        <input
                          type="text"
                          value={step.name}
                          onChange={(e) =>
                            handleStepChange(index, "name", e.target.value)
                          }
                          className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-200">
                          Hình ảnh
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(index, e)}
                          className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                        />
                        {step.preview && (
                          <img
                            src={step.preview}
                            alt="Preview"
                            className="mt-2 w-32 h-32 object-cover rounded-lg border-2 border-cyan-300"
                          />
                        )}
                        {step.image && !step.preview && (
                          <span className="text-gray-400 text-sm mt-1 block">
                            Tên ảnh: {step.image}
                          </span>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-gray-200">
                          Mô tả bước
                        </label>
                        <textarea
                          value={step.description}
                          onChange={(e) =>
                            handleStepChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                          required
                          rows="2"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300"
                    >
                      Xóa bước
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStep}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-300"
                >
                  Thêm bước
                </button>
              </div>
              <div className="md:col-span-2 flex space-x-4 mt-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors duration-300"
                >
                  {isEditing ? "Cập nhật" : "Tạo mới"}
                </button>
                <button
                  type="button"
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors duration-300"
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
