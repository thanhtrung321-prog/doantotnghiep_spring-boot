import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Clock,
  Mail,
  Phone,
  MapPin,
  User,
  ChevronDown,
  Grid,
  List,
  Home,
} from "lucide-react";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import {
  getAllSalons,
  createSalon,
  updateSalon,
  getSalonById,
} from "../../api/apiadmin/salonmanager";

const Salons = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.id) {
      setModalMessage("Please log in to manage salons.");
      setIsErrorModalOpen(true);
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [user.id, navigate]);

  const [newSalonData, setNewSalonData] = useState({
    name: "",
    address: "",
    city: "",
    openingTime: "09:00",
    closingTime: "21:00",
    contact: "",
    email: "",
    ownerId: user.id || 1,
    images: [],
  });

  const threeContainerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cubesRef = useRef([]);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        setIsLoading(true);
        const data = await getAllSalons();
        setSalons(data);
      } catch (error) {
        setModalMessage("Failed to fetch salons. Please try again.");
        setIsErrorModalOpen(true);
      } finally {
        setIsLoading(false);
      }
    };
    if (user.id) fetchSalons();
  }, [user.id]);

  useEffect(() => {
    if (!threeContainerRef.current) return;
    const width = threeContainerRef.current.clientWidth;
    const height = threeContainerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    threeContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x6d28d9, 1);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);

    cubesRef.current = [];
    const colors = [0x6d28d9, 0x8b5cf6, 0xa78bfa, 0xc4b5fd];

    for (let i = 0; i < 40; i++) {
      const size = Math.random() * 0.5 + 0.1;
      const geometry = new THREE.BoxGeometry(size, size, size);
      const colorIndex = Math.floor(Math.random() * colors.length);
      const material = new THREE.MeshPhongMaterial({
        color: colors[colorIndex],
        transparent: true,
        opacity: 0.7,
        shininess: 100,
      });
      const cube = new THREE.Mesh(geometry, material);

      const radius = 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      cube.position.x = radius * Math.sin(phi) * Math.cos(theta);
      cube.position.y = radius * Math.sin(phi) * Math.sin(theta);
      cube.position.z = radius * Math.cos(phi);
      cube.userData.originalPosition = cube.position.clone();

      cube.userData.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      };

      scene.add(cube);
      cubesRef.current.push(cube);
    }

    const animate = (time) => {
      requestAnimationFrame(animate);

      cubesRef.current.forEach((cube, i) => {
        cube.rotation.x += cube.userData.rotationSpeed.x;
        cube.rotation.y += cube.userData.rotationSpeed.y;
        cube.rotation.z += cube.userData.rotationSpeed.z;

        const offset = i * 0.1;
        const amplitude = 0.1;
        cube.position.x =
          cube.userData.originalPosition.x +
          Math.sin(time * 0.01 + offset) * amplitude;
        cube.position.y =
          cube.userData.originalPosition.y +
          Math.cos(time * 0.01 + offset) * amplitude;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate(0);

    const handleResize = () => {
      if (!threeContainerRef.current) return;
      const width = threeContainerRef.current.clientWidth;
      const height = threeContainerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (threeContainerRef.current && rendererRef.current) {
        threeContainerRef.current.removeChild(rendererRef.current.domElement);
      }
      cubesRef.current.forEach((cube) => {
        if (cube.geometry) cube.geometry.dispose();
        if (cube.material) cube.material.dispose();
      });
    };
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!newSalonData.name.trim()) errors.name = "Tên salon là bắt buộc";
    if (!newSalonData.address.trim()) errors.address = "Địa chỉ là bắt buộc";
    if (!newSalonData.city.trim()) errors.city = "Thành phố là bắt buộc";
    if (!newSalonData.openingTime)
      errors.openingTime = "Giờ mở cửa là bắt buộc";
    if (!newSalonData.closingTime)
      errors.closingTime = "Giờ đóng cửa là bắt buộc";
    if (!newSalonData.contact.trim())
      errors.contact = "Số điện thoại là bắt buộc";
    if (!newSalonData.email.trim()) errors.email = "Email là bắt buộc";
    else if (!/\S+@\S+\.\S+/.test(newSalonData.email))
      errors.email = "Email không hợp lệ";
    if (!newSalonData.ownerId) errors.ownerId = "Chủ sở hữu là bắt buộc";
    return errors;
  };

  const handleAddSalon = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const salonData = {
        name: newSalonData.name,
        address: newSalonData.address,
        city: newSalonData.city,
        openingTime: newSalonData.openingTime,
        closingTime: newSalonData.closingTime,
        contact: newSalonData.contact,
        email: newSalonData.email,
        ownerId: newSalonData.ownerId,
        images:
          newSalonData.images.length > 0
            ? newSalonData.images
            : ["image1.jpg", "image2.jpg"], // Default images if none provided
      };

      console.log("Sending salon data:", salonData);
      const createdSalon = await createSalon(salonData);
      setSalons((prev) => [...prev, createdSalon]);
      setIsAddModalOpen(false);
      setNewSalonData({
        name: "",
        address: "",
        city: "",
        openingTime: "09:00",
        closingTime: "21:00",
        contact: "",
        email: "",
        ownerId: user.id || 1,
        images: [],
      });
      setFormErrors({});
      setModalMessage("Salon added successfully!");
      setIsSuccessModalOpen(true);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add salon. Please try again.";
      setModalMessage(errorMessage);
      setIsErrorModalOpen(true);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // For simplicity, we'll store file names. In a real app, you'd upload files to a server.
    const imageNames = files.map((file) => file.name);
    setNewSalonData({ ...newSalonData, images: imageNames });
  };

  const handleViewDetails = (salon) => {
    setSelectedSalon(salon);
    setIsDetailModalOpen(true);
  };

  const handleEditSalon = async () => {
    try {
      const updatedSalon = await updateSalon(selectedSalon.id, selectedSalon);
      setSalons((prev) =>
        prev.map((salon) =>
          salon.id === updatedSalon.id ? updatedSalon : salon
        )
      );
      setIsEditModalOpen(false);
      setModalMessage("Salon updated successfully!");
      setIsSuccessModalOpen(true);
    } catch (error) {
      setModalMessage("Failed to update salon. Please try again.");
      setIsErrorModalOpen(true);
    }
  };

  const handleDeleteSalon = (id) => {
    setSalons((prev) => prev.filter((salon) => salon.id !== id));
    setModalMessage("Salon deleted successfully!");
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
      <div
        ref={threeContainerRef}
        className="fixed inset-0 -z-10"
        aria-hidden="true"
      />

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900">
          <div className="space-y-6 text-center">
            <div className="inline-block relative">
              <div className="w-24 h-24 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"></div>
              <div className="w-20 h-20 absolute top-2 left-2 rounded-full border-t-4 border-b-4 border-pink-500 animate-spin animate-pulse"></div>
              <div className="w-16 h-16 absolute top-4 left-4 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin animate-ping"></div>
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Đang tải dữ liệu salon...
            </h2>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-10">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 mb-4">
            Quản lý danh sách Salon
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Hệ thống quản trị salon chuyên nghiệp, theo dõi và quản lý tất cả
            các salon của bạn một cách hiệu quả.
          </p>
        </header>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="w-full md:w-96 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm salon theo tên, địa chỉ..."
              className="pl-10 pr-4 py-2 w-full bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-lg"
              aria-label="Tìm kiếm salon"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-lg overflow-hidden backdrop-blur-lg">
              <button
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-purple-600/70 text-white"
                    : "bg-gray-800/50 text-gray-300"
                }`}
                onClick={() => setViewMode("grid")}
                aria-label="Chế độ xem lưới"
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-purple-600/70 text-white"
                    : "bg-gray-800/50 text-gray-300"
                }`}
                onClick={() => setViewMode("list")}
                aria-label="Chế độ xem danh sách"
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            <button className="flex items-center px-4 py-2 bg-gray-800/50 text-white rounded-lg hover:bg-gray-700/50 transition-colors backdrop-blur-lg border border-gray-700/30">
              <Filter className="h-5 w-5 mr-2" />
              Lọc
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-lg"
              disabled={!user.id}
            >
              <Plus className="h-5 w-5 mr-2" />
              Thêm salon mới
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon) => (
              <div
                key={salon.id}
                className="group bg-gray-800/30 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      salon.images && salon.images.length > 0
                        ? `http://localhost:8084/salon-images/${salon.images[0]}`
                        : "/api/placeholder/600/400"
                    }
                    alt={salon.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h2 className="text-xl font-bold text-white">
                      {salon.name}
                    </h2>
                    <div className="flex items-center mt-1 text-gray-300">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="ml-1 text-sm truncate">
                        {salon.address}, {salon.city}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center text-gray-300">
                    <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="ml-2 text-sm">
                      {salon.openingTime} - {salon.closingTime}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-300">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="ml-2 text-sm">{salon.contact}</span>
                  </div>

                  <div className="flex items-center text-gray-300">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="ml-2 text-sm truncate">{salon.email}</span>
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewDetails(salon)}
                      className="px-3 py-1 text-sm bg-indigo-600/70 text-white rounded-md hover:bg-indigo-500/70 transition-colors"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSalon(salon);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1 text-indigo-400 hover:text-indigo-300"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSalon(salon.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-lg rounded-xl backdrop-blur-lg border border-gray-800/50">
                <table className="min-w-full divide-y divide-gray-800/50">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Tên salon
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Địa chỉ
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Giờ mở cửa
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Liên hệ
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800/30 divide-y divide-gray-800/50">
                    {salons.map((salon) => (
                      <tr
                        key={salon.id}
                        className="hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                          {salon.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {salon.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            <span>
                              {salon.address}, {salon.city}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            <span>
                              {salon.openingTime} - {salon.closingTime}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{salon.contact}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{salon.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(salon)}
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              Chi tiết
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSalon(salon);
                                setIsEditModalOpen(true);
                              }}
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSalon(salon.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Hiển thị{" "}
            <span className="font-medium text-white">{salons.length}</span>{" "}
            salon
          </div>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 bg-gray-800/50 text-white rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-colors backdrop-blur-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Trước
            </button>
            <button className="px-4 py-2 bg-purple-600/70 text-white rounded-lg border border-purple-500/50 hover:bg-purple-500/70 transition-colors backdrop-blur-lg">
              1
            </button>
            <button
              className="px-4 py-2 bg-gray-800/50 text-white rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-colors backdrop-blur-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl border border-gray-800 animate-bounce-in">
            <div className="flex justify-between items-center border-b border-gray-800 p-4">
              <h3 className="text-xl font-bold">Thêm Salon Mới</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-gray-800 rounded-full transition-all"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddSalon} className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400">Tên salon</label>
                <input
                  type="text"
                  value={newSalonData.name}
                  onChange={(e) =>
                    setNewSalonData({ ...newSalonData, name: e.target.value })
                  }
                  className={`w-full px-4 py-2 bg-gray-800 border ${
                    formErrors.name ? "border-red-500" : "border-gray-700"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400">Địa chỉ</label>
                <input
                  type="text"
                  value={newSalonData.address}
                  onChange={(e) =>
                    setNewSalonData({
                      ...newSalonData,
                      address: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2 bg-gray-800 border ${
                    formErrors.address ? "border-red-500" : "border-gray-700"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                />
                {formErrors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.address}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400">Thành phố</label>
                <input
                  type="text"
                  value={newSalonData.city}
                  onChange={(e) =>
                    setNewSalonData({ ...newSalonData, city: e.target.value })
                  }
                  className={`w-full px-4 py-2 bg-gray-800 border ${
                    formErrors.city ? "border-red-500" : "border-gray-700"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                />
                {formErrors.city && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400">Giờ mở cửa</label>
                <TimePicker
                  onChange={(value) =>
                    setNewSalonData({
                      ...newSalonData,
                      openingTime: value || "09:00",
                    })
                  }
                  value={newSalonData.openingTime}
                  format="HH:mm"
                  disableClock
                  clearIcon={null}
                  className={`w-full px-4 py-2 bg-gray-800 border ${
                    formErrors.openingTime
                      ? "border-red-500"
                      : "border-gray-700"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white`}
                />
                {formErrors.openingTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.openingTime}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400">Giờ đóng cửa</label>
                <TimePicker
                  onChange={(value) =>
                    setNewSalonData({
                      ...newSalonData,
                      closingTime: value || "21:00",
                    })
                  }
                  value={newSalonData.closingTime}
                  format="HH:mm"
                  disableClock
                  clearIcon={null}
                  className={`w-full px-4 py-2 bg-gray-800 border ${
                    formErrors.closingTime
                      ? "border-red-500"
                      : "border-gray-700"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white`}
                />
                {formErrors.closingTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.closingTime}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400">Số điện thoại</label>
                <input
                  type="text"
                  value={newSalonData.contact}
                  onChange={(e) =>
                    setNewSalonData({
                      ...newSalonData,
                      contact: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2 bg-gray-800 border ${
                    formErrors.contact ? "border-red-500" : "border-gray-700"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                />
                {formErrors.contact && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.contact}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <input
                  type="email"
                  value={newSalonData.email}
                  onChange={(e) =>
                    setNewSalonData({ ...newSalonData, email: e.target.value })
                  }
                  className={`w-full px-4 py-2 bg-gray-800 border ${
                    formErrors.email ? "border-red-500" : "border-gray-700"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400">Hình ảnh</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
                {newSalonData.images.length > 0 && (
                  <p className="text-gray-400 text-xs mt-1">
                    {newSalonData.images.join(", ")}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-all"
              >
                Thêm Salon
              </button>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedSalon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl border border-gray-800 animate-bounce-in">
            <div className="flex justify-between items-center border-b border-gray-800 p-4">
              <h3 className="text-xl font-bold">Chỉnh sửa Salon</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-gray-800 rounded-full transition-all"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400">Tên salon</label>
                <input
                  type="text"
                  value={selectedSalon.name}
                  onChange={(e) =>
                    setSelectedSalon({ ...selectedSalon, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Địa chỉ</label>
                <input
                  type="text"
                  value={selectedSalon.address}
                  onChange={(e) =>
                    setSelectedSalon({
                      ...selectedSalon,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Thành phố</label>
                <input
                  type="text"
                  value={selectedSalon.city}
                  onChange={(e) =>
                    setSelectedSalon({ ...selectedSalon, city: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Giờ mở cửa</label>
                <TimePicker
                  onChange={(value) =>
                    setSelectedSalon({
                      ...selectedSalon,
                      openingTime: value || "09:00",
                    })
                  }
                  value={selectedSalon.openingTime}
                  format="HH:mm"
                  disableClock
                  clearIcon={null}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Giờ đóng cửa</label>
                <TimePicker
                  onChange={(value) =>
                    setSelectedSalon({
                      ...selectedSalon,
                      closingTime: value || "21:00",
                    })
                  }
                  value={selectedSalon.closingTime}
                  format="HH:mm"
                  disableClock
                  clearIcon={null}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Số điện thoại</label>
                <input
                  type="text"
                  value={selectedSalon.contact}
                  onChange={(e) =>
                    setSelectedSalon({
                      ...selectedSalon,
                      contact: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <input
                  type="email"
                  value={selectedSalon.email}
                  onChange={(e) =>
                    setSelectedSalon({
                      ...selectedSalon,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={handleEditSalon}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-all"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedSalon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/60 backdrop-blur-sm"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            className="bg-gradient-to-br from-gray-900 to-indigo-900 p-6 rounded-2xl max-w-2xl w-full mx-4 shadow-2xl border border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                {selectedSalon.name}
              </h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={
                  selectedSalon.images && selectedSalon.images.length > 0
                    ? `http://localhost:8084/salon-images/${selectedSalon.images[0]}`
                    : "/api/placeholder/600/400"
                }
                alt={selectedSalon.name}
                className="w-full h-56 object-cover"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                    <MapPin className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Địa chỉ</p>
                    <p className="text-white">
                      {selectedSalon.address}, {selectedSalon.city}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                    <Clock className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Giờ mở cửa</p>
                    <p className="text-white">
                      {selectedSalon.openingTime} - {selectedSalon.closingTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                    <Phone className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Số điện thoại</p>
                    <p className="text-white">{selectedSalon.contact}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                    <Mail className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{selectedSalon.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                    <User className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">ID Chủ sở hữu</p>
                    <p className="text-white">{selectedSalon.ownerId}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                    <Home className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">ID Salon</p>
                    <p className="text-white">{selectedSalon.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-700/50">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-800/70 text-gray-300 rounded-lg hover:bg-gray-700/70 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 w-full max-w-md rounded-xl shadow-2xl border border-gray-800 p-6 animate-bounce-in">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-500/20 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-green-400">
              Thành công!
            </h3>
            <p className="text-gray-300 text-center mt-2">{modalMessage}</p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {isErrorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 w-full max-w-md rounded-xl shadow-2xl border border-gray-800 p-6 animate-bounce-in">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-500/20 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-red-400">Lỗi!</h3>
            <p className="text-gray-300 text-center mt-2">{modalMessage}</p>
            <button
              onClick={() => setIsErrorModalOpen(false)}
              className="w-full mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salons;
