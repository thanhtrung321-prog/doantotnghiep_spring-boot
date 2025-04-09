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
} from "lucide-react";

const Categories = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Cắt tóc nam",
      salon_id: 101,
      image: "/api/placeholder/300/300",
    },
    {
      id: 2,
      name: "Nhuộm tóc",
      salon_id: 101,
      image: "/api/placeholder/300/300",
    },
    {
      id: 3,
      name: "Uốn tóc",
      salon_id: 102,
      image: "/api/placeholder/300/300",
    },
    {
      id: 4,
      name: "Tạo kiểu tóc",
      salon_id: 103,
      image: "/api/placeholder/300/300",
    },
    {
      id: 5,
      name: "Gội đầu dưỡng sinh",
      salon_id: 102,
      image: "/api/placeholder/300/300",
    },
    {
      id: 6,
      name: "Làm móng",
      salon_id: 103,
      image: "/api/placeholder/300/300",
    },
  ]);

  // Refs for Three.js
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const spheresRef = useRef([]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controlsRef.current = controls;

    // Create spheres with orange material
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

      // Random position
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

    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);

      // Animate spheres
      spheresRef.current.forEach((sphere) => {
        sphere.mesh.position.x += sphere.speed.x;
        sphere.mesh.position.y += sphere.speed.y;
        sphere.mesh.position.z += sphere.speed.z;

        // Bounce off invisible boundaries
        if (Math.abs(sphere.mesh.position.x) > 5) sphere.speed.x *= -1;
        if (Math.abs(sphere.mesh.position.y) > 5) sphere.speed.y *= -1;
        if (Math.abs(sphere.mesh.position.z) > 5) sphere.speed.z *= -1;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Three.js Background */}
      <div ref={mountRef} className="fixed inset-0 -z-10" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* SEO Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-orange-800 mb-3">
            Trang quản trị dịch vụ Salon
          </h1>
          <p className="text-lg text-orange-700 max-w-2xl mx-auto">
            Khám phá các danh mục dịch vụ làm đẹp tốt nhất từ các salon hàng đầu
            Việt Nam
          </p>
        </header>

        {/* Search and Add Section */}
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
            />
          </div>

          <button className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition shadow-sm">
            <PlusCircle className="h-5 w-5 mr-2" />
            Thêm danh mục mới
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105 hover:shadow-lg border border-orange-100"
            >
              <div className="relative h-48 bg-orange-200">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
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
                  <span className="ml-2">{category.salon_id}</span>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    className="p-2 text-orange-600 hover:text-orange-800 transition"
                    aria-label="Chỉnh sửa"
                    title="Chỉnh sửa"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
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

        {/* Pagination */}
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center space-x-2" aria-label="Phân trang">
            <button
              className="p-2 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex space-x-1">
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`px-4 py-2 rounded-md ${
                    page === 1
                      ? "bg-orange-500 text-white"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  } transition`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              className="p-2 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition"
              aria-label="Trang sau"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Categories;
