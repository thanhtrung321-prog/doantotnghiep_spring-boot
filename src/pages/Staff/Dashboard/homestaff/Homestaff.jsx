import React, { useState, useEffect, useRef } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/vi";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchStaffBookings,
  fetchCustomer,
  fetchService,
  updateBookingStatus,
  fetchUser,
  fetchSalon,
} from "../../Dashboard/api/staffhome";
import AOS from "aos";
import "aos/dist/aos.css";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(TextPlugin);

moment.locale("vi");
const localizer = momentLocalizer(moment);

const Homestaff = () => {
  const [view, setView] = useState("table");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [dateFilter, setDateFilter] = useState("today");
  const [customDateRange, setCustomDateRange] = useState({
    start: moment().format("YYYY-MM-DD"),
    end: moment().format("YYYY-MM-DD"),
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [user, setUser] = useState(null);
  const [salon, setSalon] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [showDetails, setShowDetails] = useState(null);
  const [showActionModal, setShowActionModal] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const actionButtonRefs = useRef({});
  const headerTextRef = useRef(null);
  const actionTextRef = useRef(null);
  const confirmTextRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    const fetchUserAndSalon = async () => {
      setIsFetching(true);
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
          throw new Error("Vui lòng đăng nhập để xem bảng điều khiển");
        }

        const userData = await fetchUser(userId, token);
        setUser(userData);

        if (userData.salonId) {
          const salonData = await fetchSalon(userData.salonId);
          setSalon(salonData);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng/salon:", error);
        toast.error(
          error.message || "Không thể tải dữ liệu người dùng hoặc salon"
        );
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserAndSalon();
  }, []);

  const normalizeStatus = (status) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
      case "COMPLETED":
        return "confirmed";
      case "CANCELLED":
        return "cancelled";
      case "PENDING":
        return "pending";
      default:
        return "pending";
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id || !localStorage.getItem("token")) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const rawBookings = await fetchStaffBookings(user.id, token);

        if (!rawBookings || rawBookings.length === 0) {
          setBookings([]);
          setFilteredBookings([]);
          setLoading(false);
          return;
        }

        const enrichedBookings = await Promise.all(
          rawBookings.map(async (booking) => {
            try {
              const customer = await fetchCustomer(booking.customerId, token);
              const servicePromises = (booking.serviceIds || []).map(
                async (serviceId) => {
                  try {
                    return await fetchService(serviceId);
                  } catch (error) {
                    console.error(
                      `Lỗi khi lấy dịch vụ ${serviceId}:`,
                      error.message
                    );
                    return null;
                  }
                }
              );
              const services = (await Promise.all(servicePromises)).filter(
                (s) => s !== null
              );

              const serviceName =
                services.length > 0
                  ? services.map((s) => s.name.split("|")[0]).join(", ")
                  : "Dịch vụ không xác định";

              return {
                id: booking.id,
                customerName: customer.fullName || "Khách hàng không xác định",
                customerPhone: customer.phone || "N/A",
                serviceName,
                serviceIds: booking.serviceIds || [],
                services,
                startTime: new Date(booking.startTime),
                endTime: new Date(booking.endTime),
                status: normalizeStatus(booking.status),
              };
            } catch (error) {
              console.error(`Lỗi khi xử lý đặt lịch ${booking.id}:`, error);
              return null;
            }
          })
        );

        const validBookings = enrichedBookings.filter((b) => b !== null);
        setBookings(validBookings);
        setFilteredBookings(validBookings);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đặt lịch:", error);
        toast.error(error.message || "Không thể tải danh sách đặt lịch");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    if (bookings.length === 0) {
      setFilteredBookings([]);
      return;
    }

    let filtered = [...bookings];
    const today = moment().startOf("day");
    const tomorrow = moment().add(1, "days").startOf("day");
    const weekStart = moment().startOf("week");
    const weekEnd = moment().endOf("week");
    const monthStart = moment().startOf("month");
    const monthEnd = moment().endOf("month");

    switch (dateFilter) {
      case "today":
        filtered = filtered.filter((booking) =>
          moment(booking.startTime).isSame(today, "day")
        );
        break;
      case "tomorrow":
        filtered = filtered.filter((booking) =>
          moment(booking.startTime).isSame(tomorrow, "day")
        );
        break;
      case "thisWeek":
        filtered = filtered.filter((booking) =>
          moment(booking.startTime).isBetween(weekStart, weekEnd, "day", "[]")
        );
        break;
      case "thisMonth":
        filtered = filtered.filter((booking) =>
          moment(booking.startTime).isBetween(monthStart, monthEnd, "day", "[]")
        );
        break;
      case "custom":
        const customStart = moment(customDateRange.start).startOf("day");
        const customEnd = moment(customDateRange.end).endOf("day");
        filtered = filtered.filter((booking) =>
          moment(booking.startTime).isBetween(
            customStart,
            customEnd,
            "day",
            "[]"
          )
        );
        break;
      default:
        break;
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, dateFilter, statusFilter, customDateRange]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const backendStatus = newStatus.toUpperCase();
      await updateBookingStatus(bookingId, backendStatus, token);
      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status: normalizeStatus(backendStatus) }
          : booking
      );
      setBookings(updatedBookings);
      toast.success(`Cập nhật trạng thái thành ${getStatusDisplay(newStatus)}`);
      setShowConfirmModal(null);
      setShowActionModal(null);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.error("Không thể cập nhật trạng thái");
      setShowConfirmModal(null);
      setShowActionModal(null);
    }
  };

  const handleOpenActionModal = (bookingId, currentStatus) => {
    setShowActionModal({ bookingId, currentStatus });
  };

  const handleOpenConfirmModal = (bookingId, newStatus) => {
    setShowActionModal(null);
    setShowConfirmModal({ bookingId, newStatus });
  };

  const getStatusOptions = (currentStatus) => {
    const options = [];
    switch (currentStatus) {
      case "pending":
        options.push(
          { value: "confirmed", label: "Xác nhận" },
          { value: "cancelled", label: "Hủy" }
        );
        break;
      case "confirmed":
        options.push(
          { value: "completed", label: "Hoàn thành" },
          { value: "cancelled", label: "Hủy" }
        );
        break;
      case "cancelled":
        options.push({ value: "pending", label: "Khôi phục" });
        break;
      case "completed":
        options.push({ value: "", label: "Đã hoàn thành", disabled: true });
        break;
      default:
        options.push({
          value: "",
          label: "Không có hành động",
          disabled: true,
        });
    }
    return options;
  };

  const calendarEvents = filteredBookings.map((booking) => ({
    id: booking.id,
    title: `${booking.customerName} - ${booking.serviceName}`,
    start: booking.startTime,
    end: booking.endTime,
    status: booking.status,
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-gradient-to-r from-emerald-500 to-green-500";
      case "pending":
        return "bg-gradient-to-r from-amber-500 to-orange-500";
      case "cancelled":
        return "bg-gradient-to-r from-rose-500 to-red-500";
      case "completed":
        return "bg-gradient-to-r from-blue-500 to-indigo-500";
      default:
        return "bg-gradient-to-r from-slate-500 to-gray-500";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-emerald-400";
      case "pending":
        return "text-amber-400";
      case "cancelled":
        return "text-rose-400";
      case "completed":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const eventStyleGetter = (event) => {
    let style = {
      borderRadius: "8px",
      opacity: 0.95,
      color: "white",
      border: "0px",
      display: "block",
      fontSize: "0.9rem",
      padding: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    };

    switch (event.status) {
      case "confirmed":
        style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
        break;
      case "pending":
        style.background = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
        break;
      case "cancelled":
        style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
        break;
      case "completed":
        style.background = "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
        break;
      default:
        style.background = "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)";
    }

    return { style };
  };

  const parseSteps = (service) => {
    const names = service.name.split("|");
    const descriptions = service.description.split("|");
    const images = service.image.split("|");
    return names.map((name, index) => ({
      name,
      description: descriptions[index] || "Không có mô tả",
      image: images[index],
    }));
  };

  useEffect(() => {
    if (showDetails) {
      const imagesToPreload = [];
      showDetails.services.forEach((service) => {
        const steps = parseSteps(service);
        steps.forEach((step) => {
          if (step.image) {
            imagesToPreload.push(
              `http://localhost:8083/service-offering-images/${step.image}`
            );
          }
        });
      });

      imagesToPreload.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [showDetails]);

  const getStatusDisplay = (status) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận";
      case "pending":
        return "Đang chờ";
      case "cancelled":
        return "Đã hủy";
      case "completed":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  useEffect(() => {
    Object.values(actionButtonRefs.current).forEach((button) => {
      if (button) {
        gsap.fromTo(
          button,
          { scale: 0.95, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: button,
              start: "top 80%",
            },
          }
        );

        button.addEventListener("mouseenter", () => {
          gsap.to(button, {
            scale: 1.05,
            duration: 0.2,
            ease: "power2.out",
          });
        });

        button.addEventListener("mouseleave", () => {
          gsap.to(button, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
          });
        });

        button.addEventListener("click", () => {
          gsap.to(button, {
            background: "linear-gradient(135deg, #06b6d4, #db2777)",
            duration: 0.3,
            ease: "power2.out",
            onComplete: () =>
              gsap.to(button, {
                background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                duration: 0.3,
                ease: "power2.out",
              }),
          });
        });
      }
    });

    return () => {
      Object.values(actionButtonRefs.current).forEach((button) => {
        if (button) {
          button.removeEventListener("mouseenter", () => {});
          button.removeEventListener("mouseleave", () => {});
          button.removeEventListener("click", () => {});
        }
      });
    };
  }, [filteredBookings]);

  useEffect(() => {
    if (showDetails || showActionModal || showConfirmModal) {
      if (modalRef.current) {
        modalRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    }
  }, [showDetails, showActionModal, showConfirmModal]);

  useEffect(() => {
    const animateText = (ref, text) => {
      if (ref.current) {
        const chars = text.split("");
        ref.current.innerHTML = chars
          .map((char) => `<span class="char">${char}</span>`)
          .join("");

        gsap.to(".char", {
          color: () =>
            ["#06b6d4", "#ec4899", "#8b5cf6", "#22c55e"][
              Math.floor(Math.random() * 4)
            ],
          duration: 0.4,
          stagger: 0.06,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }
    };

    if (headerTextRef.current) {
      animateText(headerTextRef, "Bảng Điều Khiển Nhân Viên");
    }

    if (showActionModal && actionTextRef.current) {
      animateText(actionTextRef, "Chọn Hành Động");
    }

    if (showConfirmModal && confirmTextRef.current) {
      animateText(
        confirmTextRef,
        `Xác nhận cập nhật trạng thái thành "${getStatusDisplay(
          showConfirmModal.newStatus
        )}" ?`
      );
    }
  }, [showActionModal, showConfirmModal]);

  return (
    <div
      className="p-6 min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white font-sans"
      data-aos="fade-up"
    >
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />

      <header
        className="mb-8 text-center py-8 bg-gradient-to-r from-purple-800/40 to-pink-800/40 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/10"
        data-aos="zoom-in"
        data-aos-delay="200"
      >
        <h1
          ref={headerTextRef}
          className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 mb-3"
        >
          Bảng Điều Khiển Nhân Viên
        </h1>
        <p
          className="text-indigo-200 text-base md:text-lg leading-relaxed px-4"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          Quản lý lịch hẹn và công việc của bạn một cách chuyên nghiệp
        </p>
        <div
          className="mt-4 w-24 h-1 bg-gradient-to-r from-cyan-400 to-fuchsia-400 mx-auto rounded-full"
          data-aos="fade-in"
          data-aos-delay="400"
        ></div>
      </header>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        {[
          {
            title: "Lịch Hẹn Hôm Nay",
            count: bookings.filter((b) =>
              moment(b.startTime).isSame(moment(), "day")
            ).length,
            color: "from-cyan-500 to-blue-500",
            icon: "🕐",
            bgPattern: "bg-gradient-to-br from-cyan-500/20 to-blue-500/20",
          },
          {
            title: "Chờ Xác Nhận",
            count: bookings.filter((b) => b.status === "pending").length,
            color: "from-amber-500 to-orange-500",
            icon: "⏳",
            bgPattern: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
          },
          {
            title: "Đã Xác Nhận",
            count: bookings.filter((b) => b.status === "confirmed").length,
            color: "from-emerald-500 to-green-500",
            icon: "✅",
            bgPattern: "bg-gradient-to-br from-emerald-500/20 to-green-500/20",
          },
          {
            title: "Đã Hủy",
            count: bookings.filter((b) => b.status === "cancelled").length,
            color: "from-rose-500 to-red-500",
            icon: "❌",
            bgPattern: "bg-gradient-to-br from-rose-500/20 to-red-500/20",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`
              ${stat.bgPattern} backdrop-blur-sm rounded-2xl p-6
              shadow-xl border border-white/10
              hover:border-white/20 transition-all duration-300
              hover:scale-105 hover:shadow-2xl
            `}
            data-aos="zoom-in"
            data-aos-delay={`${150 * (idx + 1)}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white/80 text-sm font-medium mb-2 leading-relaxed">
                  {stat.title}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-white">
                  {stat.count}
                </p>
              </div>
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  bg-gradient-to-r ${stat.color} shadow-lg text-2xl
                `}
              >
                {stat.icon}
              </div>
            </div>
            <div
              className={`
                mt-3 h-1.5 bg-gradient-to-r ${stat.color} rounded-full opacity-60
              `}
              data-aos="fade-in"
              data-aos-delay={`${150 * (idx + 1) + 50}`}
            ></div>
          </div>
        ))}
      </div>

      <div
        className="mb-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10"
        data-aos="fade-up"
        data-aos-delay="400"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div data-aos="fade-right" data-aos-delay="100">
            <label className="block text-sm font-semibold text-white/90 mb-2 leading-relaxed">
              📅 Bộ Lọc Ngày
            </label>
            <select
              className={`
                w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm
                border border-white/20 rounded-lg text-white
                placeholder-white/50 focus:ring-2 focus:ring-cyan-400
                focus:border-transparent transition duration-300 text-sm
              `}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all" className="bg-gray-800">
                Tất Cả Ngày
              </option>
              <option value="today" className="bg-gray-800">
                Hôm Nay
              </option>
              <option value="tomorrow" className="bg-gray-800">
                Ngày Mai
              </option>
              <option value="thisWeek" className="bg-gray-800">
                Tuần Này
              </option>
              <option value="thisMonth" className="bg-gray-800">
                Tháng Này
              </option>
              <option value="custom" className="bg-gray-800">
                Khoảng Tùy Chỉnh
              </option>
            </select>
          </div>

          {dateFilter === "custom" && (
            <>
              <div data-aos="fade-right" data-aos-delay="200">
                <label className="block text-sm font-semibold text-white/90 mb-2 leading-relaxed">
                  📅 Ngày Bắt Đầu
                </label>
                <input
                  type="date"
                  className={`
                    w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm
                    border border-white/20 rounded-lg text-white
                    focus:ring-2 focus:ring-cyan-400
                    focus:border-transparent transition duration-300 text-sm
                  `}
                  value={customDateRange.start}
                  onChange={(e) =>
                    setCustomDateRange({
                      ...customDateRange,
                      start: e.target.value,
                    })
                  }
                />
              </div>
              <div data-aos="fade-right" data-aos-delay="300">
                <label className="block text-sm font-semibold text-white/90 mb-2 leading-relaxed">
                  📅 Ngày Kết Thúc
                </label>
                <input
                  type="date"
                  className={`
                    w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm
                    border border-white/20 rounded-lg text-white
                    focus:ring-2 focus:ring-cyan-400
                    focus:border-transparent transition duration-300 text-sm
                  `}
                  value={customDateRange.end}
                  onChange={(e) =>
                    setCustomDateRange({
                      ...customDateRange,
                      end: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}

          <div data-aos="fade-right" data-aos-delay="400">
            <label className="block text-sm font-semibold text-white/90 mb-2 leading-relaxed">
              🏷️ Trạng Thái
            </label>
            <select
              className={`
                w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm
                border border-white/20 rounded-lg text-white
                focus:ring-2 focus:ring-cyan-400
                focus:border-transparent transition duration-300 text-sm
              `}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all" className="bg-gray-800">
                Tất Cả Trạng Thái
              </option>
              <option value="confirmed" className="bg-gray-800">
                Đã Xác Nhận/Hoàn Thành
              </option>
              <option value="pending" className="bg-gray-800">
                Đang Chờ
              </option>
              <option value="cancelled" className="bg-gray-800">
                Đã Hủy
              </option>
            </select>
          </div>

          <div
            className="md:col-span-2 flex items-end"
            data-aos="fade-up"
            data-aos-delay="500"
          >
            <div className="w-full flex space-x-4">
              <button
                className={`
                  flex-1 px-4 py-2.5 rounded-lg font-medium text-sm
                  transition-all duration-300
                  ${
                    view === "table"
                      ? `
                        bg-gradient-to-r from-cyan-500 to-blue-500
                        text-white shadow-md shadow-cyan-500/30
                      `
                      : `
                        bg-white/10 text-white/80 hover:bg-white/20
                        backdrop-blur-sm border border-white/20
                      `
                  }
                `}
                onClick={() => setView("table")}
              >
                <span className="flex items-center justify-center">
                  📊 Bảng
                </span>
              </button>
              <button
                className={`
                  flex-1 px-4 py-2.5 rounded-lg font-medium text-sm
                  transition-all duration-300
                  ${
                    view === "calendar"
                      ? `
                        bg-gradient-to-r from-purple-500 to-pink-500
                        text-white shadow-md shadow-purple-500/30
                      `
                      : `
                        bg-white/10 text-white/80 hover:bg-white/20
                        backdrop-blur-sm border border-white/20
                      `
                  }
                `}
                onClick={() => setView("calendar")}
              >
                <span className="flex items-center justify-center">
                  📅 Lịch
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading || isFetching ? (
        <div
          className="flex justify-center items-center h-64"
          data-aos="zoom-in"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
        </div>
      ) : (
        <>
          {view === "table" && (
            <div
              className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
              data-aos="fade-up"
            >
              {filteredBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-900/50 to-pink-900/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                          👤 Khách Hàng
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                          💅 Dịch Vụ
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                          📅 Ngày & Thời Gian
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                          🏷️ Trạng Thái
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                          ⚡ Hành Động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredBookings.map((booking, index) => (
                        <tr
                          key={booking.id}
                          className="hover:bg-white/5 transition-all duration-300"
                          data-aos="fade-right"
                          data-aos-delay={index * 50}
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-white mb-1.5 leading-relaxed">
                              {booking.customerName}
                            </div>
                            <div className="text-sm text-white/60 leading-relaxed">
                              📱 {booking.customerPhone}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              className={`
                                text-sm text-cyan-300 hover:text-cyan-200
                                bg-cyan-500/20 px-4 py-2 rounded-lg
                                transition-all duration-300 hover:bg-cyan-500/30
                                border border-cyan-500/30
                              `}
                              onClick={() => setShowDetails(booking)}
                              data-testid={`details-${booking.id}`}
                            >
                              🔍 Xem chi tiết
                            </button>
                            <div className="text-xs text-white/50 mt-2 leading-relaxed">
                              ⏱️{" "}
                              {moment(booking.endTime).diff(
                                moment(booking.startTime),
                                "minutes"
                              )}{" "}
                              phút
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white font-medium mb-1.5 leading-relaxed">
                              📅{" "}
                              {moment(booking.startTime).format("D MMMM, YYYY")}
                            </div>
                            <div className="text-xs text-white/60 leading-relaxed">
                              🕐 {moment(booking.startTime).format("h:mm A")} -{" "}
                              {moment(booking.endTime).format("h:mm A")}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`
                                px-3 py-1 inline-flex text-xs font-semibold
                                rounded-full text-white ${getStatusColor(
                                  booking.status
                                )}
                              `}
                            >
                              {getStatusDisplay(booking.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              ref={(el) =>
                                (actionButtonRefs.current[booking.id] = el)
                              }
                              className={`
                                w-32 px-4 py-2
                                bg-gradient-to-r from-cyan-600 to-blue-600
                                text-white text-sm rounded-lg
                                hover:from-cyan-700 hover:to-blue-700
                                transition-all duration-300
                                disabled:opacity-50 disabled:cursor-not-allowed
                                shadow-md hover:shadow-lg
                              `}
                              onClick={() =>
                                handleOpenActionModal(
                                  booking.id,
                                  booking.status
                                )
                              }
                              disabled={booking.status === "completed"}
                              data-testid={`action-button-${booking.id}`}
                              data-aos="fade-left"
                              data-aos-delay="100"
                            >
                              ⚡ Hành động
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  className="text-center py-12"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <svg
                    className="mx-auto h-12 w-12 text-white/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 0 00-2-2H5a2 0 00-2 2v12a2"
                    />
                  </svg>
                  <h3 className="mt-3 text-lg font-semibold text-white/80 leading-relaxed">
                    {bookings.length === 0
                      ? "Không tìm thấy lịch dịch vụ"
                      : "Không tìm thấy lịch hẹn"}
                  </h3>
                  <p className="mt-2 text-white/60 leading-relaxed">
                    {bookings.length === 0
                      ? "Hiện tại bạn chưa có lịch hẹn nào."
                      : "Hãy thử thay đổi bộ lọc để xem thêm kết quả."}
                  </p>
                </div>
              )}
            </div>
          )}

          {view === "calendar" && (
            <div
              className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-4 h-[700px]"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              {filteredBookings.length > 0 ? (
                <div className="h-full">
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    eventPropGetter={eventStyleGetter}
                    views={["month", "week", "day"]}
                    defaultView="week"
                    formats={{
                      timeGutterFormat: "h:mm A",
                      eventTimeRangeFormat: ({ start, end }) =>
                        `${moment(start).format("h:mm A")} - ${moment(
                          end
                        ).format("h:mm A")}`,
                    }}
                    className="salon-calendar"
                    messages={{
                      allDay: "Cả ngày",
                      previous: "Trước",
                      next: "Tiếp",
                      today: "Hôm nay",
                      month: "Tháng",
                      week: "Tuần",
                      day: "Ngày",
                      agenda: "Lịch công tác",
                      date: "Ngày",
                      time: "Thời gian",
                      event: "Sự kiện",
                      noEventsInRange:
                        "Không có lịch hẹn trong khoảng thời gian này.",
                      showMore: (total) => `+${total} lịch hẹn`,
                    }}
                  />
                </div>
              ) : (
                <div
                  className="text-center py-12 h-full flex flex-col justify-center"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <svg
                    className="mx-auto h-12 w-12 text-white/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 0 00-2-2H5a2 0 00-2 2v12a2"
                    />
                  </svg>
                  <h3 className="mt-3 text-lg font-semibold text-white/80 leading-relaxed">
                    {bookings.length === 0
                      ? "Không tìm thấy lịch dịch vụ"
                      : "Không tìm thấy lịch hẹn"}
                  </h3>
                  <p className="mt-2 text-white/60 leading-relaxed">
                    {bookings.length === 0
                      ? "Hiện tại bạn chưa có lịch hẹn nào."
                      : "Hãy thử thay đổi bộ lọc để xem thêm kết quả."}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showDetails && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          data-aos="zoom-in"
          data-aos-duration="300"
        >
          <div
            ref={modalRef}
            className={`
              bg-gradient-to-br from-gray-800 to-indigo-900 rounded-2xl
              p-6 md:p-8 w-full max-w-[80%] max-h-[90vh] overflow-y-auto
              shadow-2xl border-2 border-cyan-500
            `}
          >
            <button
              className={`
                absolute top-4 right-4 text-cyan-400 hover:text-cyan-300
                text-2xl md:text-3xl font-bold transition-colors duration-200
              `}
              onClick={() => setShowDetails(null)}
              data-testid="close-modal"
            >
              ×
            </button>
            <h2
              className={`
              text-2xl md:text-3xl font-extrabold text-center
              bg-clip-text text-transparent
              bg-gradient-to-r from-cyan-400 to-pink-500 mb-6 leading-relaxed
              max-w-3xl mx-auto whitespace-normal
            `}
            >
              Chi Tiết Dịch Vụ
            </h2>
            <div className="text-center mb-8 space-y-4">
              <p className="text-base md:text-lg text-white leading-relaxed max-w-2xl mx-auto">
                <strong className="text-cyan-400">Khách hàng:</strong>{" "}
                {showDetails.customerName}
              </p>
              <p className="text-base md:text-lg text-white leading-relaxed max-w-2xl mx-auto">
                <strong className="text-cyan-400">Thời gian:</strong>{" "}
                {moment(showDetails.startTime).format("D MMMM, YYYY, h:mm A")} -{" "}
                {moment(showDetails.endTime).format("h:mm A")}
              </p>
            </div>
            {showDetails.services.map((service, index) => {
              const steps = parseSteps(service);
              return (
                <div key={index} className="mb-8">
                  <h3 className="text-lg md:text-xl font-bold text-cyan-300 mb-4 leading-relaxed max-w-2xl mx-auto">
                    Dịch Vụ: {service.name.split("|")[0]}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {steps.map((step, stepIndex) => (
                      <div
                        key={stepIndex}
                        className={`
                          bg-gray-700/50 rounded-lg p-4 shadow-md
                          hover:bg-gray-700/70 transition-all duration-200
                        `}
                      >
                        <img
                          src={
                            step.image
                              ? `http://localhost:8083/service-offering-images/${step.image}`
                              : "/placeholder.jpg"
                          }
                          alt={step.name}
                          className="w-full h-40 object-cover rounded-lg mb-3 border border-gray-600"
                          loading="eager"
                        />
                        <h4 className="text-base md:text-lg font-semibold text-white mb-2 leading-relaxed">
                          {stepIndex === 0
                            ? "Dịch Vụ Chính"
                            : `Bước ${stepIndex + 1}`}
                          : {step.name}
                        </h4>
                        <p className="text-gray-400 text-sm italic leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <button
              className={`
                mt-4 w-full
                bg-gradient-to-r from-cyan-600 to-blue-600
                hover:from-cyan-700 hover:to-blue-700
                text-white py-2.5 rounded-xl font-semibold
                transition-all duration-300 transform hover:scale-105
                shadow-md hover:shadow-lg text-sm md:text-base
              `}
              onClick={() => setShowDetails(null)}
              data-testid="modal-close-button"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {showActionModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          data-aos="zoom-in"
          data-aos-duration="300"
        >
          <div
            ref={modalRef}
            className={`
              bg-gradient-to-br from-gray-800 to-indigo-900 rounded-2xl
              p-6 w-full max-w-[80%] shadow-2xl border-2 border-cyan-500
              relative overflow-hidden
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 opacity-50"></div>
            <button
              className={`
                absolute top-3 right-3 text-gray-300 hover:text-white
                text-2xl font-bold transition-colors duration-200
              `}
              onClick={() => setShowActionModal(null)}
              data-testid="action-close"
              data-aos="fade-in"
              data-aos-delay="100"
            >
              ×
            </button>
            <h3
              ref={actionTextRef}
              className="text-2xl font-bold text-center text-white mb-6 leading-relaxed tracking-wide max-w-md mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Chọn Hành Động
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {getStatusOptions(showActionModal.currentStatus).map(
                (option, index) => (
                  <button
                    key={option.value}
                    className={`
                    w-full px-4 py-3 text-white rounded-lg font-medium text-sm
                    transition-all duration-300 transform hover:scale-105
                    shadow-sm hover:shadow-md
                    ${
                      option.disabled
                        ? "bg-gray-600 opacity-50 cursor-not-allowed"
                        : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                    }
                  `}
                    onClick={() =>
                      !option.disabled &&
                      handleOpenConfirmModal(
                        showActionModal.bookingId,
                        option.value
                      )
                    }
                    disabled={option.disabled}
                    data-testid={`action-option-${option.value}`}
                    data-aos="fade-up"
                    data-aos-delay={`${300 + index * 100}`}
                  >
                    {option.label}
                  </button>
                )
              )}
            </div>
            <button
              className={`
                mt-6 w-full px-4 py-3 bg-gray-700 text-gray-300 hover:bg-gray-600
                rounded-lg font-medium text-sm transition-colors duration-300
                shadow-sm hover:shadow-md
              `}
              onClick={() => setShowActionModal(null)}
              data-testid="action-cancel"
              data-aos="fade-up"
              data-aos-delay="500"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          data-aos="zoom-in"
          data-aos-duration="300"
        >
          <div
            ref={modalRef}
            className={`
              bg-gradient-to-br from-gray-800 to-indigo-900 rounded-2xl
              p-6 w-full max-w-[80%] shadow-2xl border-2 border-cyan-500
              relative overflow-hidden
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 opacity-50"></div>
            <button
              className={`
                absolute top-3 right-3 text-gray-300 hover:text-white
                text-2xl font-bold transition-colors duration-200
              `}
              onClick={() => setShowConfirmModal(null)}
              data-testid="confirm-close"
              data-aos="fade-in"
              data-aos-delay="100"
            >
              ×
            </button>
            <h3
              ref={confirmTextRef}
              className="text-2xl font-bold text-center text-white mb-6 leading-relaxed tracking-wide max-w-md mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Xác nhận cập nhật trạng thái thành{" "}
              <span
                className={`inline-block text-3xl mt-2 ${getStatusTextColor(
                  showConfirmModal.newStatus
                )}`}
              >
                "{getStatusDisplay(showConfirmModal.newStatus)}" ?
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                className={`
                  px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600
                  hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg
                  font-medium text-sm transition-all duration-300 transform hover:scale-105
                  shadow-sm hover:shadow-md
                `}
                onClick={() =>
                  handleStatusChange(
                    showConfirmModal.bookingId,
                    showConfirmModal.newStatus
                  )
                }
                data-testid="confirm-button"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                Xác nhận
              </button>
              <button
                className={`
                  px-4 py-3 bg-gray-700 text-gray-300 hover:bg-gray-600
                  rounded-lg font-medium text-sm transition-colors duration-300
                  shadow-sm hover:shadow-md
                `}
                onClick={() => setShowConfirmModal(null)}
                data-testid="cancel-button"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .salon-calendar {
          background-color: #1f2937;
          color: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .salon-calendar .rbc-header {
          background-color: #374151;
          color: #a5b4fc;
          padding: 8px;
          border-bottom: 1px solid #4b5563;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .salon-calendar .rbc-time-header {
          background-color: #374151;
          border-bottom: 1px solid #4b5563;
        }
        .salon-calendar .rbc-time-content {
          background-color: #1f2937;
          border: none;
        }
        .salon-calendar .rbc-timeslot-group {
          background-color: #1f2937;
          border-bottom: 1px solid #4b5563;
        }
        .salon-calendar .rbc-time-slot {
          color: #a5b4fc;
          font-size: 0.875rem;
        }
        .salon-calendar .rbc-day-bg {
          background-color: #1f2937;
          border-left: 1px solid #4b5563;
        }
        .salon-calendar .rbc-day-bg.rbc-today {
          background-color: #374151;
        }
        .salon-calendar .rbc-event {
          border-radius: 4px;
          padding: 6px;
          font-size: 0.875rem;
          transition: transform 0.2s ease;
        }
        .salon-calendar .rbc-event:hover {
          transform: scale(1.02);
        }
        .salon-calendar .rbc-month-view {
          background-color: #1f2937;
        }
        .salon-calendar .rbc-month-row {
          border-top: 1px solid #4b5563;
        }
        .salon-calendar .rbc-date-cell {
          color: #e5e7eb;
          padding: 8px;
        }
        .salon-calendar .rbc-off-range {
          color: #6b7280;
        }
        .salon-calendar .rbc-off-range-bg {
          background-color: #374151;
        }
        .salon-calendar .rbc-today {
          background-color: #374151;
        }
        .salon-calendar .rbc-btn-group button {
          background-color: #4b5563;
          color: #e5e7eb;
          border: 1px solid #6b7280;
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 0.875rem;
        }
        .salon-calendar .rbc-btn-group button:hover {
          background-color: #6b7280;
          color: #ffffff;
        }
        .salon-calendar .rbc-btn-group button.rbc-active {
          background-color: #3b82f6;
          color: #ffffff;
          border-color: #3b82f6;
        }
        .char {
          display: inline-block;
          margin-right: 2px;
        }
        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  );
};

export default Homestaff;
