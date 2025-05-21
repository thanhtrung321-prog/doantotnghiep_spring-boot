import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { useLocation } from "react-router-dom";
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
import axios from "axios"; // Added axios import

// Lazy load components
const SalonLoadingScreen = lazy(() =>
  import("../../Dashboard/homeadmin/SalonLoadingScreen")
);

// API Utility Functions
const BASE_URL = "http://localhost";
const IMAGE_API_URL = `${BASE_URL}:8083/service-offering-images`;
const STATIC_IMAGE_PATH = "/static/images";

export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}:8082/user`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Không thể tải dữ liệu người dùng");
  }
};

export const fetchSalons = async () => {
  try {
    const response = await axios.get(`${BASE_URL}:8084/salon`);
    return response.data;
  } catch (error) {
    console.error("Error fetching salons:", error);
    throw new Error("Không thể tải danh sách salon");
  }
};

export const fetchSalon = async (salonId) => {
  try {
    const response = await axios.get(`${BASE_URL}:8084/salon/${salonId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching salon:", error);
    throw new Error("Không thể tải dữ liệu salon");
  }
};

export const fetchCategories = async (salonId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}:8086/categories/salon/${salonId}`
    );
    return response.data.map((category) => ({
      ...category,
      image: category.image
        ? `http://localhost:8086/category-images/${category.image}`
        : `${STATIC_IMAGE_PATH}/default.jpg`,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const fetchServices = async (salonId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}:8083/service-offering/salon/${salonId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
};

export const fetchBookings = async (salonId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}:8087/booking/salon?salonId=${salonId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
};

export const fetchPayments = async () => {
  try {
    const response = await axios.get(`${BASE_URL}:8085/payments/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { payments: [] };
  }
};

export const processDashboardData = async (salonId) => {
  try {
    const [users, salon, categories, services, bookings, payments] =
      await Promise.all([
        fetchUsers(),
        fetchSalon(salonId),
        fetchCategories(salonId),
        fetchServices(salonId),
        fetchBookings(salonId),
        fetchPayments(),
      ]);

    // Filter payments for the specified salonId
    const salonPayments = payments.payments.filter(
      (p) => p.salonId === parseInt(salonId)
    );

    // Calculate total revenue (SUCCESS and COMPLETED payments)
    const totalRevenue = salonPayments
      .filter((p) => p.status === "SUCCESS" || p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate total transactions
    const totalTransactions = salonPayments.length;

    // Calculate success rate
    const successRate = salonPayments.length
      ? (salonPayments.filter(
          (p) => p.status === "SUCCESS" || p.status === "COMPLETED"
        ).length /
          salonPayments.length) *
        100
      : 0;

    // Revenue by month
    const revenueData = Array.from({ length: 12 }, (_, i) => {
      const month = `T${i + 1}`;
      const monthPayments = salonPayments.filter((p) => {
        const booking = bookings.find((b) => b.id === p.bookingId);
        return booking && new Date(booking.startTime).getMonth() === i;
      });
      const revenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      const profit = revenue * 0.6; // Assume 60% profit margin
      return { name: month, revenue, profit, customers: monthPayments.length };
    });

    // Service distribution
    const serviceData = services.map((service) => {
      const serviceBookings = bookings.filter((b) =>
        b.serviceIds.includes(service.id)
      );
      const revenue = serviceBookings.reduce((sum, b) => {
        const payment = salonPayments.find((p) => p.bookingId === b.id);
        return sum + (payment ? payment.amount : 0);
      }, 0);
      return {
        id: service.id,
        name: service.name.split("|")[0],
        value: serviceBookings.length,
        revenue,
        steps: service.name.split("|").map((step, index) => ({
          name: step,
          image: service.image.split("|")[index]
            ? `${IMAGE_API_URL}/${service.image.split("|")[index]}`
            : `${STATIC_IMAGE_PATH}/default.jpg`,
        })),
        price: service.price,
        categoryId: service.categoryId, // Added for category filtering
      };
    });

    // Staff list with monthly revenue (only STAFF with matching salonId)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const staffList = users
      .filter((u) => u.role === "STAFF" && u.salonId === parseInt(salonId))
      .map((staff) => {
        const staffBookings = bookings.filter(
          (b) =>
            b.staffId === staff.id &&
            (b.status === "SUCCESS" || b.status === "COMPLETED") &&
            new Date(b.startTime).getMonth() === currentMonth &&
            new Date(b.startTime).getFullYear() === currentYear
        );
        const monthlyRevenue = staffBookings.reduce(
          (sum, b) => sum + (b.totalPrice || 0),
          0
        );
        return {
          id: staff.id,
          fullName: staff.fullName,
          username: staff.username,
          email: staff.email,
          phone: staff.phone,
          role: staff.role,
          createdAt: staff.createdAt,
          updatedAt: staff.updatedAt,
          salonId: staff.salonId,
          monthlyRevenue: `${(monthlyRevenue / 1000000).toFixed(1)}tr`,
          bookings: staffBookings.length,
          rating: staff.rating || 4.5,
          img: staff.image || null,
        };
      });

    // Stylist booking distribution (using STAFF instead of STYLIST)
    const stylistBookingData = staffList
      .map((staff) => ({
        name: staff.fullName,
        value: staff.bookings,
      }))
      .filter((s) => s.value > 0);

    // Top stylists
    const topStylists = staffList
      .sort(
        (a, b) => parseFloat(b.monthlyRevenue) - parseFloat(a.monthlyRevenue)
      )
      .slice(0, 4);

    // Daily bookings (last 7 days)
    const today = new Date();
    const dailyBookings = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayBookings = bookings.filter((b) => {
        const bookingDate = new Date(b.startTime);
        return (
          bookingDate.getDate() === date.getDate() &&
          bookingDate.getMonth() === date.getMonth() &&
          bookingDate.getFullYear() === date.getFullYear()
        );
      });
      return {
        name: date.toLocaleDateString("vi-VN", { weekday: "short" }),
        bookings: dayBookings.length,
        customers: new Set(dayBookings.map((b) => b.customerId)).size,
      };
    }).reverse();

    // Salon details
    const salonDetails = {
      name: salon.name || "Salon Tóc",
      address: salon.address || "N/A",
      images: salon.images || [],
      totalSalons: 1,
      totalServices: services.length,
      totalStylists: staffList.length, // Count STAFF with matching salonId
      totalCategories: categories.length,
      totalRevenue,
      highestPricedService: services.reduce(
        (max, s) => (s.price > max.price ? s : max),
        services[0] || {}
      ),
    };

    // Category data
    const categoryData = categories.map((category) => ({
      id: category.id,
      name: category.name,
      image: category.image,
      serviceCount: services.filter((s) => s.categoryId === category.id).length,
    }));

    return {
      revenueData,
      serviceData,
      stylistBookingData,
      dailyBookings,
      topStylists,
      salonDetails,
      categoryData,
      staffList,
      stats: {
        totalRevenue,
        totalTransactions,
        successRate,
        topService:
          serviceData.sort((a, b) => b.value - a.value)[0]?.name || "N/A",
      },
    };
  } catch (error) {
    console.error("Error processing dashboard data:", error);
    throw new Error("Không thể xử lý dữ liệu dashboard");
  }
};

export const fetchStatDetails = async (statType, salonId) => {
  try {
    const [payments, bookings, services] = await Promise.all([
      fetchPayments(),
      fetchBookings(salonId),
      fetchServices(salonId),
    ]);
    const salonPayments = payments.payments.filter(
      (p) => p.salonId === parseInt(salonId)
    );

    switch (statType) {
      case "revenue":
        return {
          title: "Chi tiết doanh thu",
          data: services.map((service) => {
            const serviceBookings = bookings.filter((b) =>
              b.serviceIds.includes(service.id)
            );
            const revenue = serviceBookings.reduce((sum, b) => {
              const payment = salonPayments.find((p) => p.bookingId === b.id);
              return sum + (payment ? payment.amount : 0);
            }, 0);
            return { service: service.name.split("|")[0], revenue };
          }),
        };
      case "transactions":
        return {
          title: "Chi tiết giao dịch",
          data: [
            {
              status: "Thành công",
              count: salonPayments.filter(
                (p) => p.status === "SUCCESS" || p.status === "COMPLETED"
              ).length,
            },
            {
              status: "Đang chờ",
              count: salonPayments.filter((p) => p.status === "PENDING").length,
            },
          ],
        };
      case "successRate":
        return {
          title: "Chi tiết tỷ lệ thành công",
          data: [
            {
              type: "Tỷ lệ thành công",
              value: `${
                salonPayments.length
                  ? (
                      (salonPayments.filter(
                        (p) =>
                          p.status === "SUCCESS" || p.status === "COMPLETED"
                      ).length /
                        salonPayments.length) *
                      100
                    ).toFixed(1)
                  : 0
              }%`,
            },
          ],
        };
      case "topService":
        const serviceData = services.map((service) => {
          const serviceBookings = bookings.filter((b) =>
            b.serviceIds.includes(service.id)
          );
          return {
            service: service.name.split("|")[0],
            bookings: serviceBookings.length,
          };
        });
        return {
          title: "Chi tiết dịch vụ hàng đầu",
          data: serviceData.sort((a, b) => b.bookings - a.bookings).slice(0, 3),
        };
      default:
        return { title: "Không có dữ liệu", data: [] };
    }
  } catch (error) {
    console.error("Error fetching stat details:", error);
    throw new Error("Không thể tải chi tiết thống kê");
  }
};

// Helper to generate avatar if no image
const generateAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&size=128&background=FF6B6B&color=fff`;
};

// Staff Card Component
const StaffCard = React.memo(({ staff, onClick }) => (
  <div
    className="p-5 rounded-xl hover:bg-orange-50 transition-all cursor-pointer bg-white shadow-sm"
    onClick={() => onClick(staff)}
    data-aos="fade-up"
  >
    <div className="flex items-center">
      <img
        src={staff.img || generateAvatar(staff.fullName)}
        className="w-14 h-14 rounded-full mr-4 shadow-sm"
        alt={staff.fullName}
        loading="lazy"
      />
      <div>
        <p className="font-semibold text-gray-800">{staff.fullName}</p>
        <p className="text-sm text-gray-600">{staff.role}</p>
        <p className="text-sm text-orange-600">
          Đánh giá: {staff.rating || "N/A"}/5
        </p>
      </div>
    </div>
    <div className="mt-2 text-right">
      <p className="text-orange-600 font-semibold">
        {staff.monthlyRevenue || "0tr"}
      </p>
      <p className="text-sm text-gray-600">{staff.bookings || 0} lịch</p>
    </div>
  </div>
));

// Modal Component
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
  const modalRef = useRef(null);

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
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className={`bg-white p-8 rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[80vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-all"
          >
            <X className="h-7 w-7" />
          </button>
        </div>
        {children}
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
};

const Dashboard = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [salonId, setSalonId] = useState(queryParams.get("salonId") || null);
  const [salons, setSalons] = useState([]);
  const [showSalonSelector, setShowSalonSelector] = useState(!salonId);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const threeJsContainerRef = useRef(null);
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

  const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"];

  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-out", once: true });

    const fetchSalonsData = async () => {
      try {
        const salonsData = await fetchSalons();
        setSalons(salonsData);
        if (!salonId && salonsData.length > 0) {
          setSalonId(salonsData[0].id.toString());
        }
      } catch (error) {
        toast.error("Không thể tải danh sách salon");
      }
    };

    fetchSalonsData();
  }, []);

  useEffect(() => {
    if (!salonId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await processDashboardData(salonId);
        setDashboardData((prev) => ({ ...prev, ...data }));
        gsap.from(".dashboard-content", {
          opacity: 0,
          y: 60,
          duration: 1.5,
          ease: "power3.out",
        });
      } catch (error) {
        toast.error(error.message || "Không thể tải dữ liệu dashboard");
      } finally {
        setTimeout(() => setLoading(false), 1500); // Ensure 1.5s load
      }
    };
    fetchData();
  }, [salonId]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({
        x: event.clientX / window.innerWidth - 0.5,
        y: event.clientY / window.innerHeight - 0.5,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (!threeJsContainerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 300 / 200, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(300, 200);
    threeJsContainerRef.current.innerHTML = "";
    threeJsContainerRef.current.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200; // Reduced for performance
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

    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    return () => renderer.dispose();
  }, []);

  const handleStatClick = useCallback(
    async (statType) => {
      try {
        const details = await fetchStatDetails(statType, salonId);
        statDetailsRef.current = details;
        setSelectedStat(statType);
        setShowStatModal(true);
      } catch (error) {
        toast.error(error.message || "Không thể tải chi tiết thống kê");
      }
    },
    [salonId]
  );

  const handleChartClick = useCallback((chartType) => {
    setSelectedChart(chartType);
    setShowChartModal(true);
  }, []);

  const handleStylistClick = useCallback((stylist) => {
    setSelectedStylist(stylist);
    setShowStylistModal(true);
  }, []);

  const handleSalonClick = useCallback(() => {
    setShowSalonModal(true);
  }, []);

  const handleServiceClick = useCallback((service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  }, []);

  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleStaffClick = useCallback(() => {
    setShowStaffModal(true);
  }, []);

  const handleSalonSelect = useCallback((selectedSalonId) => {
    setSalonId(selectedSalonId);
    setShowSalonSelector(false);
    setSelectedCategory(null);
    window.history.pushState({}, "", `?salonId=${selectedSalonId}`);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "grid" ? "table" : "grid"));
  }, []);

  const getTransformStyle = useCallback(
    () => ({
      transform: `perspective(1200px) rotateY(${
        mousePosition.x * 4
      }deg) rotateX(${-mousePosition.y * 4}deg)`,
    }),
    [mousePosition]
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value.toLocaleString()}${
                entry.name === "revenue" || entry.name === "profit" ? "đ" : ""
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const serviceImages = dashboardData.serviceData
    .filter((service) => service.steps && service.steps[0]?.image)
    .map((service) => service.steps[0].image);

  const filteredServices = selectedCategory
    ? dashboardData.serviceData.filter(
        (service) => service.categoryId === selectedCategory.id
      )
    : dashboardData.serviceData;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 relative font-sans">
      {showSalonSelector && (
        <Modal
          isOpen={showSalonSelector}
          onClose={() => setShowSalonSelector(false)}
          title="Chọn Salon"
        >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {salons.map((salon) => (
              <div
                key={salon.id}
                className="flex items-center p-4 rounded-xl hover:bg-orange-50 transition-all cursor-pointer"
                onClick={() => handleSalonSelect(salon.id.toString())}
              >
                <img
                  src={
                    salon.images && salon.images.length > 0
                      ? `http://localhost:8084/salon-images/${salon.images[0]}`
                      : "/static/images/default.jpg"
                  }
                  className="w-12 h-12 rounded-full mr-4 shadow-sm"
                  alt={salon.name}
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold text-gray-800">{salon.name}</p>
                  <p className="text-sm text-gray-600">{salon.address}</p>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      <Suspense fallback={<div>Loading...</div>}>
        {loading ? (
          <SalonLoadingScreen
            serviceImages={serviceImages}
            salonName={dashboardData.salonDetails.name}
          />
        ) : (
          <div className="dashboard-content">
            <div
              className="flex items-center justify-between mb-10"
              data-aos="fade-down"
            >
              <h1 className="text-3xl font-extrabold text-gray-900">
                Dashboard {dashboardData.salonDetails.name}
              </h1>
              <div className="flex space-x-4">
                <button
                  className="bg-gradient-to-r from-blue-500 to-blue-400 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center transform hover:-translate-y-1"
                  onClick={() => setShowSalonSelector(true)}
                >
                  <Store size={18} className="mr-2" />
                  Chọn Salon
                </button>
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
            >
              {[
                {
                  title: "Tổng doanh thu",
                  value:
                    dashboardData.stats.totalRevenue.toLocaleString("vi-VN") +
                    "đ",
                  icon: <DollarSign size={28} />,
                  change: "+10%",
                  color:
                    "bg-gradient-to-br from-orange-200 to-orange-100 text-orange-700",
                  type: "revenue",
                },
                {
                  title: "Tổng giao dịch",
                  value: dashboardData.stats.totalTransactions,
                  icon: <Users size={28} />,
                  change: "+5%",
                  color:
                    "bg-gradient-to-br from-blue-200 to-blue-100 text-blue-700",
                  type: "transactions",
                },
                {
                  title: "Tỷ lệ thành công",
                  value: dashboardData.stats.successRate.toFixed(1) + "%",
                  icon: <Calendar size={28} />,
                  change: "+2%",
                  color:
                    "bg-gradient-to-br from-green-200 to-green-100 text-green-700",
                  type: "successRate",
                },
                {
                  title: "Dịch vụ hàng đầu",
                  value: dashboardData.stats.topService,
                  icon: <Scissors size={28} />,
                  change: "",
                  color:
                    "bg-gradient-to-br from-purple-200 to-purple-100 text-purple-700",
                  type: "topService",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`${stat.color} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer`}
                  style={getTransformStyle()}
                  onClick={() => handleStatClick(stat.type)}
                  data-aos="zoom-in"
                  data-aos-delay={index * 150}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold opacity-90">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold mt-3">{stat.value}</p>
                      {stat.change && (
                        <p className="mt-3 text-xs font-medium">
                          {stat.change.includes("-") ? (
                            <span className="text-red-600">
                              {stat.change} so với trước
                            </span>
                          ) : (
                            <span className="text-green-600">
                              {stat.change} so với trước
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="p-3 rounded-full bg-white bg-opacity-40">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10"
              data-aos="fade-up"
            >
              <div
                className="bg-white p-8 rounded-2xl shadow-lg col-span-2 hover:shadow-xl transition-all duration-300 cursor-pointer"
                style={getTransformStyle()}
                onClick={() => handleChartClick("revenue")}
                data-aos="fade-right"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Doanh thu theo tháng
                  </h2>
                  <div className="flex space-x-3">
                    {["Năm", "Tháng", "Tuần"].map((period, idx) => (
                      <span
                        key={idx}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all ${
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
                style={getTransformStyle()}
                onClick={() => handleChartClick("services")}
                data-aos="fade-left"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Phân bổ dịch vụ
                </h2>
                {dashboardData.serviceData.length === 0 ? (
                  <p className="text-gray-600 text-center">
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
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Phân bổ lịch đặt của Nhân viên
              </h2>
              {dashboardData.stylistBookingData.length === 0 ? (
                <p className="text-gray-600 text-center">
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
            >
              <div
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                style={getTransformStyle()}
                onClick={() => handleChartClick("bookings")}
                data-aos="fade-right"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
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
                style={getTransformStyle()}
                data-aos="fade-up"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
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
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Nhân viên xuất sắc
                  </h2>
                  <Award size={24} className="text-orange-600" />
                </div>
                <div className="space-y-5">
                  {dashboardData.topStylists.length === 0 ? (
                    <p className="text-gray-600 text-center">
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
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Danh sách danh mục
                </h2>
                {selectedCategory && (
                  <button
                    className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-all"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Xem tất cả dịch vụ
                  </button>
                )}
              </div>
              {dashboardData.categoryData.length === 0 ? (
                <p className="text-gray-600 text-center">
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
                    >
                      <div className="flex items-center">
                        <img
                          src={category.image}
                          className="w-14 h-14 rounded-lg mr-4 shadow-sm"
                          alt={category.name}
                          loading="lazy"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {category.name}
                          </p>
                          <p className="text-sm text-gray-600">
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
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
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
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    className={`p-2 rounded-full ${
                      viewMode === "table"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={() => setViewMode("table")}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
              {filteredServices.length === 0 ? (
                <p className="text-gray-600 text-center">Chưa có dịch vụ nào</p>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-xl hover:bg-orange-50 transition-all cursor-pointer"
                      onClick={() => handleServiceClick(service)}
                      data-aos="fade-up"
                      data-aos-delay={index * 150}
                    >
                      <div className="flex items-center">
                        <img
                          src={service.steps[0].image}
                          className="w-14 h-14 rounded-lg mr-4 shadow-sm"
                          alt={service.name}
                          loading="lazy"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {service.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {service.value} lượt
                          </p>
                          <p className="text-sm text-orange-600">
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
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                          Hình ảnh
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                          Tên dịch vụ
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                          Số lượt đặt
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                          Giá
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
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
                        >
                          <td className="px-4 py-3">
                            <img
                              src={service.steps[0].image}
                              className="w-10 h-10 rounded-lg"
                              alt={service.name}
                              loading="lazy"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {service.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {service.value}
                          </td>
                          <td className="px-4 py-3 text-sm text-orange-600">
                            {service.price.toLocaleString("vi-VN")}đ
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
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
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Danh sách nhân viên
                </h2>
                <div className="flex space-x-2">
                  <button
                    className={`p-2 rounded-full ${
                      viewMode === "grid"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    className={`p-2 rounded-full ${
                      viewMode === "table"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={() => setViewMode("table")}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
              {dashboardData.staffList.length === 0 ? (
                <p className="text-gray-600 text-center">
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
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                          Hình ảnh
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                          Tên nhân viên
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                          Vai trò
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                          Đánh giá
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                          Doanh thu tháng
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
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
                        >
                          <td className="px-4 py-3">
                            <img
                              src={staff.img || generateAvatar(staff.fullName)}
                              className="w-10 h-10 rounded-full"
                              alt={staff.fullName}
                              loading="lazy"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {staff.fullName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {staff.role}
                          </td>
                          <td className="px-4 py-3 text-sm text-orange-600">
                            {staff.rating || "N/A"}/5
                          </td>
                          <td className="px-4 py-3 text-sm text-orange-600">
                            {staff.monthlyRevenue || "0tr"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
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
              <div className="space-y-5">
                {statDetailsRef.current.data.length > 0 ? (
                  statDetailsRef.current.data.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600 font-medium">
                        {item.service || item.status || item.type}
                      </span>
                      <span className="text-gray-800 font-semibold">
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
                  <p className="text-gray-600">Không có dữ liệu chi tiết.</p>
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
              title={`Chi tiết Nhân viên: ${selectedStylist?.fullName}`}
            >
              {selectedStylist && (
                <div className="space-y-5">
                  <div className="flex items-center">
                    <img
                      src={
                        selectedStylist.img ||
                        generateAvatar(selectedStylist.fullName)
                      }
                      className="w-20 h-20 rounded-full mr-4 shadow-sm"
                      alt={selectedStylist.fullName}
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {selectedStylist.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedStylist.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span>{" "}
                    {selectedStylist.email}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Số điện thoại:</span>{" "}
                    {selectedStylist.phone}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Doanh thu tháng:</span>{" "}
                    {selectedStylist.monthlyRevenue || "0tr"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Số lịch:</span>{" "}
                    {selectedStylist.bookings || 0}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Đánh giá:</span>{" "}
                    {selectedStylist.rating || "N/A"}/5
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Ngày tạo:</span>{" "}
                    {new Date(selectedStylist.createdAt).toLocaleString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Ngày cập nhật:</span>{" "}
                    {new Date(selectedStylist.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </Modal>

            <Modal
              isOpen={showSalonModal}
              onClose={() => setShowSalonModal(false)}
              title="Chi tiết Salon"
            >
              <div className="space-y-5">
                {dashboardData.salonDetails.images.length > 0 ? (
                  <Slider {...sliderSettings}>
                    {dashboardData.salonDetails.images.map((image, index) => (
                      <div key={index}>
                        <img
                          src={`http://localhost:8084/salon-images/${image}`}
                          className="w-full h-40 rounded-lg shadow-sm object-cover"
                          alt={`Salon ${dashboardData.salonDetails.name}`}
                          loading="lazy"
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
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-800">
                    {dashboardData.salonDetails.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {dashboardData.salonDetails.address}
                  </p>
                </div>
                <p className="text-gray-600">
                  <span className="font-medium">Tổng số salon:</span>{" "}
                  {dashboardData.salonDetails.totalSalons}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Tổng dịch vụ:</span>{" "}
                  {dashboardData.salonDetails.totalServices}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Tổng nhân viên:</span>{" "}
                  {dashboardData.salonDetails.totalStylists}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Tổng danh mục:</span>{" "}
                  {dashboardData.salonDetails.totalCategories}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Tổng doanh thu:</span>{" "}
                  {dashboardData.salonDetails.totalRevenue.toLocaleString(
                    "vi-VN"
                  )}
                  đ
                </p>
                <p className="text-gray-600">
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
                <div className="space-y-5">
                  <img
                    src={selectedService.steps[0].image}
                    className="w-full h-40 rounded-lg shadow-sm object-cover"
                    alt={selectedService.name}
                    loading="lazy"
                  />
                  <p className="text-gray-600">
                    <span className="font-medium">Giá:</span>{" "}
                    {selectedService.price.toLocaleString("vi-VN")}đ
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Số lượt đặt:</span>{" "}
                    {selectedService.value}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Doanh thu:</span>{" "}
                    {selectedService.revenue.toLocaleString("vi-VN")}đ
                  </p>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">
                      Các bước thực hiện:
                    </p>
                    {selectedService.steps.map((step, index) => (
                      <div
                        key={index}
                        className="service-step flex items-center mb-3"
                      >
                        <img
                          src={step.image}
                          className="w-10 h-10 rounded-lg mr-3 shadow-sm"
                          alt={step.name}
                          loading="lazy"
                        />
                        <p className="text-gray-600">{step.name}</p>
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
                <p className="text-gray-600">
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
              <div className="flex justify-end mb-4">
                <button
                  className={`p-2 rounded-full mr-2 ${
                    viewMode === "grid"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid size={20} />
                </button>
                <button
                  className={`p-2 rounded-full ${
                    viewMode === "table"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                  onClick={() => setViewMode("table")}
                >
                  <List size={20} />
                </button>
              </div>
              {dashboardData.staffList.length === 0 ? (
                <p className="text-gray-600 text-center">
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
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                          Hình ảnh
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                          Tên nhân viên
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                          Vai trò
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                          Đánh giá
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                          Doanh thu tháng
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
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
                        >
                          <td className="px-4 py-3">
                            <img
                              src={staff.img || generateAvatar(staff.fullName)}
                              className="w-10 h-10 rounded-full"
                              alt={staff.fullName}
                              loading="lazy"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {staff.fullName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {staff.role}
                          </td>
                          <td className="px-4 py-3 text-sm text-orange-600">
                            {staff.rating || "N/A"}/5
                          </td>
                          <td className="px-4 py-3 text-sm text-orange-600">
                            {staff.monthlyRevenue || "0tr"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
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
        )}
      </Suspense>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default Dashboard;
