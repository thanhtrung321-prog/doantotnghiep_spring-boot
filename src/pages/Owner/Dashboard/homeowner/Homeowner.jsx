import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  useTransition,
  Suspense,
  lazy,
} from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  Users,
  DollarSign,
  Scissors,
  Clock,
  Award,
  X,
  Store,
  User,
  Grid,
  List,
} from "lucide-react";
import * as THREE from "three";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  fetchSalon,
  fetchCategories,
  fetchServices,
  fetchBookings,
  fetchPayments,
  processDashboardData,
  fetchStatDetails,
} from "../api/homeowner";
import { debounce } from "lodash";

// Lazy load components
const SalonLoadingScreen = lazy(() =>
  import("../../Dashboard/homeowner/Loadingowner")
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8 text-red-600">
          <h2>Đã xảy ra lỗi. Vui lòng thử lại.</h2>
        </div>
      );
    }
    return this.props.children;
  }
}

// Staff Card Component with Initial Badge
const StaffCard = React.memo(({ staff, onClick }) => {
  const badgeRef = useRef(null);

  useEffect(() => {
    if (badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  }, []);

  const initial = (staff.name || staff.fullName || "N")[0].toUpperCase();

  return (
    <div
      className="p-6 rounded-xl hover:bg-orange-50 transition-all cursor-pointer bg-white shadow-sm"
      onClick={() => onClick(staff)}
      data-aos="fade-up"
      data-aos-duration="600"
    >
      <div className="flex items-center space-x-4">
        <div
          ref={badgeRef}
          className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-pink-500 text-white text-2xl font-bold shadow-md transition-transform hover:scale-105 hover:shadow-lg"
        >
          {initial}
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-gray-800 text-lg leading-6">
            {staff.name || staff.fullName}
          </p>
          <p className="text-sm text-gray-600 leading-5">{staff.role}</p>
          <p className="text-sm text-orange-600 leading-5">
            Đánh giá: {staff.rating || "N/A"}/5
          </p>
        </div>
      </div>
      <div className="mt-3 text-right space-y-1">
        <p className="text-orange-600 font-semibold text-base leading-6">
          {staff.monthlyRevenue || "0tr"}
        </p>
        <p className="text-sm text-gray-600 leading-5">
          {staff.bookings || 0} lịch
        </p>
      </div>
    </div>
  );
});

// Modal Component with Karaoke Text Animation
const Modal = React.memo(
  ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
    const modalRef = useRef(null);
    const titleRef = useRef(null);

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, y: 100, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
          }
        );

        // Karaoke-style text animation
        const chars = titleRef.current.querySelectorAll(".char");
        gsap.fromTo(
          chars,
          { opacity: 0, color: "#000000" },
          {
            opacity: 1,
            color: () =>
              `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
                Math.random() * 255
              })`,
            stagger: 0.05,
            duration: 0.3,
            ease: "power2.out",
          }
        );
      } else {
        document.body.style.overflow = "auto";
      }
      return () => {
        document.body.style.overflow = "auto";
      };
    }, [isOpen]);

    if (!isOpen) return null;

    // Split title into characters for karaoke effect
    const titleChars = title.split("").map((char, index) => (
      <span key={index} className="char inline-block mx-[0.05em]">
        {char}
      </span>
    ));

    return (
      <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
        <div
          ref={modalRef}
          className={`bg-white p-8 rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[80vh] overflow-y-auto`}
        >
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10">
            <h2
              ref={titleRef}
              className="text-2xl font-bold text-gray-800 leading-8"
            >
              {titleChars}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-all"
            >
              <X className="h-7 w-7" />
            </button>
          </div>
          <div className="space-y-4">{children}</div>
          <div className="mt-8 flex justify-end sticky bottom-0 bg-white pt-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }
);

// Stat Card Component
const StatCard = React.memo(
  ({
    icon: Icon,
    title,
    value,
    change,
    color,
    type,
    onClick,
    transformStyle,
  }) => (
    <div
      className={`stat-card ${color} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer`}
      style={transformStyle}
      onClick={() => onClick(type)}
      data-aos="zoom-in"
      data-aos-duration="600"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-semibold opacity-90 leading-5">{title}</p>
          <p className="text-3xl font-bold leading-9">{value}</p>
          {change && (
            <p className="text-xs font-medium leading-4">
              {change.includes("-") ? (
                <span className="text-red-600">{change} so với trước</span>
              ) : (
                <span className="text-green-600">{change} so với trước</span>
              )}
            </p>
          )}
        </div>
        <div className="p-3 rounded-full bg-white bg-opacity-40">
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  )
);

const Homeowner = () => {
  const [userData, setUserData] = useState(null);
  const [salonId, setSalonId] = useState(null);
  const [salonData, setSalonData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const threeJsContainerRef = useRef(null);
  const titleRef = useRef(null);
  const [dashboardData, setDashboardData] = useState({
    revenueData: [],
    serviceData: [],
    stylistBookingData: [],
    dailyBookings: [],
    topStylists: [],
    salonDetails: {
      name: "Salon Tóc",
      address: "N/A",
      images: [],
      totalSalons: 1,
      totalServices: 0,
      totalStylists: 0,
      totalCategories: 0,
      totalRevenue: 0,
      highestPricedService: {},
    },
    stats: {
      totalRevenue: 0,
      totalTransactions: 0,
      successRate: 0,
      topService: "N/A",
    },
    staffList: [],
    categoryData: [],
  });
  const [loading, setLoading] = useState(true);
  const [showStatModal, setShowStatModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showStylistModal, setShowStylistModal] = useState(false);
  const [showSalonModal, setShowSalonModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [selectedChart, setSelectedChart] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const statDetailsRef = useRef({ title: "", data: [] });
  const [isPending, startTransition] = useTransition();

  const COLORS = useMemo(
    () => ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"],
    []
  );

  // Debounced mouse move handler
  const handleMouseMove = useMemo(
    () =>
      debounce((event) => {
        setMousePosition({
          x: event.clientX / window.innerWidth - 0.5,
          y: event.clientY / window.innerHeight - 0.5,
        });
      }, 50),
    []
  );

  // Transform style function
  const getTransformStyle = useCallback(
    (position) => ({
      transform: `perspective(1200px) rotateY(${position.x * 4}deg) rotateX(${
        -position.y * 4
      }deg)`,
    }),
    []
  );

  useEffect(() => {
    // Initialize GSAP and AOS
    if (typeof window !== "undefined") {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: -50, color: "#000000" },
        {
          opacity: 1,
          y: 0,
          color: "rgb(255, 107, 107)",
          duration: 1,
          ease: "power3.out",
        }
      );
      gsap.fromTo(
        ".stat-card",
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.7)",
        }
      );
      AOS.init({
        duration: 800,
        easing: "ease-in-out",
        once: true,
      });
    }

    // Fetch user data from localStorage
    const storedUser = localStorage.getItem("user");
    const userId = localStorage.getItem("userId");

    if (userId && storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);

      if (user.role === "OWNER" && user.salonId) {
        setSalonId(user.salonId.toString());
      } else {
        toast.error("Không tìm thấy thông tin salon của chủ salon");
        setLoading(false);
      }
    } else {
      toast.error("Vui lòng đăng nhập để xem dashboard");
      setLoading(false);
    }

    return () => {
      AOS.refreshHard();
    };
  }, []);

  useEffect(() => {
    if (!salonId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch salon details
        const salon = await fetchSalon(salonId);
        setSalonData(salon);

        // Fetch dashboard data
        const data = await processDashboardData(salonId);
        setDashboardData(data);

        // Fetch bookings
        const bookingsData = await fetchBookings(salonId);
        const formattedBookings = bookingsData.map((booking) => ({
          id: booking.id,
          customer: booking.customerName || "Khách hàng",
          service: booking.serviceNames?.split("|")[0] || "Dịch vụ",
          time: new Date(booking.startTime).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: new Date(booking.startTime).toLocaleDateString("vi-VN"),
          status: booking.status.toLowerCase(),
          price: booking.totalPrice || 0,
        }));
        setBookings(formattedBookings);

        gsap.from(".dashboard-content", {
          opacity: 0,
          y: 60,
          duration: 1.5,
          ease: "power3.out",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.message || "Không thể tải dữ liệu dashboard");
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchData();
  }, [salonId]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      handleMouseMove.cancel();
    };
  }, [handleMouseMove]);

  useEffect(() => {
    if (!threeJsContainerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 300 / 200, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(300, 200);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeJsContainerRef.current.innerHTML = "";
    threeJsContainerRef.current.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 100;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 6;
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.015,
      color: 0xff6b6b,
      transparent: true,
      opacity: 0.8,
    });
    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    camera.position.z = 5;

    let animationFrameId;
    const animate = () => {
      particlesMesh.rotation.y += 0.002;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
    };
  }, []);

  const handleStatClick = useCallback(
    async (statType) => {
      startTransition(async () => {
        try {
          const details = await fetchStatDetails(statType, salonId);
          statDetailsRef.current = details;
          setSelectedStat(statType);
          setShowStatModal(true);
        } catch (error) {
          toast.error(error.message || "Không thể tải chi tiết thống kê");
        }
      });
    },
    [salonId]
  );

  const handleChartClick = useCallback((chartType) => {
    startTransition(() => {
      setSelectedChart(chartType);
      setShowChartModal(true);
    });
  }, []);

  const handleStylistClick = useCallback((stylist) => {
    startTransition(() => {
      setSelectedStylist(stylist);
      setShowStylistModal(true);
    });
  }, []);

  const handleSalonClick = useCallback(() => {
    startTransition(() => {
      setShowSalonModal(true);
    });
  }, []);

  const handleServiceClick = useCallback((service) => {
    startTransition(() => {
      setSelectedService(service);
      setShowServiceModal(true);
    });
  }, []);

  const handleCategoryClick = useCallback((category) => {
    startTransition(() => {
      setSelectedCategory(category);
    });
  }, []);

  const handleStaffClick = useCallback(() => {
    startTransition(() => {
      setShowStaffModal(true);
    });
  }, []);

  const toggleViewMode = useCallback(() => {
    startTransition(() => {
      setViewMode((prev) => (prev === "grid" ? "table" : "grid"));
    });
  }, []);

  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 space-y-2">
          <p className="font-semibold text-gray-800 leading-6">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="text-sm leading-5"
            >
              {`${entry.name}: ${entry.value.toLocaleString()}${
                entry.name === "revenue" || entry.name === "profit" ? "đ" : ""
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  }, []);

  const serviceImages = useMemo(
    () =>
      dashboardData.serviceData
        .filter((service) => service.steps && service.steps[0]?.image)
        .map((service) => service.steps[0].image),
    [dashboardData.serviceData]
  );

  const filteredServices = useMemo(
    () =>
      selectedCategory
        ? dashboardData.serviceData.filter(
            (service) => service.categoryId === selectedCategory.id
          )
        : dashboardData.serviceData,
    [selectedCategory, dashboardData.serviceData]
  );

  const sliderSettings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
      lazyLoad: "ondemand",
    }),
    []
  );

  if (loading || isPending) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <SalonLoadingScreen
          serviceImages={serviceImages}
          salonName={dashboardData.salonDetails.name}
        />
      </Suspense>
    );
  }

  return (
    <ErrorBoundary>
      <div className="bg-gray-100 min-h-screen p-8 relative font-sans text-base leading-6 tracking-wide">
        <Suspense fallback={<div>Loading...</div>}>
          <div className="dashboard-content space-y-8">
            <div
              className="flex items-center justify-between mb-10"
              data-aos="fade-down"
              data-aos-duration="600"
            >
              <h1
                ref={titleRef}
                className="text-3xl font-extrabold text-gray-900 leading-10"
              >
                Dashboard {dashboardData.salonDetails.name}
              </h1>
              <div className="flex space-x-4">
                <button
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center transform hover:-translate-y-1"
                  onClick={handleSalonClick}
                >
                  <Store size={18} className="mr-2" />
                  Chi tiết Salon
                </button>
                <button
                  className="bg-gradient-to-r from-green-500 to-green-400 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center transform hover:-translate-y-1"
                  onClick={handleStaffClick}
                >
                  <User size={18} className="mr-2" />
                  Danh sách Nhân viên
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10"
              data-aos="fade-up"
              data-aos-duration="600"
            >
              <StatCard
                icon={DollarSign}
                title="Tổng doanh thu"
                value={
                  dashboardData.stats.totalRevenue.toLocaleString("vi-VN") + "đ"
                }
                change="+10%"
                color="bg-gradient-to-br from-orange-200 to-orange-100 text-orange-700"
                type="revenue"
                onClick={handleStatClick}
                transformStyle={getTransformStyle(mousePosition)}
              />
              <StatCard
                icon={Users}
                title="Tổng giao dịch"
                value={dashboardData.stats.totalTransactions}
                change="+5%"
                color="bg-gradient-to-br from-blue-200 to-blue-100 text-blue-700"
                type="transactions"
                onClick={handleStatClick}
                transformStyle={getTransformStyle(mousePosition)}
              />
              <StatCard
                icon={Calendar}
                title="Tỷ lệ thành công"
                value={`${dashboardData.stats.successRate.toFixed(1)}%`}
                change="+2%"
                color="bg-gradient-to-br from-green-200 to-green-100 text-green-700"
                type="successRate"
                onClick={handleStatClick}
                transformStyle={getTransformStyle(mousePosition)}
              />
              <StatCard
                icon={Scissors}
                title="Dịch vụ hàng đầu"
                value={dashboardData.stats.topService}
                change=""
                color="bg-gradient-to-br from-purple-200 to-purple-100 text-purple-700"
                type="topService"
                onClick={handleStatClick}
                transformStyle={getTransformStyle(mousePosition)}
              />
            </div>

            {/* Recent Bookings */}
            <div
              className="bg-white rounded-2xl shadow-lg p-6 mb-10"
              data-aos="fade-up"
              data-aos-delay="200"
              data-aos-duration="600"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 leading-7">
                Lịch hẹn gần đây
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-6 py-3 text-gray-600 font-medium text-sm leading-5">
                        Khách hàng
                      </th>
                      <th className="text-left px-6 py-3 text-gray-600 font-medium text-sm leading-5">
                        Dịch vụ
                      </th>
                      <th className="text-left px-6 py-3 text-gray-600 font-medium text-sm leading-5">
                        Giờ
                      </th>
                      <th className="text-left px-6 py-3 text-gray-600 font-medium text-sm leading-5">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 3).map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        data-aos="fade-up"
                        data-aos-duration="600"
                      >
                        <td className="px-6 py-4 text-gray-800 text-sm leading-5">
                          {booking.customer}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm leading-5">
                          {booking.service}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm leading-5">
                          {booking.time}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium leading-4 ${
                              booking.status === "confirmed" ||
                              booking.status === "success" ||
                              booking.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {booking.status === "confirmed" ||
                            booking.status === "success" ||
                            booking.status === "completed"
                              ? "Đã xác nhận"
                              : booking.status === "pending"
                              ? "Chờ xác nhận"
                              : "Hoàn thành"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts Row */}
            <div
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10"
              data-aos="fade-up"
              data-aos-duration="600"
            >
              <div
                className="bg-white p-8 rounded-2xl shadow-lg col-span-2 hover:shadow-xl transition-all duration-300 cursor-pointer"
                style={getTransformStyle(mousePosition)}
                onClick={() => handleChartClick("revenue")}
                data-aos="fade-right"
                data-aos-duration="600"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 leading-7">
                    Doanh thu theo tháng
                  </h2>
                  <div className="flex space-x-3">
                    {["Năm", "Tháng", "Tuần"].map((period, idx) => (
                      <span
                        key={idx}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all leading-5 ${
                          period === "Tháng"
                            ? "bg-orange-500 text-white"
                            : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                        }`}
                      >
                        {period}
                      </span>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={dashboardData.revenueData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={80}
                      tickFormatter={(value) =>
                        `${(value / 1000000).toFixed(1)}tr`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      name="Doanh thu"
                      fill="#FF6B6B"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="profit"
                      name="Lợi nhuận"
                      fill="#FF8C94"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                style={getTransformStyle(mousePosition)}
                onClick={() => handleChartClick("services")}
                data-aos="fade-left"
                data-aos-duration="600"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6 leading-7">
                  Phân bổ dịch vụ
                </h2>
                {dashboardData.serviceData.length === 0 ? (
                  <p className="text-gray-600 text-center text-sm leading-5">
                    Chưa có dịch vụ nào
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={dashboardData.serviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {dashboardData.serviceData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value} lượt`,
                          `${props.payload.revenue.toLocaleString()}đ`,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Stylist Booking Pie Chart */}
            <div
              className="bg-white p-8 rounded-2xl shadow-lg mb-10"
              data-aos="fade-up"
              data-aos-duration="600"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 leading-7">
                Phân bổ lịch đặt của Nhân viên
              </h2>
              {dashboardData.stylistBookingData.length === 0 ? (
                <p className="text-gray-600 text-center text-sm leading-5">
                  Chưa có lịch đặt nào
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={dashboardData.stylistBookingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {dashboardData.stylistBookingData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} lịch`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Additional Charts and Top Stylists */}
            <div
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10"
              data-aos="fade-up"
              data-aos-duration="600"
            >
              <div
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                style={getTransformStyle(mousePosition)}
                onClick={() => handleChartClick("bookings")}
                data-aos="fade-right"
                data-aos-duration="600"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 leading-7">
                    Lượt đặt lịch
                  </h2>
                  <Clock size={24} className="text-orange-600" />
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={dashboardData.dailyBookings}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      name="Lượt đặt lịch"
                      stroke="#FF6B6B"
                      activeDot={{ r: 10 }}
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="customers"
                      name="Khách hàng"
                      stroke="#4ECDC4"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
                style={getTransformStyle(mousePosition)}
                data-aos="fade-up"
                data-aos-duration="600"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 leading-7">
                    Biểu đồ tương tác
                  </h2>
                  <Award size={24} className="text-orange-600" />
                </div>
                <div
                  className="flex-1 flex justify-center items-center"
                  ref={threeJsContainerRef}
                ></div>
              </div>

              <div
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                data-aos="fade-left"
                data-aos-duration="600"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 leading-7">
                    Nhân viên xuất sắc
                  </h2>
                  <Award size={24} className="text-orange-600" />
                </div>
                <div className="space-y-5">
                  {dashboardData.topStylists.length === 0 ? (
                    <p className="text-gray-600 text-center text-sm leading-5">
                      Chưa có nhân viên nào
                    </p>
                  ) : (
                    dashboardData.topStylists.map((stylist, index) => (
                      <StaffCard
                        key={index}
                        staff={stylist}
                        onClick={handleStylistClick}
                        data-aos-delay={index * 150}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Category List */}
            <div
              className="bg-white p-8 rounded-2xl shadow-lg mb-10"
              data-aos="fade-up"
              data-aos-duration="600"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 leading-7">
                  Danh sách danh mục
                </h2>
                {selectedCategory && (
                  <button
                    className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-all text-sm leading-5"
                    onClick={() => handleCategoryClick(null)}
                  >
                    Xem tất cả dịch vụ
                  </button>
                )}
              </div>
              {dashboardData.categoryData.length === 0 ? (
                <p className="text-gray-600 text-center text-sm leading-5">
                  Chưa có danh mục nào
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.categoryData.map((category, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-xl hover:bg-orange-50 transition-all cursor-pointer"
                      onClick={() => handleCategoryClick(category)}
                      data-aos="fade-up"
                      data-aos-delay={index * 150}
                      data-aos-duration="600"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={category.image}
                          className="w-14 h-14 rounded-lg mr-4 shadow-sm"
                          alt={category.name}
                          loading="lazy"
                          data-aos="zoom-in"
                          data-aos-duration="800"
                        />
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-800 text-base leading-6">
                            {category.name}
                          </p>
                          <p className="text-sm text-gray-600 leading-5">
                            {category.serviceCount} dịch vụ
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service List */}
            <div
              className="bg-white p-8 rounded-2xl shadow-lg mb-10"
              data-aos="fade-up"
              data-aos-duration="600"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 leading-7">
                  Danh sách dịch vụ{" "}
                  {selectedCategory ? `(${selectedCategory.name})` : ""}
                </h2>
                <div className="flex space-x-2">
                  <button
                    className={`p-2 rounded-full ${
                      viewMode === "grid"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={toggleViewMode}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    className={`p-2 rounded-full ${
                      viewMode === "table"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={toggleViewMode}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
              {filteredServices.length === 0 ? (
                <p className="text-gray-600 text-center text-sm leading-5">
                  Chưa có dịch vụ nào
                </p>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-xl hover:bg-orange-50 transition-all cursor-pointer"
                      onClick={() => handleServiceClick(service)}
                      data-aos="fade-up"
                      data-aos-delay={index * 150}
                      data-aos-duration="600"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={service.steps[0].image}
                          className="w-14 h-14 rounded-lg shadow-sm"
                          alt={service.name}
                          loading="lazy"
                          data-aos="zoom-in"
                          data-aos-duration="800"
                        />
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-800 text-base leading-6">
                            {service.name}
                          </p>
                          <p className="text-sm text-gray-600 leading-5">
                            {service.value} lượt
                          </p>
                          <p className="text-sm text-orange-600 leading-5">
                            {service.price.toLocaleString("vi-VN")}đ
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-xl">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 leading-5">
                          Hình ảnh
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 leading-5">
                          Tên dịch vụ
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 leading-5">
                          Số lượt đặt
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 leading-5">
                          Giá
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 leading-5">
                          Doanh thu
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((service, index) => (
                        <tr
                          key={index}
                          className={`hover:bg-orange-50 cursor-pointer ${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }`}
                          onClick={() => handleServiceClick(service)}
                          data-aos="fade-up"
                          data-aos-delay={index * 150}
                          data-aos-duration="600"
                        >
                          <td className="px-6 py-4">
                            <img
                              src={service.steps[0].image}
                              className="w-10 h-10 rounded-lg"
                              alt={service.name}
                              loading="lazy"
                              data-aos="zoom-in"
                              data-aos-duration="800"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 leading-5">
                            {service.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 leading-5">
                            {service.value}
                          </td>
                          <td className="px-6 py-4 text-sm text-orange-600 leading-5">
                            {service.price.toLocaleString("vi-VN")}đ
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 leading-5">
                            {service.revenue.toLocaleString("vi-VN")}đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Staff List */}
            <div
              className="bg-white p-8 rounded-2xl shadow-lg mb-10"
              data-aos="fade-up"
              data-aos-duration="600"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 leading-7">
                  Danh sách nhân viên
                </h2>
                <div className="flex space-x-2">
                  <button
                    className={`p-2 rounded-full ${
                      viewMode === "grid"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={toggleViewMode}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    className={`p-2 rounded-full ${
                      viewMode === "table"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={toggleViewMode}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
              {dashboardData.staffList.length === 0 ? (
                <p className="text-gray-600 text-center text-sm leading-5">
                  Chưa có nhân viên nào
                </p>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.staffList.map((staff, index) => (
                    <StaffCard
                      key={index}
                      staff={staff}
                      onClick={handleStylistClick}
                      data-aos-delay={index * 150}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-xl">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 leading-5">
                          Tên nhân viên
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 leading-5">
                          Vai trò
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 leading-5">
                          Đánh giá
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 leading-5">
                          Doanh thu tháng
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 leading-5">
                          Số lịch
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.staffList.map((staff, index) => (
                        <tr
                          key={index}
                          className={`hover:bg-orange-50 cursor-pointer ${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }`}
                          onClick={() => handleStylistClick(staff)}
                          data-aos="fade-up"
                          data-aos-delay={index * 150}
                          data-aos-duration="600"
                        >
                          <td className="px-6 py-4 text-sm text-gray-800 leading-5">
                            {staff.name || staff.fullName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 leading-5">
                            {staff.role}
                          </td>
                          <td className="px-6 py-4 text-sm text-orange-600 leading-5">
                            {staff.rating || "N/A"}/5
                          </td>
                          <td className="px-6 py-4 text-sm text-orange-600 leading-5">
                            {staff.monthlyRevenue || "0tr"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 leading-5">
                            {staff.bookings || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modals */}
            <Modal
              isOpen={showStatModal}
              onClose={() => setShowStatModal(false)}
              title={statDetailsRef.current.title}
            >
              <div className="space-y-4">
                {statDetailsRef.current.data.length > 0 ? (
                  statDetailsRef.current.data.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600 font-medium text-sm leading-5">
                        {item.service || item.status || item.type}
                      </span>
                      <span className="text-gray-800 font-semibold text-sm leading-5">
                        {item.revenue
                          ? `${item.revenue.toLocaleString()}đ`
                          : item.count
                          ? `${item.count}`
                          : item.bookings
                          ? `${item.bookings} lượt`
                          : item.value}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm leading-5">
                    Không có dữ liệu chi tiết.
                  </p>
                )}
              </div>
            </Modal>

            <Modal
              isOpen={showChartModal}
              onClose={() => setShowChartModal(false)}
              title={`Chi tiết ${
                selectedChart === "revenue"
                  ? "Doanh thu"
                  : selectedChart === "services"
                  ? "Phân bổ dịch vụ"
                  : selectedChart === "bookings"
                  ? "Lượt đặt lịch"
                  : "Phân bổ lịch Nhân viên"
              }`}
              maxWidth="max-w-3xl"
            >
              <div className="mt-6">
                {selectedChart === "revenue" && (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={dashboardData.revenueData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                      />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        width={80}
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(1)}tr`
                        }
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="revenue"
                        name="Doanh thu"
                        fill="#FF6B6B"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="profit"
                        name="Lợi nhuận"
                        fill="#FF8C94"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {selectedChart === "services" && (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={dashboardData.serviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {dashboardData.serviceData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value} lượt`,
                          `${props.payload.revenue.toLocaleString()}đ`,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {selectedChart === "bookings" && (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={dashboardData.dailyBookings}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                      />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="bookings"
                        name="Lượt đặt lịch"
                        stroke="#FF6B6B"
                        activeDot={{ r: 10 }}
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="customers"
                        name="Khách hàng"
                        stroke="#4ECDC4"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                {selectedChart === "stylistBookings" && (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={dashboardData.stylistBookingData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {dashboardData.stylistBookingData.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} lịch`} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Modal>

            <Modal
              isOpen={showStylistModal}
              onClose={() => setShowStylistModal(false)}
              title={`Chi tiết Nhân viên: ${
                selectedStylist?.name || selectedStylist?.fullName
              }`}
            >
              {selectedStylist && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-pink-500 text-white text-3xl font-bold shadow-md transition-transform hover:scale-105 hover:shadow-lg"
                      data-aos="zoom-in"
                      data-aos-duration="800"
                    >
                      {(selectedStylist.name ||
                        selectedStylist.fullName ||
                        "N")[0].toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-800 text-lg leading-6">
                        {selectedStylist.name || selectedStylist.fullName}
                      </p>
                      <p className="text-sm text-gray-600 leading-5">
                        {selectedStylist.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-5">
                    <span className="font-medium">Email:</span>{" "}
                    {selectedStylist.email || "N/A"}
                  </p>
                  <p className="text-gray-600 text-sm leading-5">
                    <span className="font-medium">Số điện thoại:</span>{" "}
                    {selectedStylist.phone || "N/A"}
                  </p>
                  <p className="text-gray-600 text-sm leading-5">
                    <span className="font-medium">Doanh thu tháng:</span>{" "}
                    {selectedStylist.monthlyRevenue || "0tr"}
                  </p>
                  <p className="text-gray-600 text-sm leading-5">
                    <span className="font-medium">Số lịch:</span>{" "}
                    {selectedStylist.bookings || 0}
                  </p>
                  <p className="text-gray-600 text-sm leading-5">
                    <span className="font-medium">Đánh giá:</span>{" "}
                    {selectedStylist.rating || "N/A"}/5
                  </p>
                  {selectedStylist.createdAt && (
                    <p className="text-gray-600 text-sm leading-5">
                      <span className="font-medium">Ngày tạo:</span>{" "}
                      {new Date(selectedStylist.createdAt).toLocaleString()}
                    </p>
                  )}
                  {selectedStylist.updatedAt && (
                    <p className="text-gray-600 text-sm leading-5">
                      <span className="font-medium">Ngày cập nhật:</span>{" "}
                      {new Date(selectedStylist.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </Modal>

            <Modal
              isOpen={showSalonModal}
              onClose={() => setShowSalonModal(false)}
              title="Chi tiết Salon"
            >
              <div className="space-y-4">
                {dashboardData.salonDetails.images.length > 0 ? (
                  <Slider {...sliderSettings}>
                    {dashboardData.salonDetails.images.map((image, index) => (
                      <div key={index}>
                        <img
                          src={`http://localhost:8084/salon-images/${image}`}
                          className="w-full h-40 rounded-lg shadow-sm object-cover"
                          alt={`Salon ${dashboardData.salonDetails.name}`}
                          loading="lazy"
                          data-aos="zoom-in"
                          data-aos-duration="800"
                        />
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <img
                    src="/static/images/default.jpg"
                    className="w-full h-40 rounded-lg shadow-sm object-cover"
                    alt={dashboardData.salonDetails.name}
                    loading="lazy"
                    data-aos="zoom-in"
                    data-aos-duration="800"
                  />
                )}
                <div className="space-y-1">
                  <p className="font-semibold text-gray-800 text-base leading-6">
                    {dashboardData.salonDetails.name}
                  </p>
                  <p className="text-sm text-gray-600 leading-5">
                    {dashboardData.salonDetails.address}
                  </p>
                </div>
                <p className="text-gray-600 text-sm leading-5">
                  <span className="font-medium">Tổng số salon:</span>{" "}
                  {dashboardData.salonDetails.totalSalons}
                </p>
                <p className="text-gray-600 text-sm leading-5">
                  <span className="font-medium">Tổng dịch vụ:</span>{" "}
                  {dashboardData.salonDetails.totalServices}
                </p>
                <p className="text-gray-600 text-sm leading-5">
                  <span className="font-medium">Tổng nhân viên:</span>{" "}
                  {dashboardData.salonDetails.totalStylists}
                </p>
                <p className="text-gray-600 text-sm leading-5">
                  <span className="font-medium">Tổng danh mục:</span>{" "}
                  {dashboardData.salonDetails.totalCategories}
                </p>
                <p className="text-gray-600 text-sm leading-5">
                  <span className="font-medium">Tổng doanh thu:</span>{" "}
                  {dashboardData.salonDetails.totalRevenue.toLocaleString(
                    "vi-VN"
                  )}
                  đ
                </p>
                <p className="text-gray-600 text-sm leading-5">
                  <span className="font-medium">Dịch vụ giá cao nhất:</span>{" "}
                  {dashboardData.salonDetails.highestPricedService.name?.split(
                    "|"
                  )[0] || "N/A"}{" "}
                  (
                  {dashboardData.salonDetails.highestPricedService.price?.toLocaleString(
                    "vi-VN"
                  )}
                  đ)
                </p>
              </div>
            </Modal>

            <Modal
              isOpen={showServiceModal}
              onClose={() => setShowServiceModal(false)}
              title={`Chi tiết Dịch vụ: ${selectedService?.name}`}
            >
              {selectedService && (
                <div className="space-y-4">
                  <img
                    src={selectedService.steps[0].image}
                    className="w-full h-40 rounded-lg shadow-sm object-cover"
                    alt={selectedService.name}
                    loading="lazy"
                    data-aos="zoom-in"
                    data-aos-duration="800"
                  />
                  <p className="text-gray-600 text-sm leading-5">
                    <span className="font-medium">Giá:</span>{" "}
                    {selectedService.price.toLocaleString("vi-VN")}đ
                  </p>
                  <p className="text-gray-600 text-sm leading-5">
                    <span className="font-medium">Số lượt đặt:</span>{" "}
                    {selectedService.value}
                  </p>
                  <p className="text-gray-600 text-sm leading-5">
                    <span className="font-medium">Doanh thu:</span>{" "}
                    {selectedService.revenue.toLocaleString("vi-VN")}đ
                  </p>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2 text-base leading-6">
                      Các bước thực hiện:
                    </p>
                    {selectedService.steps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-center mb-3 space-x-3"
                      >
                        <img
                          src={step.image}
                          className="w-10 h-10 rounded-lg shadow-sm"
                          alt={step.name}
                          loading="lazy"
                          data-aos="zoom-in"
                          data-aos-duration="800"
                        />
                        <p className="text-gray-600 text-sm leading-5">
                          {step.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Modal>

            <Modal
              isOpen={showStaffModal}
              onClose={() => setShowStaffModal(false)}
              title="Danh sách Nhân viên"
              maxWidth="max-w-4xl"
            >
              <div className="mb-4">
                <p className="text-gray-600 text-sm leading-5">
                  <span className="font-medium">Tổng doanh thu nhân viên:</span>{" "}
                  {dashboardData.staffList
                    .reduce(
                      (sum, staff) =>
                        sum +
                        parseFloat(staff.monthlyRevenue.replace("tr", "")),
                      0
                    )
                    .toFixed(1)}
                  tr
                </p>
              </div>
              <div className="flex justify-end mb-4 space-x-2">
                <button
                  className={`p-2 rounded-full ${
                    viewMode === "grid"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                  onClick={toggleViewMode}
                >
                  <Grid size={20} />
                </button>
                <button
                  className={`p-2 rounded-full ${
                    viewMode === "table"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                  onClick={toggleViewMode}
                >
                  <List size={20} />
                </button>
              </div>
              {dashboardData.staffList.length === 0 ? (
                <p className="text-gray-600 text-center text-sm leading-5">
                  Chưa có nhân viên nào
                </p>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.staffList.map((staff, index) => (
                    <StaffCard
                      key={index}
                      staff={staff}
                      onClick={handleStylistClick}
                      data-aos-delay={index * 150}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-xl">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 leading-5">
                          Tên nhân viên
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 leading-5">
                          Vai trò
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 leading-5">
                          Đánh giá
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 leading-5">
                          Doanh thu tháng
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 leading-5">
                          Số lịch
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.staffList.map((staff, index) => (
                        <tr
                          key={index}
                          className={`hover:bg-orange-50 cursor-pointer ${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }`}
                          onClick={() => handleStylistClick(staff)}
                          data-aos="fade-up"
                          data-aos-delay={index * 150}
                          data-aos-duration="600"
                        >
                          <td className="px-6 py-4 text-sm text-gray-800 leading-5">
                            {staff.name || staff.fullName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 leading-5">
                            {staff.role}
                          </td>
                          <td className="px-6 py-4 text-sm text-orange-600 leading-5">
                            {staff.rating || "N/A"}/5
                          </td>
                          <td className="px-6 py-4 text-sm text-orange-600 leading-5">
                            {staff.monthlyRevenue || "0tr"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 leading-5">
                            {staff.bookings || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Modal>
          </div>
        </Suspense>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </ErrorBoundary>
  );
};

// Helper function to get week number
Date.prototype.getWeek = function () {
  const date = new Date(this.getFullYear(), 0, 1);
  return Math.ceil(((this - date) / 86400000 + date.getDay() + 1) / 7);
};

export default Homeowner;
