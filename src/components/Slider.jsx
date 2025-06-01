import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Sparkles,
  Scissors,
  Palette,
  X,
  MapPin,
  Clock,
  Calendar,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import SlickSlider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  fetchSalons,
  fetchSalonDetails,
  fetchServices,
  fetchServiceOfferings,
} from "../api/slider";

gsap.registerPlugin(SplitText);

const Slider = ({ className = "" }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceOfferings, setServiceOfferings] = useState([]);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [salons, setSalons] = useState([]);
  const [selectedSalonId, setSelectedSalonId] = useState("");

  const sliderRef = useRef(null);
  const textRefs = useRef([]);
  const modalRef = useRef(null);
  const modalTitleRef = useRef(null);
  const navigate = useNavigate();

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-out", once: true });
  }, []);

  // Loading progress simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Fetch salons on mount
  useEffect(() => {
    const loadSalons = async () => {
      try {
        const salonsData = await fetchSalons();
        setSalons(salonsData);
        if (salonsData.length > 0) {
          setSelectedSalonId(salonsData[0].id.toString());
        }
      } catch (error) {
        console.error("Error fetching salons:", error);
      }
    };
    loadSalons();
  }, []);

  // Fetch data for selected salon
  useEffect(() => {
    if (!selectedSalonId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [salonData, servicesData, offeringsData] = await Promise.all([
          fetchSalonDetails(selectedSalonId),
          fetchServices(selectedSalonId),
          fetchServiceOfferings(selectedSalonId),
        ]);
        setSalon(salonData);
        setServices(servicesData);
        setServiceOfferings(offeringsData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        toast.error("Không thể tải dữ liệu!");
      } finally {
        setTimeout(() => setIsLoading(false), 1200);
      }
    };
    loadData();
  }, [selectedSalonId]);

  // Preload images
  useEffect(() => {
    salon?.images?.forEach((img) => {
      const image = new Image();
      image.src = img;
    });
    services.forEach((service) => {
      const image = new Image();
      image.src = service.image;
    });
    serviceOfferings.forEach((offering) => {
      offering.images?.forEach((img) => {
        const image = new Image();
        image.src = img;
      });
    });
  }, [salon, services, serviceOfferings]);

  // Rotate background images
  useEffect(() => {
    if (salon?.images?.length > 1) {
      const timer = setInterval(() => {
        setCurrentBackgroundIndex((prev) => (prev + 1) % salon.images.length);
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [salon]);

  // GSAP text animations
  useEffect(() => {
    textRefs.current.forEach((ref, index) => {
      if (ref && !isLoading) {
        gsap.fromTo(
          ref,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            delay: index * 0.1,
          }
        );
        gsap.to(ref, {
          backgroundImage: "linear-gradient(45deg, #F472B6, #60A5FA, #FBBF24)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    });
  }, [isLoading]);

  // Modal title karaoke animation
  useEffect(() => {
    if (isModalOpen && modalTitleRef.current && selectedOffering) {
      const split = new SplitText(modalTitleRef.current, { type: "chars" });
      gsap.fromTo(
        split.chars,
        { opacity: 0, y: 10, color: "#ffffff" },
        {
          opacity: 1,
          y: 0,
          color: gsap.utils.interpolate(["#F472B6", "#60A5FA", "#FBBF24"]),
          duration: 0.4,
          stagger: 0.03,
          ease: "power2.out",
        }
      );
    }
  }, [isModalOpen]);

  // Modal animation
  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.5)" }
      );
    }
  }, [isModalOpen]);

  const handleServiceClick = useCallback((service) => {
    setSelectedService((prev) => (prev?.id === service.id ? null : service));
    toast.info(`Đã chọn dịch vụ: ${service.name}`, {
      style: { background: "#1a1a1a", color: "#fff" },
    });
  }, []);

  const handleOfferingDetail = useCallback((offering) => {
    setSelectedOffering(offering);
    setIsModalOpen(true);
  }, []);

  const handleBookService = useCallback(
    (serviceOrOffering) => {
      const bookingData = [
        {
          id: serviceOrOffering.id,
          name: serviceOrOffering.name.split("|")[0],
          price: serviceOrOffering.price || null,
          duration: serviceOrOffering.duration || null,
        },
      ];
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Vui lòng đăng nhập!");
        navigate("/login");
        return;
      }
      navigate("/booking", {
        state: { userId, salonId: selectedSalonId, services: bookingData },
      });
      toast.success("Đang chuyển đến trang đặt lịch...");
    },
    [navigate, selectedSalonId]
  );

  const handleToggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
        toast.info("Đã xóa khỏi yêu thích");
      } else {
        newFavorites.add(id);
        toast.success("Đã thêm vào yêu thích");
      }
      return newFavorites;
    });
  }, []);

  const handleShare = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const filteredOfferings = useMemo(() => {
    if (!selectedService) return [];
    return serviceOfferings.filter(
      (offering) => offering.categoryId === selectedService.id
    );
  }, [selectedService, serviceOfferings]);

  const Particle = ({ delay = 0, size = "small" }) => (
    <div
      className={`absolute animate-pulse opacity-20 ${
        size === "large" ? "w-2 h-2" : "w-1 h-1"
      }`}
      style={{
        animation: `particle-float 5s ease-in-out infinite ${delay}s`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        background: `radial-gradient(circle, #F472B6 0%, #60A5FA 50%, #FBBF24 100%)`,
        borderRadius: "50%",
      }}
    />
  );

  const ServiceCard = ({ service, isActive }) => (
    <div
      className={`relative cursor-pointer transition-all duration-500 transform ${
        isActive ? "scale-110 z-20" : "hover:scale-105"
      }`}
    >
      <div
        className={`w-20 h-20 rounded-xl border-2 transition-all duration-300 flex items-center justify-center bg-cover bg-center ${
          isActive
            ? "border-pink-400 shadow-xl bg-gradient-to-br from-pink-400/20 to-blue-400/20 backdrop-blur-md"
            : "border-gray-300/30 hover:border-gray-300/50 bg-gray-900/20 backdrop-blur-sm hover:bg-gray-900/30"
        }`}
        style={{ backgroundImage: `url(${service.image})` }}
        onClick={() => handleServiceClick(service)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent rounded-xl" />
        {isActive && (
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-pink-400 to-blue-400 opacity-40 animate-spin-slow" />
        )}
      </div>
      <div
        className={`absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all duration-300 ${
          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        {service.name}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45" />
      </div>
    </div>
  );

  // Slick slider settings
  const sliderSettings = {
    dots: false,
    infinite: filteredOfferings.length > 3,
    speed: 500,
    slidesToShow: Math.min(filteredOfferings.length, 3),
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <ChevronLeft className="w-6 h-6 text-white" />,
    nextArrow: <ChevronRight className="w-6 h-6 text-white" />,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: Math.min(filteredOfferings.length, 2) },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const slide = {
    id: 1,
    type: "hero",
    title: salon ? `Chào mừng đến với ${salon.name}` : "Biến Hóa Mái Tóc",
    subtitle: "Khám phá các dịch vụ tuyệt vời của chúng tôi",
    background: salon?.images?.[currentBackgroundIndex]
      ? `url(${salon.images[currentBackgroundIndex]})`
      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    cta: "Khám phá dịch vụ",
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-white/10 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-4 h-4 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white animate-bounce" />
            </div>
            <svg className="absolute inset-0 w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="30"
                stroke="#F472B6"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${loadingProgress * 1.88} 188`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
          </div>
          <h1
            ref={(el) => (textRefs.current[0] = el)}
            className="text-xl font-bold text-white mb-2"
          >
            Beauty Salon
          </h1>
          <p className="text-white/70 text-sm">Đang tải trải nghiệm...</p>
          <div className="w-24 h-1 bg-white/20 rounded-full mt-2 mx-auto overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-blue-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(loadingProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative h-[calc(100vh-128px)] overflow-hidden font-sans ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
          
          @keyframes particle-float {
            0%, 100% { transform: translateY(0); opacity: 0.2; }
            50% { transform: translateY(-8px); opacity: 0.4; }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .modal-content {
            max-height: calc(100vh - 300px);
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #F472B6 #1a1a1a;
          }
          .modal-content::-webkit-scrollbar {
            width: 6px;
          }
          .modal-content::-webkit-scrollbar-track {
            background: #1a1a1a;
          }
          .modal-content::-webkit-scrollbar-thumb {
            background: #F472B6;
            border-radius: 3px;
          }
          .slick-prev, .slick-next {
            z-index: 10;
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex !important;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
          }
          .slick-prev:hover, .slick-next:hover {
            background: rgba(255,255,255,0.4);
          }
          .slick-prev { left: -50px; }
          .slick-next { right: -50px; }
          @media (max-width: 640px) {
            .slick-prev { left: -20px; }
            .slick-next { right: -20px; }
          }
        `}
      </style>
      <div className="absolute top-5 left-2 z-30 w-48">
        <select
          value={selectedSalonId}
          onChange={(e) => setSelectedSalonId(e.target.value)}
          className="w-full p-2 rounded-lg bg-gray-900/80 text-white border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          <option value="">Chọn salon</option>
          {salons.map((salon) => (
            <option key={salon.id} value={salon.id}>
              {salon.name}
            </option>
          ))}
        </select>
      </div>
      <div
        className="absolute inset-0 transition-all duration-1000 ease-in-out bg-cover bg-center"
        style={{
          background: slide.background,
          transform: `scale(${isHovered ? 1.02 : 1})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/30" />
        {[...Array(10)].map((_, i) => (
          <Particle
            key={i}
            delay={i * 0.2}
            size={i % 3 === 0 ? "large" : "small"}
          />
        ))}
      </div>
      <div className="relative z-20 h-full flex items-center justify-center px-4">
        <div className="w-full max-w-5xl mx-auto text-center">
          <div className="mb-8">
            <h1
              ref={(el) => (textRefs.current[1] = el)}
              className="text-4xl md:text-6xl font-bold font-[Poppins] text-white mb-4 tracking-tight"
              data-aos="fade-up"
            >
              {slide.title}
            </h1>
            <p
              ref={(el) => (textRefs.current[2] = el)}
              className="text-lg md:text-xl text-white/90 font-light mb-6 max-w-2xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              {slide.subtitle}
            </p>
            <div className="mb-6">
              <h3
                ref={(el) => (textRefs.current[3] = el)}
                className="text-base font-medium text-white/80 mb-4 flex items-center justify-center gap-2"
                data-aos="fade-"
                data-aos-delay="200"
              >
                <Scissors className="w-5 h-5 text-pink-400" />
                Dịch Vụ Nổi Bật
                <Palette className="w-5 h-5 text-blue-400" />
              </h3>
              <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isActive={selectedService?.id === service.id}
                  />
                ))}
              </div>
            </div>
            {filteredOfferings.length > 0 && (
              <div className="mt-6">
                <h4
                  ref={(el) => (textRefs.current[4] = el)}
                  className="text-lg font-semibold text-white mb-4"
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  Gói Dịch Vụ {selectedService.name}
                </h4>
                {filteredOfferings.length <= 3 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {filteredOfferings.map((offering) => (
                      <div
                        key={offering.id}
                        className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md rounded-lg p-4 text-left border border-gray-700/50 hover:border-pink-400/50 transition-all duration-300"
                        data-aos="fade-up"
                        data-aos-delay={(offering.id % 100) + 400}
                      >
                        <img
                          src={offering.images[0]}
                          alt={offering.name}
                          className="w-full h-24 rounded-md object-cover mb-2"
                          loading="lazy"
                          onError={(e) =>
                            (e.target.src = "/placeholder-image.png")
                          }
                        />
                        <p className="text-sm font-semibold text-white">
                          {offering.name.split("|")[0]}
                        </p>
                        <p className="text-xs text-white/70 mt-1">
                          {offering.description.slice(0, 50)}...
                        </p>
                        <p className="text-sm font-bold text-pink-400 mt-1">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(offering.price)}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            className="text-xs text-blue-400 hover:text-blue-300"
                            onClick={() => handleOfferingDetail(offering)}
                          >
                            Chi tiết
                          </button>
                          <button
                            className="text-xs bg-pink-400 text-white px-2 py-1 rounded hover:bg-pink-500"
                            onClick={() => handleBookService(offering)}
                          >
                            Đặt ngay
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative max-w-4xl mx-auto">
                    <SlickSlider {...sliderSettings}>
                      {filteredOfferings.map((offering) => (
                        <div key={offering.id} className="px-2">
                          <div
                            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md rounded-lg p-4 text-left border border-gray-700/50 hover:border-pink-400/50 transition-all duration-300 h-full"
                            data-aos="fade-up"
                            data-aos-delay={(offering.id % 100) + 400}
                          >
                            <img
                              src={offering.images[0]}
                              alt={offering.name}
                              className="w-full h-24 rounded-md object-cover mb-2"
                              loading="lazy"
                              onError={(e) =>
                                (e.target.src = "/placeholder-image.png")
                              }
                            />
                            <p className="text-sm font-semibold text-white">
                              {offering.name.split("|")[0]}
                            </p>
                            <p className="text-xs text-white/70 mt-1">
                              {offering.description.slice(0, 50)}...
                            </p>
                            <p className="text-sm font-bold text-pink-400 mt-1">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(offering.price)}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <button
                                className="text-xs text-blue-400 hover:text-blue-300"
                                onClick={() => handleOfferingDetail(offering)}
                              >
                                Chi tiết
                              </button>
                              <button
                                className="text-xs bg-pink-400 text-white px-2 py-1 rounded hover:bg-pink-500"
                                onClick={() => handleBookService(offering)}
                              >
                                Đặt ngay
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </SlickSlider>
                    {filteredOfferings.length > 3 && (
                      <button
                        className="mt-4 text-sm text-pink-400 hover:text-pink-300 underline mx-auto block"
                        onClick={() => sliderRef.current?.slickGoTo(0)}
                      >
                        Xem thêm
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 justify-center items-center">
            <button
              ref={(el) => (textRefs.current[5] = el)}
              className="bg-gradient-to-r from-pink-400 to-blue-400 text-white px-6 py-2 rounded-full text-sm font-semibold hover:from-pink-500 hover:to-blue-500 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <span className="flex items-center gap-1">
                {slide.cta}
                <Sparkles className="w-4 h-4" />
              </span>
            </button>
            <button
              ref={(el) => (textRefs.current[6] = el)}
              className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-6 py-2 rounded-full text-sm font-semibold hover:from-yellow-500 hover:to-pink-500 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="500"
              onClick={() =>
                selectedService && handleBookService(selectedService)
              }
              disabled={!selectedService}
            >
              <Calendar className="inline w-4 h-4 mr-1" />
              Đặt Lịch Ngay
            </button>
            <button
              className="bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-semibold border border-white/30 hover:bg-white/30 transition-all duration-300"
              onClick={handleShare}
              data-aos="fade-up"
              data-aos-delay="600"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {salon && (
        <div className="absolute bottom-2 left-2 z-30 text-white/90 text-xs flex items-center gap-1 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-md px-3 py-1 rounded">
          <MapPin className="w-3 h-3" />
          <span>{salon.address}</span>
          <span className="mx-1">•</span>
          <Clock className="w-3 h-3" />
          <span>
            {salon.openingTime.slice(0, 5)} - {salon.closingTime.slice(0, 5)}
          </span>
        </div>
      )}
      {isModalOpen && selectedOffering && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            ref={modalRef}
            className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl p-6 rounded-2xl w-[90vw] max-w-lg mx-4 border border-gray-700/50 shadow-2xl max-h-[calc(100vh-144px)]"
            onClick={(e) => e.stopPropagation()}
            data-aos="zoom-in"
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                ref={modalTitleRef}
                className="text-lg font-semibold text-white"
              >
                {selectedOffering.name.split("|")[0]}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-pink-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-content">
              <img
                src={selectedOffering.images[0]}
                alt={selectedOffering.name}
                className="w-full h-32 rounded-lg object-cover mb-4"
                loading="lazy"
                onError={(e) => (e.target.src = "/placeholder-image.png")}
              />
              <p className="text-sm text-white/80 mb-2">
                Giá:{" "}
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(selectedOffering.price)}
              </p>
              <p className="text-sm text-white/80 mb-2">
                Thời gian: {selectedOffering.duration} phút
              </p>
              <h3 className="text-sm font-semibold text-white mb-2">
                Các Bước Thực Hiện
              </h3>
              <div className="space-y-3">
                {selectedOffering.name
                  .split("|")
                  .map((step, index) => ({
                    name: step,
                    image:
                      selectedOffering.images[index] ||
                      selectedOffering.images[0],
                  }))
                  .map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 bg-gray-800/50 p-3 rounded-lg"
                      data-aos="fade-up"
                      data-aos-delay={index * 50}
                    >
                      <img
                        src={step.image}
                        alt={step.name}
                        className="w-14 h-14 rounded object-cover"
                        loading="lazy"
                        onError={(e) =>
                          (e.target.src = "/placeholder-image.png")
                        }
                      />
                      <div>
                        <p className="text-xs font-medium text-white">
                          Bước {index + 1}: {step.name}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 rounded-lg text-sm hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                onClick={() => handleBookService(selectedOffering)}
              >
                Đặt Lịch
              </button>
              <button
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg text-sm hover:bg-gray-600 transition-all duration-300"
                onClick={() => setIsModalOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl p-6 rounded-2xl w-64 mx-4 border border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-white mb-3 text-center">
              Chia Sẻ
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {["Facebook", "Instagram", "Link"].map((platform) => (
                <button
                  key={platform}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-800 text-white text-xs"
                  onClick={() => {
                    toast.success(`Đã chia sẻ qua ${platform}!`);
                    setShowShareModal(false);
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-right" autoClose={1500} />
    </div>
  );
};

export default Slider;
