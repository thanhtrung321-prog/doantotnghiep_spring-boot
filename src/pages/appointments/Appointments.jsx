import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import Cookies from "js-cookie";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Grid,
  List,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  fetchAppointments,
  fetchSalonInfo,
  fetchUserInfo,
  fetchStaffInfo,
  fetchServiceDetails,
  deleteAppointment,
} from "../../api/appointments";

// KaraokeText Component with Left-to-Right and Right-to-Left RGB Animation
const KaraokeText = ({ text, className = "" }) => {
  const spansRef = useRef([]);
  useEffect(() => {
    let direction = 1; // 1 for left-to-right, -1 for right-to-left
    let index = 0;

    const interval = setInterval(() => {
      if (spansRef.current[index]) {
        spansRef.current[index].style.color = `rgb(${Math.floor(
          Math.random() * 256
        )}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
          Math.random() * 256
        )})`;

        index += direction;

        // Reverse direction at boundaries
        if (index >= spansRef.current.length - 1) {
          direction = -1;
          index = spansRef.current.length - 1;
        } else if (index <= 0) {
          direction = 1;
          index = 0;
        }
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={className}>
      {text.split("").map((char, idx) => (
        <span key={idx} ref={(el) => (spansRef.current[idx] = el)}>
          {char}
        </span>
      ))}
    </span>
  );
};

// Service Selection and Redirect Function
const selectServiceAndRedirect = async (serviceIds, navigate, salonId) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) throw new Error("User not logged in");

    const selectedServices = serviceIds.map((id) => id.toString());
    Cookies.set("selectedServices", JSON.stringify(selectedServices), {
      expires: 1,
    });

    navigate("/booking", {
      state: {
        userId: user.id,
        salonId,
        serviceIds,
      },
    });
  } catch (error) {
    toast.error("Lỗi khi chọn dịch vụ: " + error.message);
    throw error;
  }
};

// Main Appointments Component
const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayMode, setDisplayMode] = useState("slider");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(null); // State for delete confirmation modal
  const appointmentsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });

    gsap.fromTo(
      ".header-section",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
    );

    const loadAppointments = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
          throw new Error("User not authenticated");
        }

        const userInfo = await fetchUserInfo(userId, token);
        const bookings = await fetchAppointments(userId, token);

        const processedAppointments = await Promise.all(
          bookings.map(async (booking) => {
            const staff = await fetchStaffInfo(booking.staffId, token);
            const salon = await fetchSalonInfo(booking.salonId);
            const services = await Promise.all(
              booking.serviceIds.map((serviceId) =>
                fetchServiceDetails(serviceId, token)
              )
            );

            const serviceNames = services.map((s) => s.name.split("|")).flat();
            const serviceDescriptions = services
              .map((s) => s.description.split("|"))
              .flat();
            const serviceImages = services.map((s) => s.image).flat();
            const serviceIds = services.map((s) => s.id);

            const start = new Date(booking.startTime);
            const end = new Date(booking.endTime);
            const durationMs = end - start;
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor(
              (durationMs % (1000 * 60 * 60)) / (1000 * 60)
            );
            const duration =
              hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

            return {
              id: booking.id,
              customerName: userInfo.fullName,
              phone: userInfo.phone,
              email: userInfo.email,
              serviceNames,
              serviceDescriptions,
              serviceImages,
              serviceIds,
              service: serviceNames.join(" | "),
              stylist: staff.fullName,
              date: booking.startTime.split("T")[0],
              time: start.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              duration,
              status: booking.status.toLowerCase(),
              price: booking.totalPrice.toLocaleString("vi-VN"),
              note: booking.note || "",
              rating: booking.rating || null,
              salonId: booking.salonId,
              salonName: salon.name,
              salonAddress: salon.address,
              salonImages: salon.images.map(
                (img) => `http://localhost:8084/salon-images/${img}`
              ),
            };
          })
        );

        setAppointments(processedAppointments);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      await deleteAppointment(appointmentId, token);
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
      setSelectedAppointment(null);
      setShowDeleteModal(null);
      toast.success("Xóa lịch hẹn thành công!");
    } catch (error) {
      toast.error("Xóa lịch hẹn thất bại: " + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "confirmed":
        return <AlertCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "confirmed":
        return "Đã xác nhận";
      case "pending":
        return "Chờ xác nhận";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.customerName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.phone.includes(searchTerm) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.salonName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Pagination Logic
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "text-amber-400 fill-current" : "text-slate-300"
            }`}
          />
        ))}
        <span className="text-sm text-slate-600 ml-1">({rating}/5)</span>
      </div>
    );
  };

  const parseSteps = (appointment) => {
    const names = appointment.serviceNames.filter((name) => name.trim());
    const descriptions = appointment.serviceDescriptions.filter((desc) =>
      desc.trim()
    );
    const images = appointment.serviceImages.filter((img) => img.trim());

    const cover = {
      name: names[0] || "Dịch vụ không xác định",
      description: descriptions[0] || "Không có mô tả",
      image:
        images[0] || appointment.salonImages[0] || "/api/placeholder/300/200",
    };

    const maxLength = Math.max(
      names.length,
      descriptions.length,
      images.length
    );
    const steps = Array.from({ length: maxLength - 1 }, (_, index) => ({
      name: names[index + 1] || `Bước ${index + 1}`,
      description: descriptions[index + 1] || "Không có mô tả",
      image:
        images[index + 1] ||
        appointment.salonImages[index + 1] ||
        "/api/placeholder/300/200",
    })).filter((step) => step.name || step.description || step.image);

    return { cover, steps };
  };

  const handleCardClick = (appointment) => {
    setSelectedAppointment({ ...appointment, activeIndex: 0 });
  };

  const handleStepNavigation = (currentIndex, direction) => {
    const { steps } = parseSteps(selectedAppointment);
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < steps.length) {
      setSelectedAppointment((prev) => ({ ...prev, activeIndex: newIndex }));
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    dotsClass: "slick-dots custom-dots",
    afterChange: (index) => {
      setSelectedAppointment((prev) => ({ ...prev, activeIndex: index }));
    },
  };

  function CustomPrevArrow(props) {
    const { onClick } = props;
    return (
      <button
        onClick={onClick}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <ChevronLeft className="w-5 h-5 text-slate-600" />
      </button>
    );
  }

  function CustomNextArrow(props) {
    const { onClick } = props;
    return (
      <button
        onClick={onClick}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <ChevronRight className="w-5 h-5 text-slate-600" />
      </button>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-red-700 font-semibold">Có lỗi xảy ra</p>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pt-20">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Header Section */}
      <div className="header-section py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            <KaraokeText text="Lịch Sử Đặt Hẹn" />
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Quản lý và theo dõi tất cả các lịch hẹn của bạn một cách dễ dàng
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mt-6 rounded-full"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Search and Filter Section */}
        <div
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8"
          data-aos="fade-up"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, SĐT, dịch vụ hoặc salon..."
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative sm:w-48">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white appearance-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-amber-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-amber-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Appointments Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentAppointments.map((appointment, index) => {
              const { cover } = parseSteps(appointment);
              return (
                <div
                  key={appointment.id}
                  onClick={() => handleCardClick(appointment)}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 hover:border-amber-200 transition-all duration-300 cursor-pointer overflow-hidden"
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={cover.image}
                      alt={cover.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/300/200";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(appointment.status)}
                          {getStatusText(appointment.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors duration-200">
                      {cover.name}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {appointment.service}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-amber-600">
                        {appointment.price}đ
                      </div>
                      {appointment.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-current" />
                          <span className="text-sm font-medium text-slate-600">
                            {appointment.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>
                          {appointment.time} • {appointment.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-amber-500" />
                        <span>{appointment.stylist}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        <span>{appointment.salonName}</span>
                      </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group">
                      <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      Xem Chi Tiết
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {currentAppointments.map((appointment, index) => {
              const { cover } = parseSteps(appointment);
              return (
                <div
                  key={appointment.id}
                  onClick={() => handleCardClick(appointment)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-slate-200 hover:border-amber-200 transition-all duration-300 cursor-pointer overflow-hidden"
                  data-aos="fade-up"
                  data-aos-delay={index * 30}
                >
                  <div className="flex">
                    <img
                      src={cover.image}
                      alt={cover.name}
                      className="w-32 h-32 object-cover"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/300/200";
                      }}
                    />
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 mb-1">
                            {cover.name}
                          </h3>
                          <p className="text-slate-600 text-sm">
                            {appointment.service}
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          <div className="flex items-center gap-1">
                            {getStatusIcon(appointment.status)}
                            {getStatusText(appointment.status)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-slate-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>{appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-amber-500" />
                          <span>{appointment.stylist}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-amber-500" />
                          <span>{appointment.salonName}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-amber-600">
                          {appointment.price}đ
                        </div>
                        {appointment.rating && renderStars(appointment.rating)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredAppointments.length === 0 && !loading && (
          <div
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center"
            data-aos="fade-up"
          >
            <Calendar className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Không tìm thấy lịch hẹn
            </h3>
            <p className="text-slate-500">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem kết quả khác
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredAppointments.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl ${
                currentPage === 1
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              } transition-all duration-200`}
            >
              Trước
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`px-4 py-2 rounded-xl ${
                  currentPage === index + 1
                    ? "bg-amber-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                } transition-all duration-200`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-xl ${
                currentPage === totalPages
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              } transition-all duration-200`}
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Chi Tiết Lịch Hẹn #{selectedAppointment.id}
                    </h2>
                    <p className="text-slate-600">
                      {formatDate(selectedAppointment.date)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                >
                  <XCircle className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Service Display Mode Toggle */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDisplayMode("slider")}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      displayMode === "slider"
                        ? "bg-amber-500 text-white shadow-lg"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Slider View
                  </button>
                  <button
                    onClick={() => setDisplayMode("steps")}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      displayMode === "steps"
                        ? "bg-amber-500 text-white shadow-lg"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Step View
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Tổng chi phí</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {selectedAppointment.price}đ
                    </p>
                  </div>
                  {selectedAppointment.rating && (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-slate-600">Đánh giá:</p>
                      {renderStars(selectedAppointment.rating)}
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Thông Tin Khách Hàng
                  </h3>
                  <div className="space-y-3 text-slate-600">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-amber-500" />
                      <span>{selectedAppointment.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-amber-500" />
                      <span>{selectedAppointment.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-amber-500" />
                      <span>{selectedAppointment.email}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Thông Tin Lịch Hẹn
                  </h3>
                  <div className="space-y-3 text-slate-600">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-amber-500" />
                      <span>{formatDate(selectedAppointment.date)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <span>
                        {selectedAppointment.time} •{" "}
                        {selectedAppointment.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-amber-500" />
                      <span>Stylist: {selectedAppointment.stylist}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-amber-500" />
                      <span>Salon: {selectedAppointment.salonName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-amber-500" />
                      <span>Địa chỉ: {selectedAppointment.salonAddress}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Steps */}
              {(() => {
                const { cover, steps } = parseSteps(selectedAppointment);
                if (steps.length === 0) {
                  return (
                    <div className="flex flex-col items-center text-center mb-8">
                      <img
                        src={cover.image}
                        alt={cover.name}
                        className="w-full max-w-md h-64 object-cover rounded-2xl border-2 border-amber-200 mb-4"
                        onError={(e) => {
                          e.target.src = "/api/placeholder/300/200";
                        }}
                      />
                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {cover.name}
                      </h3>
                      <p className="text-slate-600">{cover.description}</p>
                    </div>
                  );
                } else if (displayMode === "slider") {
                  return (
                    <div className="mb-8">
                      <div className="w-full max-w-3xl mx-auto">
                        <Slider {...sliderSettings}>
                          {steps.map((step, index) => (
                            <div key={index}>
                              <img
                                src={step.image}
                                alt={step.name}
                                className="w-full h-64 object-cover rounded-2xl border-2 border-amber-200"
                                onError={(e) => {
                                  e.target.src = "/api/placeholder/300/200";
                                }}
                              />
                            </div>
                          ))}
                        </Slider>
                      </div>
                      <div className="text-center mt-4">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                          Bước {selectedAppointment.activeIndex + 1}:{" "}
                          {steps[selectedAppointment.activeIndex].name}
                        </h3>
                        <p className="text-slate-600">
                          {steps[selectedAppointment.activeIndex].description}
                        </p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="mb-8 space-y-8">
                      {steps.map((step, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row gap-6"
                        >
                          <img
                            src={step.image}
                            alt={step.name}
                            className="w-full md:w-48 h-48 object-cover rounded-2xl border-2 border-amber-200"
                            onError={(e) => {
                              e.target.src = "/api/placeholder/300/200";
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                              Bước {index + 1}: {step.name}
                            </h3>
                            <p className="text-slate-600">{step.description}</p>
                          </div>
                          <div className="flex items-center gap-4 md:flex-col">
                            {index > 0 && (
                              <button
                                className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-all duration-200"
                                onClick={() =>
                                  handleStepNavigation(index, "prev")
                                }
                              >
                                Trước
                              </button>
                            )}
                            {index < steps.length - 1 && (
                              <button
                                className="px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 rounded-xl transition-all duration-200"
                                onClick={() =>
                                  handleStepNavigation(index, "next")
                                }
                              >
                                Tiếp
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }
              })()}

              {/* Notes */}
              {selectedAppointment.note && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Ghi Chú
                  </h3>
                  <p className="text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    {selectedAppointment.note}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-4">
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                    selectedAppointment.status
                  )}`}
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedAppointment.status)}
                    {getStatusText(selectedAppointment.status)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowDeleteModal(selectedAppointment.id)}
                    className="bg-red-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                  <button
                    onClick={() =>
                      selectServiceAndRedirect(
                        selectedAppointment.serviceIds,
                        navigate,
                        selectedAppointment.salonId
                      )
                    }
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Đặt Lại
                  </button>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="bg-slate-100 text-slate-600 font-semibold px-6 py-3 rounded-xl hover:bg-slate-200 transition-all duration-200"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6"
            data-aos="zoom-in"
            data-aos-duration="300"
          >
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
              <h2 className="text-2xl font-bold text-slate-800">
                Xác Nhận Xóa
              </h2>
            </div>
            <p className="text-slate-600 mb-6">
              Bạn có chắc chắn muốn xóa lịch hẹn{" "}
              <KaraokeText
                text={`#${showDeleteModal}`}
                className="font-semibold"
              />
              ? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all duration-200"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteAppointment(showDeleteModal)}
                className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-dots li button {
          width: 8px;
          height: 8px;
          background: #e5e7eb;
          border-radius: 50%;
          transition: all 0.3s;
        }
        .custom-dots li.slick-active button {
          background: #f59e0b;
          width: 10px;
          height: 10px;
        }
        .slick-dots {
          bottom: -30px;
        }
      `}</style>
    </div>
  );
};

export default Appointments;
