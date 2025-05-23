import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/vi"; // Set moment to Vietnamese locale
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

moment.locale("vi"); // Ensure calendar displays in Vietnamese
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

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // GSAP text animation for header
  useEffect(() => {
    gsap.fromTo(
      ".header-text",
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
  }, []);

  // Fetch user and salon data
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

  // Normalize status from backend to frontend
  const normalizeStatus = (status) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "SUCCESS":
        return "confirmed";
      case "CANCELLED":
        return "canceled";
      case "PENDING":
        return "pending";
      case "CONFIRMED":
        return "confirmed";
      default:
        return status.toLowerCase();
    }
  };

  // Fetch bookings and enrich with customer and service data
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
                services, // Store full service details for modal
                startTime: new Date(booking.startTime),
                endTime: new Date(booking.endTime),
                status: normalizeStatus(booking.status),
                notes: booking.notes || "Không có ghi chú",
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

  // Filter bookings based on date and status
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

  // Handle booking status change
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await updateBookingStatus(bookingId, newStatus.toUpperCase(), token);
      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      );
      setBookings(updatedBookings);
      toast.success(`Cập nhật trạng thái đặt lịch thành ${newStatus}`);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đặt lịch:", error);
      toast.error(error.message || "Không thể cập nhật trạng thái đặt lịch");
    }
  };

  // Format calendar events for react-big-calendar
  const calendarEvents = filteredBookings.map((booking) => ({
    id: booking.id,
    title: `${booking.customerName} - ${booking.serviceName}`,
    start: booking.startTime,
    end: booking.endTime,
    status: booking.status,
  }));

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-blue-500";
      case "canceled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Calendar event style renderer
  const eventStyleGetter = (event) => {
    let style = {
      borderRadius: "6px",
      opacity: 0.95,
      color: "white",
      border: "0px",
      display: "block",
      fontSize: "0.9rem",
      padding: "4px 8px",
    };

    switch (event.status) {
      case "confirmed":
        style.backgroundColor = "#059669";
        break;
      case "pending":
        style.backgroundColor = "#3B82F6";
        break;
      case "canceled":
        style.backgroundColor = "#EF4444";
        break;
      default:
        style.backgroundColor = "#6B7280";
    }

    return { style };
  };

  // Parse service steps
  const parseSteps = (service) => {
    const names = service.name.split("|");
    const descriptions = service.description.split("|");
    const images = service.image.split("|");
    return names.map((name, index) => ({
      name,
      description: descriptions[index] || "Không có mô tả",
      image: images[index] || "",
    }));
  };

  // Preload images when modal opens
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

  // Status display in Vietnamese
  const getStatusDisplay = (status) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận";
      case "pending":
        return "Đang chờ";
      case "canceled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div className="p-4 min-h-screen bg-gray-900 text-white">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Page Header */}
      <div className="relative z-10 mb-8 text-center" data-aos="fade-up">
        <h1 className="header-text text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500">
          Bảng Điều Khiển Nhân Viên
        </h1>
        <p className="text-gray-300 mt-2">
          Quản lý lịch hẹn và lịch làm việc của bạn
        </p>
      </div>

      {/* Stats Section */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        {[
          {
            title: "Lịch Hẹn Hôm Nay",
            count: bookings.filter((b) =>
              moment(b.startTime).isSame(moment(), "day")
            ).length,
            icon: "clock",
            color: "from-cyan-500 to-blue-500",
          },
          {
            title: "Chờ Xác Nhận",
            count: bookings.filter((b) => b.status === "pending").length,
            icon: "hourglass",
            color: "from-blue-500 to-indigo-500",
          },
          {
            title: "Đã Xác Nhận",
            count: bookings.filter((b) => b.status === "confirmed").length,
            icon: "check",
            color: "from-green-500 to-teal-500",
          },
          {
            title: "Đã Hủy",
            count: bookings.filter((b) => b.status === "canceled").length,
            icon: "x",
            color: "from-red-500 to-pink-500",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-gray-800 rounded-lg p-4 shadow-lg backdrop-blur-sm bg-opacity-80 border border-gray-700"
            data-aos="zoom-in"
            data-aos-delay={`${150 * (idx + 1)}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-300 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.count}</p>
              </div>
              <div
                className={`bg-gradient-to-br ${stat.color} rounded-full p-3 text-white shadow-lg`}
              >
                {stat.icon === "clock" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
                )}
                {stat.icon === "hourglass" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {stat.icon === "check" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {stat.icon === "x" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Controls */}
      <div
        className="mb-6 bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Bộ Lọc Ngày
            </label>
            <select
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Tất Cả Ngày</option>
              <option value="today">Hôm Nay</option>
              <option value="tomorrow">Ngày Mai</option>
              <option value="thisWeek">Tuần Này</option>
              <option value="thisMonth">Tháng Này</option>
              <option value="custom">Khoảng Tùy Chỉnh</option>
            </select>
          </div>

          {dateFilter === "custom" && (
            <>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ngày Bắt Đầu
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={customDateRange.start}
                  onChange={(e) =>
                    setCustomDateRange({
                      ...customDateRange,
                      start: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ngày Kết Thúc
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Trạng Thái
            </label>
            <select
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất Cả Trạng Thái</option>
              <option value="confirmed">Đã Xác Nhận</option>
              <option value="pending">Đang Chờ</option>
              <option value="canceled">Đã Hủy</option>
            </select>
          </div>

          <div className="flex-1 lg:flex-none lg:self-end">
            <div className="flex w-full space-x-2">
              <button
                className={`flex-1 px-4 py-2 rounded-md focus:outline-none transition-colors ${
                  view === "table"
                    ? "bg-cyan-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setView("table")}
              >
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Bảng
                </span>
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-md focus:outline-none transition-colors ${
                  view === "calendar"
                    ? "bg-cyan-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setView("calendar")}
              >
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Lịch
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading || isFetching ? (
        <div className="flex justify-center items-center p-12">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Table View */}
          {view === "table" && (
            <div
              className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              {filteredBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Khách Hàng
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Dịch Vụ
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Ngày & Giờ
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Trạng Thái
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Ghi Chú
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Hành Động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {filteredBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="hover:bg-gray-750 transition-colors"
                          data-aos="fade-right"
                          data-aos-delay="100"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-2">
                                <div className="text-sm font-medium text-white">
                                  {booking.customerName}
                                </div>
                                <div className="text-sm text-gray-300">
                                  {booking.customerPhone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              className="text-sm text-cyan-400 hover:text-cyan-300 bg-gray-700 px-3 py-1 rounded-md"
                              onClick={() => setShowDetails(booking)}
                            >
                              Xem chi tiết
                            </button>
                            <div className="text-xs text-gray-300 mt-1">
                              {moment(booking.endTime).diff(
                                moment(booking.startTime),
                                "minutes"
                              )}{" "}
                              phút
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {moment(booking.startTime).format("D MMMM, YYYY")}
                            </div>
                            <div className="text-xs text-gray-300">
                              {moment(booking.startTime).format("h:mm A")} -{" "}
                              {moment(booking.endTime).format("h:mm A")}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                booking.status
                              )} text-white`}
                            >
                              {getStatusDisplay(booking.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-300 max-w-xs truncate">
                              {booking.notes}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {booking.status === "pending" && (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() =>
                                    handleStatusChange(booking.id, "confirmed")
                                  }
                                  className="text-green-400 hover:text-green-600 transition-colors"
                                  title="Xác nhận"
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
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusChange(booking.id, "canceled")
                                  }
                                  className="text-red-400 hover:text-red-600 transition-colors"
                                  title="Hủy"
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
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )}
                            {booking.status === "confirmed" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(booking.id, "canceled")
                                }
                                className="text-red-400 hover:text-red-600 transition-colors"
                              >
                                Hủy
                              </button>
                            )}
                            {booking.status === "canceled" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(booking.id, "confirmed")
                                }
                                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                              >
                                Khôi phục
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8" data-aos="fade-up">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-cyan-500 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-300">
                    {bookings.length === 0
                      ? "Không tìm thấy lịch làm việc"
                      : "Không tìm thấy lịch hẹn"}
                  </h3>
                  <p className="text-gray-400 mt-1">
                    {bookings.length === 0
                      ? "Bạn không có lịch hẹn nào được lên lịch."
                      : "Hãy thử điều chỉnh bộ lọc để xem thêm kết quả."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Calendar View */}
          {view === "calendar" && (
            <div
              className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4 h-screen max-h-[700px]"
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
                      eventTimeRangeFormat: ({ start, end }) => {
                        return `${moment(start).format("h:mm A")} - ${moment(
                          end
                        ).format("h:mm A")}`;
                      },
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
                      showMore: (total) => `+${total} lịch hẹn nữa`,
                    }}
                  />
                </div>
              ) : (
                <div
                  className="text-center py-8 h-full flex flex-col justify-center"
                  data-aos="fade-up"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-cyan-500 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-300">
                    {bookings.length === 0
                      ? "Không tìm thấy lịch làm việc"
                      : "Không tìm thấy lịch hẹn"}
                  </h3>
                  <p className="text-gray-400 mt-1">
                    {bookings.length === 0
                      ? "Bạn không có lịch hẹn nào được lên lịch."
                      : "Hãy thử điều chỉnh bộ lọc để xem thêm kết quả."}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Service Details Modal */}
      {showDetails && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
          data-aos="zoom-in"
        >
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-8 w-full max-w-[90%] max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-cyan-400 relative">
            <button
              className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-300 text-3xl font-bold transition-colors duration-200"
              onClick={() => setShowDetails(null)}
            >
              ×
            </button>
            <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-cyan-400 to-pink-500 text-transparent bg-clip-text mb-6">
              Chi Tiết Dịch Vụ
            </h2>
            <div className="text-center mb-6">
              <p className="text-lg text-gray-300">
                <strong>Khách hàng:</strong> {showDetails.customerName}
              </p>
              <p className="text-lg text-gray-300">
                <strong>Thời gian:</strong>{" "}
                {moment(showDetails.startTime).format("D MMMM, YYYY, h:mm A")} -{" "}
                {moment(showDetails.endTime).format("h:mm A")}
              </p>
            </div>
            {showDetails.services.map((service, index) => {
              const steps = parseSteps(service);
              return (
                <div key={index} className="mb-8">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                    Dịch Vụ: {service.name.split("|")[0]}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {steps.map((step, stepIndex) => (
                      <div
                        key={stepIndex}
                        className="flex flex-col bg-gray-700 rounded-lg p-4 shadow-md"
                        data-aos="fade-up"
                        data-aos-delay={`${100 * stepIndex}`}
                      >
                        <img
                          src={
                            step.image
                              ? `http://localhost:8083/service-offering-images/${step.image}`
                              : "/placeholder.jpg"
                          }
                          alt={step.name}
                          className="w-full h-48 object-cover rounded-lg mb-4 border-2 border-cyan-300"
                          loading="eager"
                        />
                        <h4 className="text-lg font-semibold text-white mb-2">
                          {stepIndex === 0
                            ? "Dịch Vụ Chính"
                            : `Bước ${stepIndex + 1}`}
                          : {step.name}
                        </h4>
                        <p className="text-gray-300 text-sm italic flex-grow">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <button
              className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={() => setShowDetails(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Custom styles for react-big-calendar */}
      <style jsx>{`
        :global(.salon-calendar) {
          background-color: #1f2937;
          color: white;
          border-radius: 0.75rem;
          padding: 1rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        :global(.salon-calendar .rbc-header) {
          background-color: #374151;
          color: #a5b4fc;
          padding: 10px;
          border-bottom: 1px solid #4b5563;
          text-transform: uppercase;
          font-size: 0.85rem;
          font-weight: 700;
        }
        :global(.salon-calendar .rbc-time-header) {
          background-color: #374151;
          border-bottom: 1px solid #4b5563;
        }
        :global(.salon-calendar .rbc-time-content) {
          background-color: #1f2937;
          border: none;
        }
        :global(.salon-calendar .rbc-timeslot-group) {
          background-color: #1f2937;
          border-bottom: 1px solid #4b5563;
        }
        :global(.salon-calendar .rbc-time-slot) {
          color: #a5b4fc;
          font-size: 0.85rem;
        }
        :global(.salon-calendar .rbc-day-bg) {
          background-color: #1f2937;
          border-left: 1px solid #4b5563;
        }
        :global(.salon-calendar .rbc-day-bg.rbc-today) {
          background-color: #374151;
        }
        :global(.salon-calendar .rbc-event) {
          padding: 6px 10px;
          font-size: 0.9rem;
          border-radius: 6px;
          transition: transform 0.2s ease;
        }
        :global(.salon-calendar .rbc-event:hover) {
          transform: scale(1.02);
        }
        :global(.salon-calendar .rbc-month-view) {
          background-color: #1f2937;
        }
        :global(.salon-calendar .rbc-month-row) {
          border-top: 1px solid #4b5563;
        }
        :global(.salon-calendar .rbc-date-cell) {
          color: #e5e7eb;
          padding: 10px;
        }
        :global(.salon-calendar .rbc-off-range) {
          color: #6b7280;
        }
        :global(.salon-calendar .rbc-off-range-bg) {
          background-color: #374151;
        }
        :global(.salon-calendar .rbc-today) {
          background-color: #374151;
        }
        :global(.salon-calendar .rbc-btn-group button) {
          background-color: #4b5563;
          color: #e5e7eb;
          border: 1px solid #6b7280;
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 0.9rem;
        }
        :global(.salon-calendar .rbc-btn-group button:hover) {
          background-color: #6b7280;
          color: #ffffff;
        }
        :global(.salon-calendar .rbc-btn-group button.rbc-active) {
          background-color: #3b82f6;
          color: #ffffff;
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default Homestaff;
