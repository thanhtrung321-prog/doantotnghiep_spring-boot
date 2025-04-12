import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import {
  getCategoriesBySalon,
  getSalons,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/apiadmin/categorymanager";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    salonId: "",
    image: "", // Stores the filename (e.g., "image.jpg")
  });
  const [imagePreview, setImagePreview] = useState(null); // Stores the temporary URL for preview
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const itemsPerPage = 6;

  // Three.js refs
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const spheresRef = useRef([]);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controlsRef.current = controls;

    spheresRef.current = [];
    for (let i = 0; i < 10; i++) {
      const geometry = new THREE.SphereGeometry(0.2, 32, 32);
      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#FF9800"),
        metalness: 0.2,
        roughness: 0.5,
        reflectivity: 0.5,
        clearcoat: 0.3,
      });
      const sphere = new THREE.Mesh(geometry, material);

      sphere.position.x = (Math.random() - 0.5) * 10;
      sphere.position.y = (Math.random() - 0.5) * 10;
      sphere.position.z = (Math.random() - 0.5) * 10;

      scene.add(sphere);
      spheresRef.current.push({
        mesh: sphere,
        speed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01,
        },
      });
    }

    const animate = () => {
      requestAnimationFrame(animate);

      spheresRef.current.forEach((sphere) => {
        sphere.mesh.position.x += sphere.speed.x;
        sphere.mesh.position.y += sphere.speed.y;
        sphere.mesh.position.z += sphere.speed.z;

        if (Math.abs(sphere.mesh.position.x) > 5) sphere.speed.x *= -1;
        if (Math.abs(sphere.mesh.position.y) > 5) sphere.speed.y *= -1;
        if (Math.abs(sphere.mesh.position.z) > 5) sphere.speed.z *= -1;
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
    };
  }, []);

  // Fetch salons
  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const salonData = await getSalons();
        setSalons(salonData);
        if (salonData.length > 0) {
          setSelectedSalon(salonData[0].id.toString());
          setFormData((prev) => ({
            ...prev,
            salonId: salonData[0].id.toString(),
          }));
        }
      } catch (error) {
        setError("Failed to fetch salons");
      }
    };
    fetchSalons();
  }, []);

  // Fetch categories when selectedSalon changes
  useEffect(() => {
    const fetchCategories = async () => {
      if (selectedSalon) {
        try {
          const categoryData = await getCategoriesBySalon(selectedSalon);
          setCategories(categoryData);
        } catch (error) {
          setError("Failed to fetch categories");
        }
      }
    };
    fetchCategories();
  }, [selectedSalon]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const categoryData = {
        name: formData.name,
        image: formData.image || null, // Send null if no image is selected
      };

      if (currentCategory) {
        // Update category
        await updateCategory(
          formData.salonId,
          currentCategory.id,
          categoryData
        );
      } else {
        // Create category
        await createCategory(formData.salonId, categoryData);
      }

      setIsModalOpen(false);
      setFormData({ name: "", salonId: selectedSalon, image: "" });
      setImagePreview(null);
      setCurrentCategory(null);

      const updatedCategories = await getCategoriesBySalon(selectedSalon);
      setCategories(updatedCategories);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save category");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(selectedSalon, id);
        setCategories(categories.filter((cat) => cat.id !== id));
      } catch (error) {
        setError("Failed to delete category");
      }
    }
  };

  // Handle edit
  const handleEdit = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      salonId: category.salonId?.toString() || selectedSalon,
      image: category.image || "",
    });
    // For edit, show the existing image if available (requires backend URL)
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
      // Generate a temporary URL for preview
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

  // Handle search
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div ref={mountRef} className="fixed inset-0 -z-10" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-orange-800 mb-3">
            Trang quản trị dịch vụ Salon
          </h1>
          <p className="text-lg text-orange-700 max-w-2xl mx-auto">
            Khám phá các danh mục dịch vụ làm đẹp tốt nhất từ các salon hàng đầu
            Việt Nam
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

          <div className="flex gap-4">
            <select
              className="px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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

            <button
              onClick={() => {
                setCurrentCategory(null);
                setFormData({ name: "", salonId: selectedSalon, image: "" });
                setImagePreview(null);
                setIsModalOpen(true);
              }}
              disabled={!selectedSalon}
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition shadow-sm disabled:opacity-50"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Thêm danh mục mới
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105 hover:shadow-lg border border-orange-100"
            >
              <div className="relative h-48 bg-orange-200">
                <img
                  src={
                    category.image
                      ? `http://localhost:8086/category-images/${category.image}`
                      : "/api/placeholder/300/300"
                  }
                  alt={category.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => (e.target.src = "/api/placeholder/300/300")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/60 to-transparent flex items-end">
                  <div className="p-4 w-full">
                    <h2 className="text-xl font-semibold text-white">
                      {category.name}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center text-orange-700 mb-2">
                  <span className="font-medium">ID:</span>
                  <span className="ml-2">{category.id}</span>
                </div>
                <div className="flex items-center text-orange-700">
                  <span className="font-medium">Salon ID:</span>
                  <span className="ml-2">{category.salonId}</span>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-orange-600 hover:text-orange-800 transition"
                    aria-label="Chỉnh sửa"
                    title="Chỉnh sửa"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-red-600 hover:text-red-800 transition"
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

        <div className="mt-12 flex justify-center">
          <nav className="flex items-center space-x-2" aria-label="Phân trang">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition disabled:opacity-50"
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
                    } transition`}
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
              className="p-2 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition disabled:opacity-50"
              aria-label="Trang sau"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-orange-800">
                {currentCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setError("");
                  setImagePreview(null);
                }}
                className="text-orange-600 hover:text-orange-800 transition"
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
                  Salon
                </label>
                <select
                  value={formData.salonId}
                  onChange={(e) =>
                    setFormData({ ...formData, salonId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition shadow-sm"
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
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
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
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition shadow-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition shadow-sm"
                >
                  {currentCategory ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
