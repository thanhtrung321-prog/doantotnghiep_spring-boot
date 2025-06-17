import React, { useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  fetchSalons,
  fetchServicesBySalon,
  fetchCategoriesBySalon,
  getSalonImageUrl,
  getServiceImageUrl,
} from "../../api/tableprice";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AOS from "aos";
import "aos/dist/aos.css";

const TablePrice = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const bookGroupRef = useRef(null);
  const frameId = useRef(null);

  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedService, setSelectedService] = useState(null);
  const [showSalonSelection, setShowSalonSelection] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    AOS.init({ duration: 600, once: true });
    fetchSalons().then((data) => {
      setSalons(Array.isArray(data) ? data : []);
    });
  }, []);

  useEffect(() => {
    if (selectedSalon) {
      fetchServicesBySalon(selectedSalon.id).then((data) => {
        setServices(Array.isArray(data) ? data : []);
      });
      fetchCategoriesBySalon(selectedSalon.id).then((data) => {
        setCategories(Array.isArray(data) ? data : []);
      });
    } else {
      setServices([]);
      setCategories([]);
    }
  }, [selectedSalon]);

  const pages = useMemo(() => {
    if (!selectedSalon) {
      return [
        {
          type: "intro",
          title: "Chào Mừng Đến Với Salon Của Sự Tỏa Sáng",
          content:
            "Vui lòng chọn một salon từ danh sách để khám phá bảng giá dịch vụ và trải nghiệm các dịch vụ làm đẹp chuyên nghiệp!",
        },
      ];
    }

    const servicePages = services.map((service, index) => ({
      type: "service",
      service,
      isEven: index % 2 === 0,
    }));

    return [
      {
        type: "cover",
        title: "BẢNG GIÁ DỊCH VỤ",
        subtitle: selectedSalon.name.toUpperCase(),
        year: "2025",
      },
      {
        type: "intro",
        title: "Chào Mừng Quý Khách",
        content: `Chào mừng đến với ${selectedSalon.name}! Chúng tôi cung cấp các dịch vụ chăm sóc sắc đẹp chuyên nghiệp với đội ngũ nhân viên giàu kinh nghiệm.`,
      },
      ...servicePages,
      {
        type: "contact",
        title: "Liên Hệ Đặt Lịch",
        content: `Liên hệ với ${selectedSalon.name}:`,
        contactInfo: {
          phone: selectedSalon.contact || "Chưa cung cấp",
          address: selectedSalon.address || "Chưa cung cấp",
          hours: `${selectedSalon.openingTime?.slice(0, 5) || "08:00"} - ${
            selectedSalon.closingTime?.slice(0, 5) || "22:00"
          }`,
        },
      },
    ];
  }, [selectedSalon, services]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f4e6);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      isMobile
        ? window.innerWidth / window.innerHeight
        : window.innerWidth / 2 / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 6); // Centered book
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const canvasWidth = isMobile ? window.innerWidth : window.innerWidth / 2;
    renderer.setSize(canvasWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(12, 12, 6);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffd700, 0.6, 100);
    pointLight.position.set(-6, 6, 6);
    scene.add(pointLight);

    let cleanupBook = () => {};

    const updateBook = () => {
      if (bookGroupRef.current) {
        sceneRef.current.remove(bookGroupRef.current);
        bookGroupRef.current = null;
      }
      cleanupBook();
      cleanupBook = createBook();
    };

    updateBook();

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && mountRef.current) {
        const width = isMobile
          ? window.innerWidth
          : mountRef.current.clientWidth || window.innerWidth / 2;
        const height = mountRef.current.clientHeight || window.innerHeight;
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      if (bookGroupRef.current && !isBookOpen) {
        bookGroupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.15;
        if (!isHovered) {
          bookGroupRef.current.rotation.y += 0.004;
        }
      }
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (frameId.current) cancelAnimationFrame(frameId.current);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current.dispose();
      cleanupBook();
    };
  }, [isHovered, selectedSalon, isMobile]);

  const createBook = () => {
    const bookGroup = new THREE.Group();
    bookGroupRef.current = bookGroup;

    const bookWidth = 3.0;
    const bookHeight = 3.8;
    const bookDepth = 0.48;

    const coverGeometry = new THREE.BoxGeometry(bookWidth, bookHeight, 0.05);
    const coverMaterial = new THREE.MeshPhongMaterial({
      color: 0xd4a574,
      shininess: 50,
    });

    const frontCover = new THREE.Mesh(coverGeometry, coverMaterial);
    frontCover.position.z = bookDepth / 2;
    frontCover.castShadow = true;
    frontCover.receiveShadow = true;
    bookGroup.add(frontCover);

    const backCover = new THREE.Mesh(coverGeometry, coverMaterial);
    backCover.position.z = -bookDepth / 2;
    bookGroup.add(backCover);

    const spineGeometry = new THREE.BoxGeometry(0.05, bookHeight, bookDepth);
    const spineMaterial = new THREE.MeshPhongMaterial({
      color: 0xb8935a,
      shininess: 50,
    });
    const spine = new THREE.Mesh(spineGeometry, spineMaterial);
    spine.position.x = -bookWidth / 2;
    bookGroup.add(spine);

    const pageGeometry = new THREE.BoxGeometry(
      bookWidth - 0.1,
      bookHeight - 0.1,
      bookDepth - 0.1
    );
    const pageMaterial = new THREE.MeshPhongMaterial({
      color: 0xfaf7f0,
      shininess: 20,
    });
    const pagesMesh = new THREE.Mesh(pageGeometry, pageMaterial);
    bookGroup.add(pagesMesh);

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 512;
    canvas.height = 512;

    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, "#d4a574");
    gradient.addColorStop(1, "#b8935a");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);

    context.strokeStyle = "#8b6914";
    context.lineWidth = 10;
    context.strokeRect(20, 20, 472, 472);

    context.fillStyle = "#ffffff";
    context.font = "bold 48px Arial";
    context.textAlign = "center";
    context.fillText("BẢNG GIÁ", 256, 180);
    context.fillText("DỊCH VỤ", 256, 230);
    context.font = "32px Arial";
    context.fillText(selectedSalon?.name.toUpperCase() || "SALON", 256, 300);
    context.font = "28px Arial";
    context.fillText("2025", 256, 380);

    const texture = new THREE.CanvasTexture(canvas);
    const titleMaterial = new THREE.MeshPhongMaterial({ map: texture });
    const titleGeometry = new THREE.PlaneGeometry(
      bookWidth - 0.1,
      bookHeight - 0.1
    );
    const titlePlane = new THREE.Mesh(titleGeometry, titleMaterial);
    titlePlane.position.z = bookDepth / 2 + 0.026;
    bookGroup.add(titlePlane);

    bookGroup.position.set(0, 0, 0); // Centered
    bookGroup.scale.set(1.2, 1.2, 1.2);
    sceneRef.current.add(bookGroup);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event) => {
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(bookGroup.children, true);
      if (intersects.length > 0) {
        if (isMobile && !selectedSalon) {
          setShowSalonSelection(true);
        } else if (selectedSalon) {
          setIsBookOpen(true);
        }
      }
    };

    const handleMouseMove = (event) => {
      if (!isBookOpen && selectedSalon) {
        const rect = rendererRef.current.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.intersectObjects(bookGroup.children, true);
        setIsHovered(intersects.length > 0);
        if (intersects.length > 0) {
          setMousePosition({ x: event.clientX, y: event.clientY });
          const rotationX = mouse.y * 0.2;
          const rotationY = mouse.x * 0.2;
          bookGroup.rotation.x = rotationX;
          bookGroup.rotation.y = rotationY;
          rendererRef.current.domElement.style.cursor = "pointer";
        } else {
          bookGroup.rotation.x *= 0.95;
          bookGroup.rotation.y *= 0.95;
          rendererRef.current.domElement.style.cursor = "default";
        }
      }
    };

    rendererRef.current.domElement.addEventListener("click", handleClick);
    rendererRef.current.domElement.addEventListener(
      "mousemove",
      handleMouseMove
    );

    return () => {
      rendererRef.current.domElement.removeEventListener("click", handleClick);
      rendererRef.current.domElement.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const closeBook = () => {
    setIsBookOpen(false);
    setCurrentPage(0);
  };

  const parseService = (service) => {
    const names = service.name.split("|").filter((name) => name.trim());
    const descriptions = service.description
      .split("|")
      .filter((desc) => desc.trim());
    const images = service.image.split("|").filter((img) => img.trim());

    const cover = {
      name: names[0] || "Dịch vụ không xác định",
      description: descriptions[0] || "Không có mô tả",
      image: images[0]
        ? getServiceImageUrl(images[0])
        : "/api/placeholder/300/200",
    };

    const steps = names.slice(1).map((name, index) => ({
      name: name || `Bước ${index + 1}`,
      description: descriptions[index + 1] || "Không có mô tả",
      image: images[index + 1]
        ? getServiceImageUrl(images[index + 1])
        : "/api/placeholder/300/200",
    }));

    return { cover, steps };
  };

  const selectServiceAndRedirect = async (service) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not logged in");

      const serviceId = service.originalId || service.id;
      const selectedServices = [serviceId.toString()];
      Cookies.set("selectedServices", JSON.stringify(selectedServices), {
        expires: 1,
      });

      window.location.href = "http://localhost:5173/booking";
    } catch (error) {
      toast.error("Lỗi khi chọn dịch vụ: " + error.message);
    }
  };

  const renderPage = (page) => {
    switch (page.type) {
      case "cover":
        return (
          <div className="h-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white flex flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="relative z-10 text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-wide drop-shadow-lg">
                {page.title}
              </h1>
              <div className="w-40 h-1 bg-amber-300 mx-auto mb-6"></div>
              <h2 className="text-lg sm:text-xl font-light mb-8 tracking-widest">
                {page.subtitle}
              </h2>
              <div className="text-base sm:text-lg font-medium bg-amber-800 bg-opacity-60 px-8 py-3 rounded-full backdrop-blur-sm">
                {page.year}
              </div>
            </div>
          </div>
        );

      case "intro":
        return (
          <div className="h-full bg-gradient-to-br from-amber-50 to-amber-100 p-8 flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-800 mb-6 text-center">
              {page.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-center">
              {page.content}
            </p>
          </div>
        );

      case "service":
        const { cover } = parseService(page.service);
        const category = categories.find(
          (cat) => cat.id === page.service.categoryId
        );
        return (
          <div
            className={`h-full ${
              page.isEven
                ? "bg-gradient-to-br from-amber-50 to-white"
                : "bg-gradient-to-br from-white to-amber-50"
            } p-8 flex flex-col justify-center`}
          >
            <div className="max-w-md mx-auto text-center">
              <img
                src={cover.image}
                alt={cover.name}
                className="w-24 h-24 object-cover rounded-lg mx-auto mb-4 border-2 border-amber-300 shadow-md"
                onError={(e) => {
                  e.target.src = "/api/placeholder/100/100";
                }}
              />
              <h2 className="text-xl sm:text-2xl font-extrabold text-amber-800 mb-4">
                {cover.name}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                {cover.description}
              </p>
              <p className="text-amber-600 font-bold text-sm sm:text-base mb-4">
                Giá: {(page.service.price || 0).toLocaleString("vi-VN")} VND
                {page.service.duration &&
                  ` | Thời gian: ${page.service.duration} phút`}
              </p>
              {category && (
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  Danh mục: {category.name}
                </p>
              )}
              <button
                onClick={() => setSelectedService(page.service)}
                className="mt-6 w-full py-2 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-300 text-sm sm:text-base"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="h-full bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 text-white p-8 flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center drop-shadow-lg">
              {page.title}
            </h2>
            <div className="max-w-md mx-auto space-y-4">
              <p className="text-sm sm:text-base text-center opacity-90">
                {page.content}
              </p>
              <div className="space-y-4">
                <div className="bg-amber-600 bg-opacity-60 rounded-lg p-4 backdrop-blur-sm">
                  <div className="font-semibold text-sm sm:text-base">
                    📞 Điện thoại
                  </div>
                  <div className="opacity-90 text-sm sm:text-base">
                    {page.contactInfo.phone}
                  </div>
                </div>
                <div className="bg-amber-600 bg-opacity-60 rounded-lg p-4 backdrop-blur-sm">
                  <div className="font-semibold text-sm sm:text-base">
                    📍 Địa chỉ
                  </div>
                  <div className="opacity-90 text-sm sm:text-base">
                    {page.contactInfo.address}
                  </div>
                </div>
                <div className="bg-amber-600 bg-opacity-60 rounded-lg p-4 backdrop-blur-sm">
                  <div className="font-semibold text-sm sm:text-base">
                    🕐 Giờ mở cửa
                  </div>
                  <div className="opacity-90 text-sm sm:text-base">
                    {page.contactInfo.hours}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex bg-gray-50 font-sans pt-[120px]">
      <ToastContainer />
      <div
        className={`relative pointer-events-auto z-10 ${
          isMobile ? "w-full" : "w-1/2"
        }`}
      >
        <div
          ref={mountRef}
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #fef3c7 0%, #fcd34d 50%, #f59e0b 100%)",
          }}
        />
        {isHovered && !isBookOpen && selectedSalon && (
          <div
            className="fixed pointer-events-none z-50 bg-amber-800 bg-opacity-80 text-white px-4 py-2 rounded-lg text-sm transition-all duration-300 shadow-lg"
            style={{
              left: mousePosition.x + 15,
              top: mousePosition.y - 50,
              transform: "translateX(-50%)",
            }}
          >
            Nhấn để xem bảng giá 📖
          </div>
        )}
        {isBookOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50"
            data-aos="zoom-in"
          >
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
              <button
                onClick={closeBook}
                className="absolute top-4 right-4 z-50 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xl font-bold transition-colors shadow-md"
              >
                ×
              </button>
              <div className="w-full h-[28rem]">
                {renderPage(pages[currentPage])}
              </div>
              <div className="bg-gray-100 p-6 flex justify-between items-center">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                    currentPage === 0
                      ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                      : "bg-gray-700 hover:bg-gray-800 text-white"
                  }`}
                >
                  ← Trước
                </button>
                <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
                  {currentPage + 1} / {pages.length}
                </div>
                <button
                  onClick={nextPage}
                  disabled={currentPage === pages.length - 1}
                  className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                    currentPage === pages.length - 1
                      ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                      : "bg-gray-700 hover:bg-gray-800 text-white"
                  }`}
                >
                  Sau →
                </button>
              </div>
            </div>
          </div>
        )}
        {selectedService && (
          <div
            className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50"
            data-aos="fade-up"
          >
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full mx-4 p-6 sm:p-8 max-h-[90vh] flex flex-col overflow-hidden">
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 z-50 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xl font-bold transition-colors shadow-md"
              >
                ×
              </button>
              <div className="flex-1 overflow-y-auto">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-amber-800 text-center mb-6 sm:mb-8">
                  Chi Tiết Dịch Vụ
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {parseService(selectedService).steps.map((step, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
                    >
                      <h3 className="text-lg sm:text-xl font-semibold text-amber-700 mb-3 sm:mb-4">
                        Bước {index + 1}: {step.name}
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base mb-3 sm:mb-4 flex-1">
                        {step.description}
                      </p>
                      <img
                        src={step.image}
                        alt={step.name}
                        className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-sm"
                        onError={(e) => {
                          e.target.src = "/api/placeholder/300/200";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 sm:mt-8 space-y-4">
                <button
                  onClick={() => selectServiceAndRedirect(selectedService)}
                  className="w-full py-2 sm:py-3 px-4 sm:px-6 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-300 flex items-center justify-center gap-2 text-base sm:text-lg font-semibold"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Đặt Lịch
                </button>
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-full py-2 sm:py-3 px-4 sm:px-6 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-300 text-base sm:text-lg font-semibold"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
        {isMobile && showSalonSelection && !selectedSalon && (
          <div
            className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50"
            data-aos="fade-up"
          >
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-6 sm:p-8 overflow-y-auto">
              <button
                onClick={() => setShowSalonSelection(false)}
                className="absolute top-4 right-4 z-50 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xl font-bold transition-colors shadow-md"
              >
                ×
              </button>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                Chọn Salon
              </h3>
              <select
                className="w-full p-3 mb-6 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                onChange={(e) => {
                  const salon = salons.find(
                    (s) => s.id === parseInt(e.target.value)
                  );
                  setSelectedSalon(salon);
                  setShowSalonSelection(false);
                  setCurrentPage(0);
                }}
              >
                <option value="">Chọn salon...</option>
                {salons.map((salon) => (
                  <option key={salon.id} value={salon.id}>
                    {salon.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {!isMobile && (
        <div className="w-1/2 bg-white bg-opacity-95 backdrop-blur-lg p-6 sm:p-8 overflow-y-auto shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 sm:mb-6">
            Chọn Salon
          </h3>
          <select
            className="w-full p-3 sm:p-4 mb-6 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm sm:text-base"
            onChange={(e) => {
              const salon = salons.find(
                (s) => s.id === parseInt(e.target.value)
              );
              setSelectedSalon(salon);
              setCurrentPage(0);
              setIsBookOpen(false);
            }}
          >
            <option value="">Chọn salon...</option>
            {salons.map((salon) => (
              <option key={salon.id} value={salon.id}>
                {salon.name}
              </option>
            ))}
          </select>

          {selectedSalon ? (
            <div className="space-y-6 sm:space-y-8">
              <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory">
                {selectedSalon.images.map((image, index) => (
                  <div key={index} className="snap-center flex-shrink-0 w-64">
                    <img
                      src={getSalonImageUrl(image)}
                      alt={`${selectedSalon.name} - Hình ${index + 1}`}
                      className="w-full h-48 object-cover rounded-xl shadow-md"
                      onError={() =>
                        console.error(`Failed to load salon image: ${image}`)
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {selectedSalon.name}
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">
                  <strong className="text-gray-800">Địa chỉ:</strong>{" "}
                  {selectedSalon.address}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  <strong className="text-gray-800">Liên hệ:</strong>{" "}
                  {selectedSalon.contact}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  <strong className="text-gray-800">Email:</strong>{" "}
                  {selectedSalon.email}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  <strong className="text-gray-800">Thành phố:</strong>{" "}
                  {selectedSalon.city}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  <strong className="text-gray-800">Giờ mở cửa:</strong>{" "}
                  {selectedSalon.openingTime.slice(0, 5)} -{" "}
                  {selectedSalon.closingTime.slice(0, 5)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 sm:space-y-8">
              <h4 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Khám Phá Salon Của Bạn
              </h4>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                Vui lòng chọn một salon từ danh sách để xem thông tin chi tiết
                và bảng giá dịch vụ. Chúng tôi cam kết mang đến trải nghiệm làm
                đẹp tuyệt vời với không gian sang trọng và dịch vụ chuyên
                nghiệp.
              </p>
              <div className="mt-6">
                <p className="text-amber-600 font-semibold text-base sm:text-lg">
                  Hãy bắt đầu hành trình làm đẹp của bạn ngay hôm nay!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TablePrice;
