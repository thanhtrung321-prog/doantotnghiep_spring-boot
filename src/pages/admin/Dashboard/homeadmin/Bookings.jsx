import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Scissors,
  DollarSign,
  Tag,
  Plus,
  X,
  Edit,
  Star,
  List,
  Eye,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import {
  fetchBookings,
  fetchServices,
  updateBookingStatus,
  createBooking,
  saveBooking,
  fetchBookingsByCustomerId,
  fetchBookingById,
  fetchBookedSlots,
  fetchSalonReport,
  fetchCustomerDetails,
  fetchBookingRating,
} from "../../api/apiadmin/bookingadmin";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const Bookings = () => {
  const [salonId, setSalonId] = useState("");
  const [salons, setSalons] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [services, setServices] = useState({});
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [newBooking, setNewBooking] = useState({
    customerId: "",
    staffId: "",
    startTime: null,
    endTime: null,
    serviceIds: [],
    totalPrice: 0,
  });
  const [editBookingId, setEditBookingId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [ratingData, setRatingData] = useState({ rating: 0, comment: "" });
  const [staffList, setStaffList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [revenueChartData, setRevenueChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Convert date to Asia/Ho_Chi_Minh local date string (yyyy-MM-dd)
  const toLocalDateString = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    }); // Returns yyyy-MM-dd
  };

  // Format date to Asia/Ho_Chi_Minh with 24h format (HH:mm, dd/MM/yyyy)
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date
      .toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Ho_Chi_Minh",
      })
      .replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2})/, "$4, $1/$2/$3");
  };

  // Fetch salons and staff on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [salonResponse, staffResponse] = await Promise.all([
          axios.get("http://localhost:8084/salon"),
          axios.get("http://localhost:8082/user", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);
        setSalons(salonResponse.data || []);
        setStaffList(
          staffResponse.data.filter((u) => u.role === "STAFF") || []
        );
        if (salonResponse.data.length > 0) {
          setSalonId(salonResponse.data[0].id.toString());
        }
      } catch (error) {
        toast.error("Không thể tải dữ liệu ban đầu");
      }
    };
    fetchInitialData();
  }, []);

  // Fetch bookings, services, and calculate stats when salonId changes
  useEffect(() => {
    if (!salonId) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedBookings, fetchedServices] = await Promise.all([
          fetchBookings(salonId),
          fetchServices(salonId),
        ]);
        const bookingsArray = Array.isArray(fetchedBookings)
          ? fetchedBookings
          : [];
        setBookings(bookingsArray);
        setFilteredBookings(bookingsArray);
        setServices(fetchedServices || {});
        // Fetch customer details
        const customerIds = [
          ...new Set(bookingsArray.map((booking) => booking.customerId)),
        ];
        const customerData = await Promise.all(
          customerIds.map((id) => fetchCustomerDetails(id))
        );
        const customerMap = customerData.reduce((map, customer) => {
          map[customer.id] =
            customer.fullName ||
            customer.username ||
            `Khách hàng ${customer.id}`;
          return map;
        }, {});
        setCustomers(customerMap);
        // Calculate stats
        setTotalBookings(bookingsArray.length);
        const revenue = bookingsArray
          .filter((booking) =>
            ["SUCCESS", "COMPLETED"].includes(booking.status.toUpperCase())
          )
          .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        setTotalRevenue(revenue);
        const completed = bookingsArray.filter(
          (booking) => booking.status.toUpperCase() === "COMPLETED"
        ).length;
        setCompletedBookings(completed);
        // Main chart data (bookings and revenue by date)
        const bookingsByDate = bookingsArray.reduce((acc, booking) => {
          const date = toLocalDateString(new Date(booking.startTime));
          if (!acc[date]) {
            acc[date] = { count: 0, revenue: 0 };
          }
          acc[date].count += 1;
          if (["SUCCESS", "COMPLETED"].includes(booking.status.toUpperCase())) {
            acc[date].revenue += booking.totalPrice || 0;
          }
          return acc;
        }, {});
        const labels = Object.keys(bookingsByDate)
          .sort()
          .map((date) =>
            new Date(date).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              timeZone: "Asia/Ho_Chi_Minh",
            })
          );
        const counts = Object.keys(bookingsByDate)
          .sort()
          .map((date) => bookingsByDate[date].count);
        const revenues = Object.keys(bookingsByDate)
          .sort()
          .map((date) => bookingsByDate[date].revenue);
        setChartData({
          labels,
          datasets: [
            {
              label: "Số lượng đặt lịch",
              data: counts,
              backgroundColor: [
                "rgba(255, 99, 132, 0.6)",
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 206, 86, 0.6)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
              ],
              borderWidth: 1,
            },
            {
              label: "Doanh thu (VND)",
              data: revenues,
              backgroundColor: [
                "rgba(255, 159, 64, 0.6)",
                "rgba(255, 99, 132, 0.6)",
                "rgba(54, 162, 235, 0.6)",
              ],
              borderColor: [
                "rgba(255, 159, 64, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
              ],
              borderWidth: 1,
            },
          ],
        });
        // Revenue chart data (PENDING, CONFIRMED, SUCCESS, COMPLETED, CANCELLED)
        const pendingRevenue = bookingsArray
          .filter((booking) => booking.status.toUpperCase() === "PENDING")
          .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        const confirmedRevenue = bookingsArray
          .filter((booking) => booking.status.toUpperCase() === "CONFIRMED")
          .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        const successRevenue = bookingsArray
          .filter((booking) => booking.status.toUpperCase() === "SUCCESS")
          .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        const completedRevenue = bookingsArray
          .filter((booking) => booking.status.toUpperCase() === "COMPLETED")
          .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        const cancelledRevenue = bookingsArray
          .filter((booking) => booking.status.toUpperCase() === "CANCELLED")
          .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        setRevenueChartData({
          labels: [
            "Chờ xử lý",
            "Đã xác nhận",
            "Thành công",
            "Hoàn thành",
            "Đã hủy",
          ],
          datasets: [
            {
              label: "Doanh thu (VND)",
              data: [
                pendingRevenue,
                confirmedRevenue,
                successRevenue,
                completedRevenue,
                cancelledRevenue,
              ],
              backgroundColor: [
                "rgba(255, 206, 86, 0.6)", // PENDING
                "rgba(75, 192, 192, 0.6)", // CONFIRMED
                "rgba(54, 162, 235, 0.6)", // SUCCESS
                "rgba(153, 102, 255, 0.6)", // COMPLETED
                "rgba(255, 99, 132, 0.6)", // CANCELLED
              ],
              borderColor: [
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 99, 132, 1)",
              ],
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        toast.error(error.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [salonId]);

  // Fetch booked slots when dateFilter changes
  useEffect(() => {
    if (!salonId || !dateFilter) return;
    const loadSlots = async () => {
      try {
        const formattedDate = toLocalDateString(dateFilter);
        const slots = await fetchBookedSlots(salonId, formattedDate);
        setBookedSlots(slots || []);
      } catch (error) {
        toast.error(error.message || "Không thể tải lịch đặt");
      }
    };
    loadSlots();
  }, [salonId, dateFilter]);

  // Handle search and filter
  useEffect(() => {
    let result = Array.isArray(bookings) ? bookings : [];
    if (searchQuery) {
      result = result.filter(
        (booking) =>
          booking.id.toString().includes(searchQuery) ||
          customers[booking.customerId]
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter) {
      result = result.filter(
        (booking) => booking.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (dateFilter) {
      const selectedDate = toLocalDateString(dateFilter);
      result = result.filter(
        (booking) =>
          toLocalDateString(new Date(booking.startTime)) === selectedDate
      );
    }
    setFilteredBookings(result);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter, bookings, customers]);

  // Handle show all bookings
  const handleShowAllBookings = () => {
    setDateFilter(null);
    let result = Array.isArray(bookings) ? bookings : [];
    if (searchQuery) {
      result = result.filter(
        (booking) =>
          booking.id.toString().includes(searchQuery) ||
          customers[booking.customerId]
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter) {
      result = result.filter(
        (booking) => booking.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    setFilteredBookings(result);
    setCurrentPage(1);
    toast.info("Hiển thị tất cả đặt lịch");
  };

  // Handle status update
  const handleStatusUpdate = async (bookingId, status) => {
    try {
      const updatedBooking = await updateBookingStatus(bookingId, status);
      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId ? updatedBooking : booking
      );
      setBookings(updatedBookings);
      setFilteredBookings(updatedBookings);
      // Update selectedBooking if it's the one being edited
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(updatedBooking);
      }
      // Recalculate revenue and completed bookings
      const revenue = updatedBookings
        .filter((booking) =>
          ["SUCCESS", "COMPLETED"].includes(booking.status.toUpperCase())
        )
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      setTotalRevenue(revenue);
      const completed = updatedBookings.filter(
        (booking) => booking.status.toUpperCase() === "COMPLETED"
      ).length;
      setCompletedBookings(completed);
      // Update revenue chart
      const pendingRevenue = updatedBookings
        .filter((booking) => booking.status.toUpperCase() === "PENDING")
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      const confirmedRevenue = updatedBookings
        .filter((booking) => booking.status.toUpperCase() === "CONFIRMED")
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      const successRevenue = updatedBookings
        .filter((booking) => booking.status.toUpperCase() === "SUCCESS")
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      const completedRevenue = updatedBookings
        .filter((booking) => booking.status.toUpperCase() === "COMPLETED")
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      const cancelledRevenue = updatedBookings
        .filter((booking) => booking.status.toUpperCase() === "CANCELLED")
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      setRevenueChartData({
        labels: [
          "Chờ xử lý",
          "Đã xác nhận",
          "Thành công",
          "Hoàn thành",
          "Đã hủy",
        ],
        datasets: [
          {
            label: "Doanh thu (VND)",
            data: [
              pendingRevenue,
              confirmedRevenue,
              successRevenue,
              completedRevenue,
              cancelledRevenue,
            ],
            backgroundColor: [
              "rgba(255, 206, 86, 0.6)", // PENDING
              "rgba(75, 192, 192, 0.6)", // CONFIRMED
              "rgba(54, 162, 235, 0.6)", // SUCCESS
              "rgba(153, 102, 255, 0.6)", // COMPLETED
              "rgba(255, 99, 132, 0.6)", // CANCELLED
            ],
            borderColor: [
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 99, 132, 1)",
            ],
            borderWidth: 1,
          },
        ],
      });
      setShowEditStatusModal(false);
      toast.success(
        `Đơn #${bookingId} đã ${
          status === "COMPLETED" ? "hoàn thành" : status.toLowerCase()
        }`
      );
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật trạng thái");
    }
  };

  // Handle create booking
  const handleCreateBooking = async () => {
    if (
      !newBooking.customerId ||
      !newBooking.staffId ||
      !newBooking.startTime ||
      !newBooking.endTime ||
      newBooking.serviceIds.length === 0
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    try {
      const bookingRequest = {
        startTime: newBooking.startTime.toISOString(),
        endTime: newBooking.endTime.toISOString(),
        staffId: Number(newBooking.staffId),
        serviceIds: newBooking.serviceIds.map(Number),
        totalPrice: Number(newBooking.totalPrice),
      };
      const createdBooking = await createBooking(
        salonId,
        newBooking.customerId,
        bookingRequest
      );
      const bookingDTO = {
        id: createdBooking.id,
        salonId: Number(salonId),
        customerId: Number(newBooking.customerId),
        staffId: Number(newBooking.staffId),
        totalPrice: Number(newBooking.totalPrice),
        startTime: newBooking.startTime.toISOString(),
        endTime: newBooking.endTime.toISOString(),
        serviceIds: newBooking.serviceIds.map(Number),
        status: "PENDING",
      };
      await saveBooking(bookingDTO);
      const updatedBookings = [...bookings, createdBooking];
      setBookings(updatedBookings);
      setFilteredBookings(updatedBookings);
      setTotalBookings(updatedBookings.length);
      const revenue = updatedBookings
        .filter((booking) =>
          ["SUCCESS", "COMPLETED"].includes(booking.status.toUpperCase())
        )
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      setTotalRevenue(revenue);
      const completed = updatedBookings.filter(
        (booking) => booking.status.toUpperCase() === "COMPLETED"
      ).length;
      setCompletedBookings(completed);
      // Update revenue chart
      const pendingRevenue = updatedBookings
        .filter((booking) => booking.status.toUpperCase() === "PENDING")
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      const confirmedRevenue = updatedBookings
        .filter((booking) => booking.status.toUpperCase() === "CONFIRMED")
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      const successRevenue = updatedBookings
        .filter((booking) => booking.status.toUpperCase() === "SUCCESS")
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      const completedRevenue = updatedBookings
        .filter((booking) => booking.status.toUpperCase() === "COMPLETED")
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      const cancelledRevenue = updatedBookings
        .filter((booking) => booking.status.toUpperCase() === "CANCELLED")
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      setRevenueChartData({
        labels: [
          "Chờ xử lý",
          "Đã xác nhận",
          "Thành công",
          "Hoàn thành",
          "Đã hủy",
        ],
        datasets: [
          {
            label: "Doanh thu (VND)",
            data: [
              pendingRevenue,
              confirmedRevenue,
              successRevenue,
              completedRevenue,
              cancelledRevenue,
            ],
            backgroundColor: [
              "rgba(255, 206, 86, 0.6)", // PENDING
              "rgba(75, 192, 192, 0.6)", // CONFIRMED
              "rgba(54, 162, 235, 0.6)", // SUCCESS
              "rgba(153, 102, 255, 0.6)", // COMPLETED
              "rgba(255, 99, 132, 0.6)", // CANCELLED
            ],
            borderColor: [
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 99, 132, 1)",
            ],
            borderWidth: 1,
          },
        ],
      });
      setShowCreateModal(false);
      setNewBooking({
        customerId: "",
        staffId: "",
        startTime: null,
        endTime: null,
        serviceIds: [],
        totalPrice: 0,
      });
      toast.success("Tạo đặt lịch thành công");
    } catch (error) {
      toast.error(error.message || "Không thể tạo đặt lịch");
    }
  };

  // Fetch rating for a booking
  const handleFetchRating = async (bookingId) => {
    try {
      const data = await fetchBookingRating(bookingId);
      setRatingData(data || { rating: 0, comment: "" });
      setShowRatingModal(true);
    } catch (error) {
      toast.error(error.message || "Không thể tải đánh giá");
    }
  };

  // Handle view booking details
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-indigo-100 text-indigo-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 w-full">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-6">
        Quản lý đặt lịch
      </h1>

      {/* Salon selection and report button */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="w-full md:w-1/3">
          <label
            htmlFor="salonId"
            className="block text-sm font-medium text-gray-200"
          >
            Chọn salon
          </label>
          <select
            id="salonId"
            value={salonId}
            onChange={(e) => setSalonId(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          >
            {salons.length === 0 ? (
              <option value="">Đang tải salon...</option>
            ) : (
              salons.map((salon) => (
                <option key={salon.id} value={salon.id}>
                  {salon.name} (ID: {salon.id})
                </option>
              ))
            )}
          </select>
        </div>
        <button
          onClick={() => setShowReport(!showReport)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
        >
          {showReport ? "Ẩn báo cáo" : "Xem báo cáo"}
        </button>
      </div>

      {/* Report display */}
      {showReport && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 rounded-xl shadow-2xl mb-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-2xl font-semibold text-purple-300 mb-4">
              Báo cáo salon
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-gray-300">
                  Tổng đặt lịch
                </p>
                <p className="text-2xl font-bold text-purple-400">
                  {totalBookings}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-gray-300">Doanh thu</p>
                <p className="text-2xl font-bold text-pink-400">
                  {totalRevenue.toLocaleString("vi-VN")} VND
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-gray-300">
                  Đặt lịch hoàn thành
                </p>
                <p className="text-2xl font-bold text-cyan-400">
                  {completedBookings}
                </p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <h4 className="text-lg font-semibold text-gray-200 mb-2">
              Doanh thu theo trạng thái
            </h4>
            <div className="max-w-md">
              <Bar
                data={revenueChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top", labels: { color: "white" } },
                    title: {
                      display: true,
                      text: "Doanh thu theo trạng thái (VND)",
                      color: "white",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { color: "white" },
                      grid: { color: "rgba(255, 255, 255, 0.1)" },
                    },
                    x: {
                      ticks: { color: "white" },
                      grid: { color: "rgba(255, 255, 255, 0.1)" },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main chart */}
      <div className="bg-gray-800 text-white p-6 rounded-xl shadow-2xl mb-6">
        <h3 className="text-xl font-semibold text-purple-300 mb-4">
          Thống kê đặt lịch và doanh thu
        </h3>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Pie
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top", labels: { color: "white" } },
                  title: {
                    display: true,
                    text: "Phân bố đặt lịch và doanh thu theo ngày",
                    color: "white",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Search, filter, and calendar toggle */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo ID đặt lịch hoặc tên khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 border border-gray-300 bg-gray-800 text-white rounded-md"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="SUCCESS">Thành công</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
          <DatePicker
            selected={dateFilter}
            onChange={(date) => setDateFilter(date)}
            dateFormat="dd/MM/yyyy"
            locale={vi}
            placeholderText="Chọn ngày"
            className="py-2 px-3 border border-gray-300 bg-gray-800 text-white rounded-md"
          />
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
          >
            {showCalendar ? "Ẩn lịch" : "Xem lịch"}
          </button>
          <button
            onClick={handleShowAllBookings}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition"
          >
            <List className="h-5 w-5 mr-2" />
            Xem tất cả
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition"
          >
            <Plus className="h-5 w-5 mr-2" />
            Thêm đặt lịch
          </button>
        </div>
      </div>

      {/* Calendar view for booked slots */}
      {showCalendar && (
        <div className="bg-gray-800 text-white p-6 rounded-xl shadow-2xl mb-6">
          <h3 className="text-xl font-semibold text-purple-300 mb-4">
            Lịch đặt
          </h3>
          {dateFilter ? (
            bookedSlots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {bookedSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-700 rounded-lg flex items-center"
                  >
                    <Clock className="h-5 w-5 mr-2 text-gray-400" />
                    {formatDateTime(slot.startTime)} -{" "}
                    {formatDateTime(slot.endTime)}
                  </div>
                ))}
              </div>
            ) : (
              <p>Không có lịch đặt cho ngày này.</p>
            )
          ) : (
            <p>Vui lòng chọn ngày để xem lịch đặt.</p>
          )}
        </div>
      )}

      {/* Booking table */}
      <div className="overflow-x-auto bg-gray-800 text-white rounded-xl shadow-2xl">
        <table className="min-w-full divide-y divide-gray-700 table-fixed">
          <thead className="bg-gray-900">
            <tr>
              <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="w-2/12 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="w-2/12 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Thời gian bắt đầu
              </th>
              <th className="w-2/12 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Thời gian kết thúc
              </th>
              <th className="w-2/12 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Nhân viên
              </th>
              <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Hành động
              </th>
              <th className="w-2/12 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Dịch vụ
              </th>
              <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Đánh giá
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td
                  colSpan="10"
                  className="px-6 py-4 text-center text-gray-400"
                >
                  Đang tải...
                </td>
              </tr>
            ) : currentBookings.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  className="px-6 py-4 text-center text-gray-400"
                >
                  Không tìm thấy đặt lịch
                </td>
              </tr>
            ) : (
              currentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    #{booking.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div className="flex items-center truncate">
                      <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {customers[booking.customerId] || booking.customerId}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDateTime(booking.startTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDateTime(booking.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div className="flex items-center truncate">
                      <Scissors className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {staffList.find((s) => s.id === booking.staffId)
                          ?.fullName || `Nhân viên ${booking.staffId}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status === "PENDING"
                        ? "Chờ xử lý"
                        : booking.status === "CONFIRMED"
                        ? "Đã xác nhận"
                        : booking.status === "SUCCESS"
                        ? "Thành công"
                        : booking.status === "COMPLETED"
                        ? "Hoàn thành"
                        : booking.status === "CANCELLED"
                        ? "Đã hủy"
                        : booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      {(booking.totalPrice || 0).toLocaleString("vi-VN")} đ
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditBookingId(booking.id);
                          setNewStatus(booking.status);
                          setShowEditStatusModal(true);
                        }}
                        className="text-purple-400 hover:text-purple-300"
                        title="Chỉnh sửa trạng thái"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="text-cyan-400 hover:text-cyan-300"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div className="flex items-center truncate">
                      <Tag className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {booking.serviceIds
                          .map((id) => services[id] || `Dịch vụ ${id}`)
                          .join(", ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleFetchRating(booking.id)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-700 bg-gray-800 text-white px-4 py-3 sm:px-6 mt-4 rounded-xl shadow-2xl">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
          >
            Trước
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-300">
              Hiển thị{" "}
              <span className="font-medium">{indexOfFirstItem + 1}</span> đến{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredBookings.length)}
              </span>{" "}
              của <span className="font-medium">{filteredBookings.length}</span>{" "}
              kết quả
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-600 hover:bg-gray-600 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === page
                        ? "text-white bg-purple-600"
                        : "text-gray-300 ring-1 ring-inset ring-gray-600 hover:bg-gray-600"
                    } focus:z-20`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-600 hover:bg-gray-600 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                Sau
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Create booking modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-xl max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-300">
                Tạo đặt lịch mới
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  ID khách hàng
                </label>
                <input
                  type="text"
                  value={newBooking.customerId}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, customerId: e.target.value })
                  }
                  className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 text-white rounded-md"
                  placeholder="Nhập ID khách hàng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Nhân viên
                </label>
                <select
                  value={newBooking.staffId}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, staffId: e.target.value })
                  }
                  className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 text-white rounded-md"
                >
                  <option value="">Chọn nhân viên</option>
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.fullName ||
                        staff.username ||
                        `Nhân viên ${staff.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Thời gian bắt đầu
                </label>
                <DatePicker
                  selected={newBooking.startTime}
                  onChange={(date) =>
                    setNewBooking({ ...newBooking, startTime: date })
                  }
                  showTimeSelect
                  dateFormat="dd/MM/yyyy HH:mm"
                  locale={vi}
                  timeZone="Asia/Ho_Chi_Minh"
                  className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 text-white rounded-md"
                  placeholderText="Chọn thời gian bắt đầu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray- dejamos de 300">
                  Thời gian kết thúc
                </label>
                <DatePicker
                  selected={newBooking.endTime}
                  onChange={(date) =>
                    setNewBooking({ ...newBooking, endTime: date })
                  }
                  showTimeSelect
                  dateFormat="dd/MM/yyyy HH:mm"
                  locale={vi}
                  timeZone="Asia/Ho_Chi_Minh"
                  className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 text-white rounded-md"
                  placeholderText="Chọn thời gian kết thúc"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Dịch vụ
                </label>
                <select
                  multiple
                  value={newBooking.serviceIds}
                  onChange={(e) =>
                    setNewBooking({
                      ...newBooking,
                      serviceIds: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      ),
                    })
                  }
                  className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 text-white rounded-md"
                >
                  {Object.entries(services).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Tổng tiền (VND)
                </label>
                <input
                  type="number"
                  value={newBooking.totalPrice}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, totalPrice: e.target.value })
                  }
                  className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 text-white rounded-md"
                  placeholder="Nhập tổng tiền"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateBooking}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit status modal */}
      {showEditStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-300">
                Cập nhật trạng thái đơn #{editBookingId}
              </h2>
              <button
                onClick={() => setShowEditStatusModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Trạng thái mới
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 text-white rounded-md"
                >
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="SUCCESS">Thành công</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowEditStatusModal(false)}
                className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={() => handleStatusUpdate(editBookingId, newStatus)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 rounded-xl max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-300">
                Chi tiết đặt lịch #{selectedBooking.id}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  ID đặt lịch
                </label>
                <p className="mt-1 text-sm text-gray-400">
                  #{selectedBooking.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Khách hàng
                </label>
                <p className="mt-1 text-sm text-gray-400">
                  {customers[selectedBooking.customerId] ||
                    selectedBooking.customerId}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Thời gian bắt đầu
                </label>
                <p className="mt-1 text-sm text-gray-400">
                  {formatDateTime(selectedBooking.startTime)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Thời gian kết thúc
                </label>
                <p className="mt-1 text-sm text-gray-400">
                  {formatDateTime(selectedBooking.endTime)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Nhân viên
                </label>
                <p className="mt-1 text-sm text-gray-400">
                  {staffList.find((s) => s.id === selectedBooking.staffId)
                    ?.fullName || `Nhân viên ${selectedBooking.staffId}`}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Trạng thái
                </label>
                <p className="mt-1 text-sm text-gray-400">
                  {selectedBooking.status === "PENDING"
                    ? "Chờ xử lý"
                    : selectedBooking.status === "CONFIRMED"
                    ? "Đã xác nhận"
                    : selectedBooking.status === "SUCCESS"
                    ? "Thành công"
                    : selectedBooking.status === "COMPLETED"
                    ? "Hoàn thành"
                    : selectedBooking.status === "CANCELLED"
                    ? "Đã hủy"
                    : selectedBooking.status}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Tổng tiền
                </label>
                <p className="mt-1 text-sm text-gray-400">
                  {(selectedBooking.totalPrice || 0).toLocaleString("vi-VN")} đ
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Dịch vụ
                </label>
                <p className="mt-1 text-sm text-gray-400">
                  {selectedBooking.serviceIds
                    .map((id) => services[id] || `Dịch vụ ${id}`)
                    .join(", ")}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-300">Đánh giá</h2>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Số sao
                </label>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < ratingData.rating
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Nhận xét
                </label>
                <p className="mt-1 text-sm text-gray-400">
                  {ratingData.comment || "Không có nhận xét"}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowRatingModal(false)}
                className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Bookings;
