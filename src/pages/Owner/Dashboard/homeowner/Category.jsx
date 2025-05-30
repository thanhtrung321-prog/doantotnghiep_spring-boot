import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  Search,
  PlusCircle,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  LayoutGrid,
  List,
} from "lucide-react";
import { gsap } from "gsap";
import {
  getCategoriesBySalon,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categoryowner";

// Lazy load components
const SalonLoadingScreen = lazy(() =>
  import("../../Dashboard/homeowner/Loadingowner")
);

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [salonId, setSalonId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    salonId: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 6;

  // Refs
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const spheresRef = useRef([]);
  const deleteModalRef = useRef(null);
  const createEditModalRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef([]);
  const paginationRef = useRef(null);

  // Handle search and pagination
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Control loading screen for 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Matches Loadingowner's 1.5s duration
    return () => clearTimeout(timer);
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDampingthirteenthPersonView;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controlsRef.current = controls;

    spheresRef.current = [];
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.SphereGeometry(0.2, 32, 32);
      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#FF9800"),
        metalness: 0.2,
        roughness: 0.5,
        reflectivity: 0.5,
        clearcoat: 0.3,
      });
      const sphere = new THREE.Mesh(geometry, material);

      sphere.position.x = (Math.random() - 0.5) * 8;
      sphere.position.y = (Math.random() - 0.5) * 8;
      sphere.position.z = (Math.random() - 0.5) * 8;

      scene.add(sphere);
      spheresRef.current.push({
        mesh: sphere,
        speed: {
          x: (Math.random() - 0.5) * 0.008,
          y: (Math.random() - 0.5) * 0.008,
          z: (Math.random() - 0.5) * 0.008,
        },
      });
    }

    const animate = () => {
      requestAnimationFrame(animate);

      spheresRef.current.forEach((sphere) => {
        sphere.mesh.position.x += sphere.speed.x;
        sphere.mesh.position.y += sphere.speed.y;
        sphere.mesh.position.z += sphere.speed.z;

        if (Math.abs(sphere.mesh.position.x) > 4) sphere.speed.x *= -1;
        if (Math.abs(sphere.mesh.position.y) > 4) sphere.speed.y *= -1;
        if (Math.abs(sphere.mesh.position.z) > 4) sphere.speed.z *= -1;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  // GSAP animations for header, cards, and pagination
  useEffect(() => {
    if (!isLoading) {
      // Header animation
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -50 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
      }

      // Card animations with scroll trigger
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: index * 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 80%",
                toggleActions: "play none none none",
              },
            }
          );
        }
      });

      // Pagination animation
      if (paginationRef.current) {
        gsap.fromTo(
          paginationRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: paginationRef.current,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }
  }, [isLoading, paginatedCategories]);

  // Animate modals with GSAP
  useEffect(() => {
    if (isModalOpen && createEditModalRef.current) {
      gsap.fromTo(
        createEditModalRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isDeleteModalOpen && deleteModalRef.current) {
      gsap.fromTo(
        deleteModalRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [isDeleteModalOpen]);

  // Enhanced GSAP text animation for delete modal
  useEffect(() => {
    if (isDeleteModalOpen) {
      const letters = document.querySelectorAll(".rgb-text .letter");
      gsap.fromTo(
        letters,
        { opacity: 0, y: 10, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.05,
          duration: 0.4,
          ease: "back.out(1.7)",
        }
      );
      let hue = 0;
      const interval = setInterval(() => {
        hue = (hue + 1) % 360;
        letters.forEach((letter, index) => {
          const offsetHue = (hue + index * 15) % 360;
          letter.style.color = `hsl(${offsetHue}, 100%, 50%)`;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isDeleteModalOpen]);

  // Fetch salonId from localStorage and set formData
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          throw new Error(
            "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
          );
        }
        const user = JSON.parse(storedUser);
        if (user.role !== "OWNER" || !user.salonId) {
          throw new Error(
            "Người dùng không phải chủ salon hoặc thiếu salonId."
          );
        }
        setSalonId(user.salonId);
        setFormData((prev) => ({
          ...prev,
          salonId: user.salonId.toString(),
        }));
      } catch (error) {
        setError(error.message || "Không thể tải thông tin salon");
      }
    };
    fetchUserData();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (salonId) {
        try {
          const categoryData = await getCategoriesBySalon(salonId);
          setCategories(categoryData);
          setCurrentPage(1);
        } catch (error) {
          setError("Không thể tải danh mục");
        }
      }
    };
    fetchCategories();
  }, [salonId]);

  // Update card refs for GSAP animations
  useEffect(() => {
    cardsRef.current = cardsRef.current.slice(0, paginatedCategories.length);
  }, [paginatedCategories]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const categoryData = {
        name: formData.name,
        image: formData.image || null,
      };

      if (currentCategory) {
        await updateCategory(salonId, currentCategory.id, categoryData);
      } else {
        await createCategory(salonId, categoryData);
      }

      setIsModalOpen(false);
      setFormData({ name: "", salonId: salonId.toString(), image: "" });
      setImagePreview(null);
      setCurrentCategory(null);

      const updatedCategories = await getCategoriesBySalon(salonId);
      setCategories(updatedCategories);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể lưu danh mục");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteCategory(salonId, categoryToDelete.id);
      setCategories(categories.filter((cat) => cat.id !== categoryToDelete.id));
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      setError("Không thể xóa danh mục");
    }
  };

  // Open delete modal
  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  // Handle edit
  const handleEdit = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      salonId: salonId.toString(),
      image: category.image || "",
    });
    setImagePreview(
      category.image
        ? `http://localhost:8086/category-images/${category.image}`
        : null
    );
    setIsModalOpen(true);
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file.name });
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, image: "" });
      setImagePreview(null);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" });
    setImagePreview(null);
  };

  return (
    <Suspense fallback={<SalonLoadingScreen />}>
      {isLoading ? (
        <SalonLoadingScreen />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
          <div
            ref={mountRef}
            className="fixed inset-0 -z-10"
            aria-hidden="true"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <style>
              {`
              .card {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
              }
              .card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
              }
              .modal {
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
              }
              .button {
                transition: background-color 0.2s ease, transform 0.2s ease;
              }
              .button:hover {
                transform: scale(1.05);
              }
            `}
            </style>

            <header ref={headerRef} className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-orange-800 mb-3">
                Quản lý danh mục dịch vụ
              </h1>
              <p className="text-lg text-orange-700 max-w-2xl mx-auto">
                Quản lý các danh mục dịch vụ làm đẹp của salon bạn
              </p>
            </header>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div className="w-full md:w-96 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-orange-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm danh mục..."
                  className="pl-10 pr-4 py-2 w-full border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                  aria-label="Tìm kiếm danh mục"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-4 items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg ${
                      viewMode === "grid"
                        ? "bg-orange-500 text-white"
                        : "bg-orange-100 text-orange-700"
                    } button`}
                    title="Chế độ lưới"
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg ${
                      viewMode === "list"
                        ? "bg-orange-500 text-white"
                        : "bg-orange-100 text-orange-700"
                    } button`}
                    title="Chế độ danh sách"
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setCurrentCategory(null);
                    setFormData({
                      name: "",
                      salonId: salonId?.toString() || "",
                      image: "",
                    });
                    setImagePreview(null);
                    setIsModalOpen(true);
                  }}
                  disabled={!salonId}
                  className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 button disabled:opacity-50"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Thêm danh mục mới
                </button>
              </div>
            </div>

            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "flex flex-col gap-4"
              }
            >
              {paginatedCategories.map((category, index) => (
                <div
                  key={category.id}
                  ref={(el) => (cardsRef.current[index] = el)}
                  className={`card bg-white rounded-xl shadow-md overflow-hidden border border-orange-100 ${
                    viewMode === "list" ? "flex" : ""
                  }`}
                >
                  <div
                    className={`relative ${
                      viewMode === "grid" ? "h-48" : "w-48 h-32"
                    } bg-orange-200`}
                  >
                    <img
                      src={
                        category.image
                          ? `http://localhost:8086/category-images/${category.image}`
                          : "/api/placeholder/300/300"
                      }
                      alt={category.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) =>
                        (e.target.src = "/api/placeholder/300/300")
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-900/60 to-transparent flex items-end">
                      <div className="p-4 w-full">
                        <h2 className="text-xl font-semibold text-white">
                          {category.name}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 ${
                      viewMode === "list"
                        ? "flex-1 flex justify-between items-center"
                        : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-center text-orange-700 mb-2">
                        <span className="font-medium">ID:</span>
                        <span className="ml-2">{category.id}</span>
                      </div>
                      <div className="flex items-center text-orange-700">
                        <span className="font-medium">Salon ID:</span>
                        <span className="ml-2">{category.salonId}</span>
                      </div>
                    </div>

                    <div
                      className={`flex space-x-2 ${
                        viewMode === "list" ? "" : "mt-4 justify-end"
                      }`}
                    >
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-orange-600 hover:text-orange-800 button"
                        aria-label="Chỉnh sửa"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(category)}
                        className="p-2 text-red-600 hover:text-red-800 button"
                        aria-label="Xóa"
                        title="Xóa"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {paginatedCategories.length === 0 && (
              <div className="text-center text-orange-700 mt-8">
                Không tìm thấy danh mục nào.
              </div>
            )}

            <div ref={paginationRef} className="mt-12 flex justify-center">
              <nav
                className="flex items-center space-x-2"
                aria-label="Phân trang"
              >
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 button disabled:opacity-50"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-md ${
                          page === currentPage
                            ? "bg-orange-500 text-white"
                            : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                        } button`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 button disabled:opacity-50"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>

          {/* Create/Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div
                ref={createEditModalRef}
                className="modal bg-white rounded-xl p-6 w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-orange-800">
                    {currentCategory
                      ? "Chỉnh sửa danh mục"
                      : "Thêm danh mục mới"}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setError("");
                      setImagePreview(null);
                    }}
                    className="text-orange-600 hover:text-orange-800 button"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-orange-700 font-medium mb-2">
                      Tên danh mục
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition shadow-sm"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-orange-700 font-medium mb-2">
                      Hình ảnh
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border border-orange-200 rounded-lg text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition shadow-sm"
                    />
                    {formData.image && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg shadow-md border border-orange-100"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 button"
                            title="Xóa hình ảnh"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-orange-600">
                          Đã chọn: {formData.image}
                        </p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setError("");
                        setImagePreview(null);
                      }}
                      className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 button"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 button"
                    >
                      {currentCategory ? "Cập nhật" : "Thêm"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && categoryToDelete && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div
                ref={deleteModalRef}
                className="modal bg-white rounded-xl p-6 w-full max-w-sm"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-orange-800 rgb-text">
                    {`Xác nhận xóa danh mục`.split("").map((letter, index) => (
                      <span key={index} className="letter inline-block">
                        {letter === " " ? "\u00A0" : letter}
                      </span>
                    ))}
                  </h2>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="text-orange-600 hover:text-orange-800 button"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <p className="text-orange-700 mb-6">
                  Bạn có chắc muốn xóa danh mục{" "}
                  <span className="font-semibold">{categoryToDelete.name}</span>
                  ? Hành động này không thể hoàn tác.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 button"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 button"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Suspense>
  );
};

export default Categories;
