import React, { useState, useEffect, useRef } from "react";
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
  ChevronRight,
  Home,
  Settings,
  Calendar,
  Grid,
  List,
  MoreHorizontal,
} from "lucide-react";

const Salons = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Sample salon data
  const [salons, setSalons] = useState([
    {
      id: 1,
      name: "Salon Luxury Beauty",
      address: "123 Nguyễn Huệ",
      city: "Hồ Chí Minh",
      opening_time: "09:00",
      closing_time: "21:00",
      contact: "0901234567",
      email: "contact@luxurybeauty.com",
      owner_id: 1001,
      image: "/api/placeholder/600/400",
      rating: 4.8,
      services_count: 15,
    },
    {
      id: 2,
      name: "Modern Spa & Salon",
      address: "45 Lê Lợi",
      city: "Hà Nội",
      opening_time: "08:30",
      closing_time: "20:00",
      contact: "0912345678",
      email: "info@modernspa.com",
      owner_id: 1002,
      image: "/api/placeholder/600/400",
      rating: 4.6,
      services_count: 12,
    },
    {
      id: 3,
      name: "Elegance Hair Studio",
      address: "78 Trần Hưng Đạo",
      city: "Đà Nẵng",
      opening_time: "10:00",
      closing_time: "19:30",
      contact: "0923456789",
      email: "hello@elegancehair.com",
      owner_id: 1003,
      image: "/api/placeholder/600/400",
      rating: 4.5,
      services_count: 10,
    },
    {
      id: 4,
      name: "Golden Scissors",
      address: "56 Lê Duẩn",
      city: "Hồ Chí Minh",
      opening_time: "08:00",
      closing_time: "22:00",
      contact: "0934567890",
      email: "golden@scissors.com",
      owner_id: 1004,
      image: "/api/placeholder/600/400",
      rating: 4.9,
      services_count: 18,
    },
    {
      id: 5,
      name: "Shine Beauty Center",
      address: "34 Phan Chu Trinh",
      city: "Hà Nội",
      opening_time: "09:30",
      closing_time: "20:30",
      contact: "0945678901",
      email: "hello@shinebeauty.com",
      owner_id: 1005,
      image: "/api/placeholder/600/400",
      rating: 4.7,
      services_count: 14,
    },
    {
      id: 6,
      name: "Royal Spa & Salon",
      address: "89 Nguyễn Thái Học",
      city: "Nha Trang",
      opening_time: "10:30",
      closing_time: "21:30",
      contact: "0956789012",
      email: "royal@spasalon.com",
      owner_id: 1006,
      image: "/api/placeholder/600/400",
      rating: 4.4,
      services_count: 16,
    },
  ]);

  // Three.js refs
  const threeContainerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cubesRef = useRef([]);
  const timeRef = useRef(0);

  // Initialize Three.js scene
  useEffect(() => {
    if (!threeContainerRef.current) return;

    // Scene setup
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

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x6d28d9, 1); // Purple light
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);

    // Create floating cubes
    cubesRef.current = [];
    const colors = [0x6d28d9, 0x8b5cf6, 0xa78bfa, 0xc4b5fd]; // Purple palette

    for (let i = 0; i < 40; i++) {
      const size = Math.random() * 0.5 + 0.1;
      const geometry = new THREE.BoxGeometry(size, size, size);

      // Use the color palette
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex];

      const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.7,
        shininess: 100,
      });

      const cube = new THREE.Mesh(geometry, material);

      // Position the cube randomly in a sphere
      const radius = 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      cube.position.x = radius * Math.sin(phi) * Math.cos(theta);
      cube.position.y = radius * Math.sin(phi) * Math.sin(theta);
      cube.position.z = radius * Math.cos(phi);

      // Store original position for animation
      cube.userData.originalPosition = cube.position.clone();

      // Random rotation speed
      cube.userData.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      };

      scene.add(cube);
      cubesRef.current.push(cube);
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      timeRef.current += 0.01;

      // Animate cubes
      cubesRef.current.forEach((cube, i) => {
        // Rotate the cube
        cube.rotation.x += cube.userData.rotationSpeed.x;
        cube.rotation.y += cube.userData.rotationSpeed.y;
        cube.rotation.z += cube.userData.rotationSpeed.z;

        // Subtle position animation - floating effect
        const offset = i * 0.1;
        const amplitude = 0.1;

        cube.position.x =
          cube.userData.originalPosition.x +
          Math.sin(timeRef.current + offset) * amplitude;
        cube.position.y =
          cube.userData.originalPosition.y +
          Math.cos(timeRef.current + offset) * amplitude;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!threeContainerRef.current) return;

      const width = threeContainerRef.current.clientWidth;
      const height = threeContainerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);

      if (threeContainerRef.current && rendererRef.current) {
        threeContainerRef.current.removeChild(rendererRef.current.domElement);
      }

      // Dispose geometries and materials
      cubesRef.current.forEach((cube) => {
        if (cube.geometry) cube.geometry.dispose();
        if (cube.material) cube.material.dispose();
      });
    };
  }, []);

  // View salon details
  const handleViewDetails = (salon) => {
    setSelectedSalon(salon);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
      {/* Three.js Background */}
      <div
        ref={threeContainerRef}
        className="fixed inset-0 -z-10"
        aria-hidden="true"
      />

      {/* Loading Screen */}
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
        {/* SEO Optimized Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 mb-4">
            Quản lý danh sách Salon
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Hệ thống quản trị salon chuyên nghiệp, theo dõi và quản lý tất cả
            các salon của bạn một cách hiệu quả.
          </p>
        </header>

        {/* Search and Filters */}
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

            <button className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              Thêm salon mới
            </button>
          </div>
        </div>

        {/* Salons Display */}
        {viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon) => (
              <div
                key={salon.id}
                className="group bg-gray-800/30 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={salon.image}
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
                      {salon.opening_time} - {salon.closing_time}
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
                    <button className="p-1 text-indigo-400 hover:text-indigo-300">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button className="p-1 text-red-400 hover:text-red-300">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-lg rounded-xl backdrop-blur-lg border border-gray-800/50">
                <table className="min-w-full divide-y divide-gray-800/50">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        Tên salon
                      </th>
                      <th
                        scope="col"
                        className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        Địa chỉ
                      </th>
                      <th
                        scope="col"
                        className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        Giờ mở cửa
                      </th>
                      <th
                        scope="col"
                        className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        Liên hệ
                      </th>
                      <th
                        scope="col"
                        className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
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
                              {salon.opening_time} - {salon.closing_time}
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
                            <button className="text-indigo-400 hover:text-indigo-300">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-400 hover:text-red-300">
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

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Hiển thị <span className="font-medium text-white">1-6</span> của{" "}
            <span className="font-medium text-white">6</span> salon
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

      {/* Salon Detail Modal */}
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
                src={selectedSalon.image}
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
                      {selectedSalon.opening_time} -{" "}
                      {selectedSalon.closing_time}
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
                    <p className="text-white">{selectedSalon.owner_id}</p>
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

              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                    <Settings className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Số dịch vụ</p>
                    <p className="text-white">{selectedSalon.services_count}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                    <Calendar className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Điểm đánh giá</p>
                    <p className="text-white">{selectedSalon.rating}/5</p>
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
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salons;
