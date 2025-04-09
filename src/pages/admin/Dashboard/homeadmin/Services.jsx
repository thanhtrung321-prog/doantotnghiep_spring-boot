import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { NavLink } from "react-router-dom"; // Giả sử bạn dùng react-router-dom cho navigation

const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const threeContainer = useRef(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      const mockCategories = [
        { id: 1, name: "Hair" },
        { id: 2, name: "Nails" },
        { id: 3, name: "Facial" },
        { id: 4, name: "Massage" },
      ];

      const mockServices = [
        {
          id: 1,
          category_id: 1,
          name: "Haircut",
          price: 30,
          duration: 30,
          description: "Professional haircut with styling",
          image: "/api/placeholder/300/200",
          salon_id: 1,
        },
        {
          id: 2,
          category_id: 1,
          name: "Hair Coloring",
          price: 80,
          duration: 90,
          description: "Full hair coloring service",
          image: "/api/placeholder/300/200",
          salon_id: 1,
        },
        {
          id: 3,
          category_id: 2,
          name: "Manicure",
          price: 25,
          duration: 45,
          description: "Basic manicure service",
          image: "/api/placeholder/300/200",
          salon_id: 1,
        },
        {
          id: 4,
          category_id: 2,
          name: "Pedicure",
          price: 35,
          duration: 60,
          description: "Relaxing pedicure treatment",
          image: "/api/placeholder/300/200",
          salon_id: 1,
        },
        {
          id: 5,
          category_id: 3,
          name: "Deep Cleansing",
          price: 45,
          duration: 60,
          description: "Deep facial cleansing treatment",
          image: "/api/placeholder/300/200",
          salon_id: 1,
        },
        {
          id: 6,
          category_id: 4,
          name: "Swedish Massage",
          price: 70,
          duration: 60,
          description: "Relaxing full body massage",
          image: "/api/placeholder/300/200",
          salon_id: 1,
        },
        {
          id: 7,
          category_id: 3,
          name: "Anti-aging Treatment",
          price: 90,
          duration: 75,
          description: "Premium anti-aging facial",
          image: "/api/placeholder/300/200",
          salon_id: 1,
        },
        {
          id: 8,
          category_id: 4,
          name: "Hot Stone Massage",
          price: 85,
          duration: 90,
          description: "Therapeutic hot stone massage",
          image: "/api/placeholder/300/200",
          salon_id: 1,
        },
      ];

      setCategories(mockCategories);
      setServices(mockServices);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!threeContainer.current) return;

    // Set up scene
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

    // Create particles
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
      color: "#FF7E1F", // Orange color
    });

    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    camera.position.z = 2;

    // Mouse effect
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event) => {
      mouseX = event.clientX / window.innerWidth - 0.5;
      mouseY = event.clientY / window.innerHeight - 0.5;
    };

    document.addEventListener("mousemove", handleMouseMove);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.002;
      particlesMesh.rotation.x += 0.001;
      particlesMesh.rotation.x += mouseY * 0.05;
      particlesMesh.rotation.y += mouseX * 0.05;
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / 200;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 200);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      if (threeContainer.current) {
        threeContainer.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Filter services based on category and search term
  const filteredServices = services.filter((service) => {
    const matchesCategory =
      selectedCategory === "all" ||
      service.category_id === parseInt(selectedCategory);
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="relative z-10 bg-gradient-to-b from-black to-transparent pt-8 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-2">
            <span className="text-orange-500">Salon</span> Services Management
          </h1>
          <p className="text-center text-gray-400 mb-8">
            Manage your salon services with style
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search services..."
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
                ></path>
              </svg>
            </div>

            <div className="w-full md:w-1/3">
              <select
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <button className="w-full md:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-all duration-300 font-medium">
              Add New Service
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 rounded-bl-lg font-medium">
                    ${service.price}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <span className="inline-block bg-gray-800 text-orange-500 text-xs px-2 py-1 rounded-full">
                      {getCategoryName(service.category_id)}
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
                        ></path>
                      </svg>
                      {service.duration} minutes
                    </div>
                    <div>ID: {service.id}</div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded transition-colors duration-300">
                      Edit
                    </button>
                    <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded transition-colors duration-300">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
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
              ></path>
            </svg>
            <h3 className="text-xl font-medium mb-1">No services found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Services;
