import { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as THREE from "three";

const Profile = () => {
  const canvasRef = useRef(null);
  const localUser = JSON.parse(localStorage.getItem("user")) || {};
  const [profileData, setProfileData] = useState({
    id: localUser.id || "N/A",
    username: localUser.username || "N/A",
    email: localUser.email || "N/A",
    full_name: localUser.full_name || "N/A",
    phone: localUser.phone || "N/A",
    password: "••••••••",
    role: localUser.role || "N/A",
    created_at: "Đang tải...",
    updated_at: "Đang tải...",
  });

  useEffect(() => {
    if (localUser.id) {
      axios
        .get(`http://localhost:8082/user/${localUser.id}`)
        .then((res) => {
          const data = res.data;
          setProfileData((prev) => ({
            ...prev,
            created_at: data.createdAt,
            updated_at: data.updatedAt,
          }));
        })
        .catch((err) => {
          console.error("Lỗi khi lấy thông tin user:", err);
        });
    }
  }, [localUser.id]);
  // Hàm xử lý nút Copy
  const handleCopy = () => {
    const textToCopy = Object.entries(profileData)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    navigator.clipboard.writeText(textToCopy);
    alert("Đã sao chép thông tin vào clipboard!");
  };

  // Initialize ThreeJS background effect
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;

    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );

    // Material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0x8844ff,
    });

    // Mesh
    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    // Position camera
    camera.position.z = 5;

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Get the first letter of the name for avatar
  const getInitial = () => {
    return profileData.full_name !== "N/A"
      ? profileData.full_name[0].toUpperCase()
      : "A";
  };

  // Generate a rainbow gradient based on name
  const generateGradient = () => {
    const nameHash = profileData.full_name
      .split("")
      .reduce((hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0);

    const hue1 = nameHash % 360;
    const hue2 = (hue1 + 120) % 360;
    const hue3 = (hue1 + 240) % 360;

    return `linear-gradient(135deg, 
      hsl(${hue1}, 80%, 60%), 
      hsl(${hue2}, 80%, 60%), 
      hsl(${hue3}, 80%, 60%))`;
  };

  // Convert key to formatted label
  const formatLabel = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      {/* ThreeJS Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
      />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 bg-opacity-40 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 p-8 lg:p-12 w-full max-w-3xl mx-auto transform transition-all hover:scale-[1.01] hover:shadow-purple-500/20 overflow-hidden relative">
          {/* Animated background glow */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-20 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob animation-delay-4000"></div>

          {/* Content container */}
          <div className="relative z-10">
            {/* Header with profile title */}
            <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-8">
              Thông tin tài khoản
            </h1>

            {/* Profile content */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left column with avatar */}
              <div className="md:w-1/3 flex flex-col items-center">
                <div
                  className="w-36 h-36 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-lg shadow-purple-500/20 mb-4"
                  style={{ background: generateGradient() }}
                >
                  {getInitial()}
                </div>

                <h2 className="text-xl font-semibold text-white text-center mb-2">
                  {profileData.full_name}
                </h2>

                <p className="text-purple-300 text-center mb-6">
                  <span className="text-gray-300 text">Tài khoản:</span>{" "}
                  <span className="text-purple-400 font-semibold text-2xl">
                    {profileData.username}
                  </span>
                </p>

                <button
                  onClick={handleCopy}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 font-medium flex items-center justify-center gap-2"
                  aria-label="Copy Profile Information"
                >
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
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Sao chép
                </button>
              </div>

              {/* Right column with profile details */}
              <div className="md:w-2/3">
                <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-purple-300 mb-4">
                    Account Details
                  </h3>

                  <div className="space-y-4">
                    {Object.entries(profileData).map(
                      ([key, value]) =>
                        key !== "full_name" &&
                        key !== "username" && (
                          <div
                            key={key}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-white border-b border-gray-700 pb-3 group hover:border-purple-400 transition-colors duration-300"
                          >
                            <span className="font-medium text-gray-300 group-hover:text-purple-300 transition-colors duration-300">
                              {formatLabel(key)}:
                            </span>
                            <span className="text-gray-200 mt-1 sm:mt-0">
                              {key === "created_at" || key === "updated_at"
                                ? new Date(value).toLocaleDateString("vi-VN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : value}
                            </span>
                          </div>
                        )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
