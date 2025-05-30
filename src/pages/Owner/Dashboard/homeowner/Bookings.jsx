import React, { useState, useEffect, useCallback, useRef } from "react";
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
  ChevronUp,
  ChevronDown,
  Info,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale";
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
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { gsap } from "gsap";
import {
  fetchBookings,
  fetchServices,
  updateBookingStatus,
  createBooking,
  fetchBookedSlots,
  fetchCustomerDetails,
  fetchBookingRating,
  fetchAvailableSlots,
  fetchCategories,
  fetchSalonDetails,
  fetchCustomers,
  createPayment,
  updateBooking,
  deleteBooking,
  fetchStaffBySalon,
  fetchCategoriesBySalon,
} from "../../Dashboard/api/bookingowner";
import { getImageUrl } from "../../Dashboard/api/servicesowner";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-6 text-red-400">
          Đã xảy ra lỗi. Vui lòng làm mới trang.
        </div>
      );
    }
    return this.props.children;
  }
}

const Bookings = () => {
  const [salonId, setSalonId] = useState(null); // Khởi tạo null, sẽ set từ user data
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [services, setServices] = useState({});
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerMap, setCustomerMap] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [salonDetails, setSalonDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [showEditBookingModal, setShowEditBookingModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCustomerDetailModal, setShowCustomerDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showServiceDetailModal, setShowServiceDetailModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [detailDisplayMode, setDetailDisplayMode] = useState("slider");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [newBooking, setNewBooking] = useState({
    customerId: "",
    staffId: "",
    startTime: null,
    endTime: null,
    serviceIds: [],
    totalPrice: 0,
  });
  const [editBooking, setEditBooking] = useState({
    id: null,
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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [revenueChartData, setRevenueChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [calendarStaffFilter, setCalendarStaffFilter] = useState("");

  const tableRowRefs = useRef([]);

  // Utility functions
  const formatLocalDateTime = (date) => {
    if (!date) return "";
    return date
      .toLocaleString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(" ", "T")
      .replace(/(\d{2}:\d{2}:\d{2})/, "$1");
  };

  const toLocalDateString = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

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

  const parseServiceSteps = (service) => {
    if (!service.name || !service.image) {
      return [
        {
          name: "Dịch vụ không tên",
          description: service.description || "Không có mô tả",
          image: "default.jpg",
        },
      ];
    }
    const names = service.name.split("|");
    const descriptions = service.description?.split("|") || [];
    const images = service.image.split("|");
    return names.map((name, index) => ({
      name: name || "Không có tên",
      description: descriptions[index] || "Không có mô tả",
      image: images[index] || "default.jpg",
    }));
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Lấy user data từ localStorage
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        }
        const user = JSON.parse(storedUser);
        if (user.role !== "OWNER" || !user.salonId) {
          throw new Error("Người dùng không phải chủ salon hoặc thiếu salonId.");
        }
        setSalonId(user.salonId);

        // Fetch dữ liệu ban đầu
        const [salonData, customerData, staffData] = await Promise.all([
          fetch(`http://localhost:8084/salon/${user.salonId}`)
            .then((response) => {
              if (!response.ok) throw new Error("Không thể tải thông tin salon");
              return response.json();
            }),
          fetchCustomers(),
          fetchStaffBySalon(user.salonId),
        ]);
        setSalonDetails(salonData || {});
        setCustomers(customerData || []);
        setStaffList(staffData || []);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error(error.message || "Không thể tải dữ liệu ban đầu");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch staff and categories when salonId changes
  useEffect(() => {
    if (!salonId) return;
    const fetchStaffAndCategories = async () => {
      try {
        const [staffData, categoriesData] = await Promise.all([
          fetchStaffBySalon(salonId),
          fetchCategoriesBySalon(salonId),
        ]);
        setStaffList(staffData || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error fetching staff or categories:", error);
        toast.error("Không thể tải danh sách nhân viên hoặc danh mục");
      }
    };
    fetchStaffAndCategories();
  }, [salonId]);

  // Fetch bookings, services, categories, and salon details
  useEffect(() => {
    if (!salonId) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedBookings, fetchedServices, fetchedCategories] = await Promise.all([
          fetchBookings(salonId),
          fetchServices(salonId),
          fetchCategories(salonId),
        ]);
        const bookingsArray = Array.isArray(fetchedBookings) ? fetchedBookings : [];
        setBookings(bookingsArray);
        setFilteredBookings(bookingsArray);
        setServices(fetchedServices || {});
        setCategories(fetchedCategories || []);
        const customerIds = [...new Set(bookingsArray.map((booking) => booking.customerId))];
        const customerData = await Promise.all(customerIds.map((id) => fetchCustomerDetails(id)));
        const newCustomerMap = customerData.reduce((map, customer) => {
          map[customer.id] = customer.fullName || customer.username || `Khách hàng ${customer.id}`;
          return map;
        }, {});
        setCustomerMap(newCustomerMap);
        updateChartsAndStats(bookingsArray);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error(error.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [salonId]);

  // GSAP Animations
  useEffect(() => {
    tableRowRefs.current.forEach((row, index) => {
      if (row) {
        gsap.fromTo(
          row,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: index * 0.1,
            ease: "power2.out",
          }
        );
      }
    });
  }, [filteredBookings]);

  useEffect(() => {
    if (showDetailModal) {
      gsap.fromTo(
        ".booking-detail-modal",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [showDetailModal]);

  useEffect(() => {
    if (showCreateModal) {
      gsap.fromTo(
        ".create-booking-modal",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [showCreateModal]);

  useEffect(() => {
    if (showEditBookingModal) {
      gsap.fromTo(
        ".edit-booking-modal",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [showEditBookingModal]);

  useEffect(() => {
    if (showDeleteModal) {
      gsap.fromTo(
        ".delete-booking-modal",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [showDeleteModal]);

  useEffect(() => {
    if (showCustomerDetailModal) {
      gsap.fromTo(
        ".customer-detail-modal",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [showCustomerDetailModal]);

  useEffect(() => {
    if (showServiceDetailModal) {
      gsap.fromTo(
        ".service-detail-modal",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [showServiceDetailModal]);

  // Delete Booking Handler
  const handleDeleteBooking = async (bookingId) => {
    setActionLoading(true);
    try {
      await deleteBooking(bookingId);
      const updatedBookings = bookings.filter((booking) => booking.id !== bookingId);
      setBookings(updatedBookings);
      setFilteredBookings(updatedBookings);
      updateChartsAndStats(updatedBookings);
      setShowDeleteModal(false);
      setSelectedBookingId(null);
      toast.success(`Đã xóa đặt lịch #${bookingId}`);
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error(error.message || "Không thể xóa đặt lịch");
    } finally {
      setActionLoading(false);
    }
  };

  // Update charts and stats
  const updateChartsAndStats = (updatedBookings) => {
    setTotalBookings(updatedBookings.length);
    const revenue = updatedBookings
      .filter((booking) => ["SUCCESS", "COMPLETED"].includes(booking.status.toUpperCase()))
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    setTotalRevenue(revenue);
    const completed = updatedBookings.filter(
      (booking) => booking.status.toUpperCase() === "COMPLETED"
    ).length;
    setCompletedBookings(completed);
    const statusCounts = updatedBookings.reduce((acc, booking) => {
      const status = booking.status.toUpperCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    setChartData({
      labels: ["Chờ xử lý", "Đã xác nhận", "Thành công", "Hoàn thành", "Đã hủy"],
      datasets: [
        {
          label: "Số lượng đặt lịch",
          data: [
            statusCounts.PENDING || 0,
            statusCounts.CONFIRMED || 0,
            statusCounts.SUCCESS || 0,
            statusCounts.COMPLETED || 0,
            statusCounts.CANCELLED || 0,
          ],
          backgroundColor: [
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 99, 132, 0.6)",
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
      labels: ["Chờ xử lý", "Đã xác nhận", "Thành công", "Hoàn thành", "Đã hủy"],
      datasets: [
        {
          label: "Doanh thu (VND)",
          data: [pendingRevenue, confirmedRevenue, successRevenue, completedRevenue, cancelledRevenue],
          backgroundColor: [
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 99, 132, 0.6)",
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
  };

  // Handle status update
  const handleStatusUpdate = async (bookingId, status) => {
    setActionLoading(true);
    try {
      const updatedBooking = await updateBookingStatus(bookingId, status);
      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId ? updatedBooking : booking
      );
      setBookings(updatedBookings);
      setFilteredBookings(updatedBookings);
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(updatedBooking);
      }
      updateChartsAndStats(updatedBookings);
      setShowEditStatusModal(false);
      toast.success(
        `Đơn #${bookingId} đã ${status === "COMPLETED" ? "hoàn thành" : status.toLowerCase()}`
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Không thể cập nhật trạng thái");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle create booking
  const handleCreateBooking = async () => {
    if (
      !newBooking.customerId ||
      !newBooking.staffId ||
      !newBooking.startTime ||
      !newBooking.endTime ||
      newBooking.serviceIds.length === 0 ||
      newBooking.totalPrice <= 0
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin và đảm bảo tổng tiền hợp lệ");
      return;
    }
    if (newBooking.endTime <= newBooking.startTime) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }
    setActionLoading(true);
    try {
      const bookingRequest = {
        startTime: formatLocalDateTime(newBooking.startTime),
        endTime: formatLocalDateTime(newBooking.endTime),
        staffId: Number(newBooking.staffId),
        serviceIds: newBooking.serviceIds.map(Number),
        totalPrice: Number(newBooking.totalPrice),
      };
      const createdBooking = await createBooking(salonId, newBooking.customerId, bookingRequest);
      const paymentRequest = {
        user: {
          id: Number(newBooking.staffId),
          fullname: staffList.find((s) => s.id === Number(newBooking.staffId))?.fullName || "Nhân viên",
          email: staffList.find((s) => s.id === Number(newBooking.staffId))?.email || "",
        },
        booking: {
          id: createdBooking.id,
          salonId: Number(salonId),
          totalPrice: Number(newBooking.totalPrice),
          startTime: formatLocalDateTime(newBooking.startTime),
          endTime: formatLocalDateTime(newBooking.endTime),
        },
      };
      await createPayment(paymentRequest);
      const updatedBookings = [...bookings, createdBooking];
      setBookings(updatedBookings);
      setFilteredBookings(updatedBookings);
      updateChartsAndStats(updatedBookings);
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
      console.error("Error creating booking:", error);
      toast.error(error.message || "Không thể tạo đặt lịch");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit booking
  const handleEditBooking = async () => {
    if (
      !editBooking.staffId ||
      !editBooking.startTime ||
      !editBooking.endTime ||
      editBooking.serviceIds.length === 0 ||
      editBooking.totalPrice <= 0
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin và đảm bảo tổng tiền hợp lệ");
      return;
    }
    if (editBooking.endTime <= editBooking.startTime) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }
    setActionLoading(true);
    try {
      const bookingRequest = {
        startTime: formatLocalDateTime(editBooking.startTime),
        endTime: formatLocalDateTime(editBooking.endTime),
        staffId: Number(editBooking.staffId),
        serviceIds: editBooking.serviceIds.map(Number),
        totalPrice: Number(editBooking.totalPrice),
      };
      const updatedBooking = await updateBooking(editBooking.id, bookingRequest);
      const updatedBookings = bookings.map((booking) =>
        booking.id === editBooking.id
          ? {
              ...booking,
              ...updatedBooking,
              startTime: bookingRequest.startTime,
              endTime: bookingRequest.endTime,
              staffId: bookingRequest.staffId,
              serviceIds: bookingRequest.serviceIds,
              totalPrice: bookingRequest.totalPrice,
            }
          : booking
      );
      setBookings(updatedBookings);
      setFilteredBookings(updatedBookings);
      if (selectedBooking && selectedBooking.id === editBooking.id) {
        setSelectedBooking({
          ...selectedBooking,
          ...updatedBooking,
          startTime: bookingRequest.startTime,
          endTime: bookingRequest.endTime,
          staffId: bookingRequest.staffId,
          serviceIds: bookingRequest.serviceIds,
          totalPrice: bookingRequest.totalPrice,
        });
      }
      updateChartsAndStats(updatedBookings);
      setShowEditBookingModal(false);
      setEditBooking({
        id: null,
        customerId: "",
        staffId: "",
        startTime: null,
        endTime: null,
        serviceIds: [],
        totalPrice: 0,
      });
      toast.success(`Đã cập nhật đặt lịch #${editBooking.id}`);
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error(error.message || "Không thể cập nhật đặt lịch");
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch slots for booking
  const fetchSlotsForBooking = useCallback(
    async (staffId, startTime) => {
      if (!staffId || !startTime || !salonDetails) return;
      try {
        const formattedDate = toLocalDateString(startTime);
        const slots = await fetchAvailableSlots(salonId, staffId, formattedDate);
        const openingTime = salonDetails.openingTime.split(":");
        const closingTime = salonDetails.closingTime.split(":");
        const openingHour = parseInt(openingTime[0]);
        const openingMinute = parseInt(openingTime[1]);
        const closingHour = parseInt(closingTime[0]);
        const closingMinute = parseInt(closingTime[1]);
        const filteredSlots = slots.filter((slot) => {
          const start = new Date(slot.startTime);
          const end = new Date(slot.endTime);
          const startHour = start.getHours();
          const startMinute = start.getMinutes();
          const endHour = end.getHours();
          const endMinute = end.getMinutes();
          return (
            (startHour > openingHour ||
              (startHour === openingHour && startMinute >= openingMinute)) &&
            (endHour < closingHour ||
              (endHour === closingHour && endMinute <= closingMinute))
          );
        });
        setAvailableSlots(filteredSlots || []);
      } catch (error) {
        console.error("Error fetching slots:", error);
        toast.error("Không thể tải khung giờ trống");
      }
    },
    [salonId, salonDetails]
  );

  useEffect(() => {
    fetchSlotsForBooking(newBooking.staffId, newBooking.startTime);
  }, [newBooking.staffId, newBooking.startTime, fetchSlotsForBooking]);

  useEffect(() => {
    fetchSlotsForBooking(editBooking.staffId, editBooking.startTime);
  }, [editBooking.staffId, editBooking.startTime, fetchSlotsForBooking]);

  // Handle service selection
  useEffect(() => {
    const total = newBooking.serviceIds.reduce((sum, id) => {
      return sum + (services[id]?.price || 0);
    }, 0);
    setNewBooking((prev) => ({ ...prev, totalPrice: total }));
  }, [newBooking.serviceIds, services]);

  useEffect(() => {
    const total = editBooking.serviceIds.reduce((sum, id) => {
      return sum + (services[id]?.price || 0);
    }, 0);
    setEditBooking((prev) => ({ ...prev, totalPrice: total }));
  }, [editBooking.serviceIds, services]);

  // Handle fetch rating
  const handleFetchRating = async (bookingId) => {
    try {
      const data = await fetchBookingRating(bookingId);
      setRatingData(data || { rating: 0, comment: "" });
      setShowRatingModal(true);
    } catch (error) {
      console.error("Error fetching rating:", error);
      toast.error(error.message || "Không thể tải đánh giá");
    }
  };

  // Handle view booking details
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  // Handle view customer details
  const handleViewCustomerDetails = async (customerId) => {
    try {
      const customer = await fetchCustomerDetails(customerId);
      setSelectedCustomer(customer);
      setShowCustomerDetailModal(true);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast.error("Không thể tải thông tin khách hàng");
    }
  };

  // Handle view service details
  const handleViewServiceDetails = (service) => {
    setSelectedService(service);
    setShowServiceDetailModal(true);
  };

  // Handle open edit booking modal
  const handleOpenEditBooking = (booking) => {
    setEditBooking({
      id: booking.id,
      customerId: booking.customerId.toString(),
      staffId: booking.staffId.toString(),
      startTime: new Date(booking.startTime),
      endTime: new Date(booking.endTime),
      serviceIds: booking.serviceIds,
      totalPrice: booking.totalPrice,
    });
    setShowEditBookingModal(true);
    setShowDetailModal(false);
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

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Handle show all bookings
  const handleShowAllBookings = () => {
    setDateFilter(null);
    setStatusFilter("");
    setSearchQuery("");
    setFilteredBookings(bookings);
    setCurrentPage(1);
    toast.info("Hiển thị tất cả đặt lịch");
  };

  // Fetch booked and available slots
  useEffect(() => {
    if (!salonId || !dateFilter) return;
    const loadSlots = async () => {
      try {
        const formattedDate = toLocalDateString(dateFilter);
        const [booked, available] = await Promise.all([
          fetchBookedSlots(salonId, formattedDate),
          calendarStaffFilter
            ? fetchAvailableSlots(salonId, calendarStaffFilter, formattedDate)
            : Promise.resolve([]),
        ]);
        setBookedSlots(booked || []);
        setAvailableSlots(available || []);
      } catch (error) {
        console.error("Error loading slots:", error);
        toast.error(error.message || "Không thể tải lịch đặt");
      }
    };
    loadSlots();
  }, [salonId, dateFilter, calendarStaffFilter]);

  // Handle search and filter
  useEffect(() => {
    let result = Array.isArray(bookings) ? bookings : [];
    if (searchQuery) {
      result = result.filter(
        (booking) =>
          booking.id.toString().includes(searchQuery) ||
          customerMap[booking.customerId]?.toLowerCase().includes(searchQuery.toLowerCase())
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
        (booking) => toLocalDateString(new Date(booking.startTime)) === selectedDate
      );
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === "startTime") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    setFilteredBookings(result);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter, bookings, customerMap, sortConfig]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      buttons.push(1);
      if (startPage > 2) buttons.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) buttons.push("...");
      buttons.push(totalPages);
    }

    return buttons;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 w-full">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-6">
          Quản lý đặt lịch
        </h1>
        {/* Report button */}
        <div className="flex justify-end mb-6">
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
                  <p className="text-sm font-medium text-gray-300">Tổng đặt lịch</p>
                  <p className="text-2xl font-bold text-purple-400">{totalBookings}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-300">Doanh thu</p>
                  <p className="text-2xl font-bold text-pink-400">{totalRevenue.toLocaleString("vi-VN")} VND</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-300">Đặt lịch hoàn thành</p>
                  <p className="text-2xl font-bold text-cyan-400">{completedBookings}</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3">
              <h4 className="text-lg font-semibold text-gray-200 mb-2">Doanh thu theo trạng thái</h4>
              <div className="max-w-md">
                <Bar
                  data={revenueChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top", labels: { color: "white" } },
                      title: { display: true, text: "Doanh thu theo trạng thái (VND)", color: "white" },
                    },
                    scales: {
                      y: { beginAtZero: true, ticks: { color: "white" }, grid: { color: "rgba(255, 255, 255, 0.1)" } },
                      x: { ticks: { color: "white" }, grid: { color: "rgba(255, 255, 255, 0.1)" } },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {/* Main chart */}
        <div className="bg-gray-800 text-white p-6 rounded-xl shadow-2xl mb-6">
          <h3 className="text-xl font-semibold text-purple-300 mb-4">Thống kê đặt lịch theo trạng thái</h3>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <Pie
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top", labels: { color: "white" } },
                    title: { display: true, text: "Phân bố đặt lịch theo trạng thái", color: "white" },
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
        {/* Calendar view */}
        {showCalendar && (
          <div className="bg-gray-800 text-white p-6 rounded-xl shadow-2xl mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-purple-300">Lịch đặt và khung giờ trống</h3>
              <select
                value={calendarStaffFilter}
                onChange={(e) => setCalendarStaffFilter(e.target.value)}
                className="py-2 px-3 border border-gray-300 bg-gray-700 text-white rounded-md"
              >
                <option value="">Tất cả nhân viên</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName || staff.username || `Nhân viên ${staff.id}`}
                  </option>
                ))}
              </select>
            </div>
            {dateFilter ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-200">Lịch đã đặt</h4>
                  {bookedSlots.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {bookedSlots
                        .filter(
                          (slot) => !calendarStaffFilter || slot.staffId === Number(calendarStaffFilter)
                        )
                        .map((slot, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-700 rounded-lg flex items-center"
                          >
                            <Clock className="h-5 w-5 mr-2 text-gray-400" />
                            {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)} (Nhân viên:{" "}
                            {staffList.find((s) => s.id === slot.staffId)?.fullName || `ID ${slot.staffId}`})
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p>Không có lịch đặt cho ngày này.</p>
                  )}
                </div>
                {calendarStaffFilter && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-200">Khung giờ trống</h4>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {availableSlots.map((slot, index) => (
                          <div
                            key={index}
                            className="p-3 bg-green-700 rounded-lg flex items-center"
                          >
                            <Clock className="h-5 w-5 mr-2 text-gray-200" />
                            {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Không có khung giờ trống cho nhân viên này.</p>
                    )}
                  </div>
                )}
              </div>
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
                <th
                  className="w-[8%] px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  ID
                  {sortConfig.key === "id" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="inline h-4 w-4" />
                    ) : (
                      <ChevronDown className="inline h-4 w-4" />
                    ))}
                </th>
                <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th
                  className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("startTime")}
                >
                  Thời gian bắt đầu
                  {sortConfig.key === "startTime" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="inline h-4 w-4" />
                    ) : (
                      <ChevronDown className="inline h-4 w-4" />
                    ))}
                </th>
                <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Thời gian kết thúc
                </th>
                <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th
                  className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("totalPrice")}
                >
                  Tổng tiền
                  {sortConfig.key === "totalPrice" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="inline h-4 w-4" />
                    ) : (
                      <ChevronDown className="inline h-4 w-4" />
                    ))}
                </th>
                <th className="w-[12%] px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Hành động
                </th>
                <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Dịch vụ
                </th>
                <th className="w-[5%] px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Đánh giá
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-4 text-center text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              ) : currentBookings.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-4 text-center text-gray-400">
                    Không tìm thấy đặt lịch
                  </td>
                </tr>
              ) : (
                currentBookings.map((booking, index) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-700"
                    ref={(el) => (tableRowRefs.current[index] = el)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      #{booking.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="flex items-center truncate">
                        <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{customerMap[booking.customerId] || booking.customerId}</span>
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
                          {staffList.find((s) => s.id === booking.staffId)?.fullName || `Nhân viên ${booking.staffId}`}
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
                          onClick={() => handleOpenEditBooking(booking)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Chỉnh sửa đặt lịch"
                          disabled={actionLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditBookingId(booking.id);
                            setNewStatus(booking.status);
                            setShowEditStatusModal(true);
                          }}
                          className="text-purple-400 hover:text-purple-300"
                          title="Chỉnh sửa trạng thái"
                          disabled={actionLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBookingId(booking.id);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-400 hover:text-red-300"
                          title="Xóa đặt lịch"
                          disabled={actionLoading}
                        >
                          <X className="h-4 w-4" />
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
                            .map((id) => services[id]?.name || `Dịch vụ ${id}`)
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
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-700 bg-gray-800 text-white px-4 py-3 sm:px-6 mt-4 rounded-xl shadow-2xl">
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <span className="text-sm text-gray-300">Hiển thị</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-2 border border-gray-600 bg-gray-700 text-white rounded-md"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-300">mỗi trang</span>
          </div>
          <div className="flex-1 flex items-center justify-between sm:justify-end">
            <div>
              <p className="text-sm text-gray-300">
                Hiển thị <span className="font-medium">{indexOfFirstItem + 1}</span> đến{" "}
                <span className="font-medium">{Math.min(indexOfLastItem, filteredBookings.length)}</span>{" "}
                của <span className="font-medium">{filteredBookings.length}</span> kết quả
              </p>
            </div>
            <div className="ml-4">
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-600 hover:bg-gray-600 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  Trước
                </button>
                {getPaginationButtons().map((button, index) =>
                  button === "..." ? (
                    <span
                      key={index}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-300"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={index}
                      onClick={() => paginate(button)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === button ? "text-white bg-purple-600" : "text-gray-300 bg-gray-700 hover:bg-gray-600"
                      } ring-1 ring-inset ring-gray-600 focus:z-20 focus:outline-offset-0`}
                    >
                      {button}
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
        {/* Create Booking Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="create-booking-modal bg-gray-800 text-white p-6 rounded-lg shadow-2xl w-full max-w-3xl overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-800 z-10">
                <h2 className="text-2xl font-bold text-purple-300">Tạo đặt lịch mới</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200">Khách hàng</label>
                  <select
                    value={newBooking.customerId}
                    onChange={(e) => setNewBooking({ ...newBooking, customerId: e.target.value })}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-700 text-white rounded-md"
                  >
                    <option value="">Chọn khách hàng</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.fullName || customer.username || `Khách hàng ${customer.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Nhân viên</label>
                  <select
                    value={newBooking.staffId}
                    onChange={(e) => setNewBooking({ ...newBooking, staffId: e.target.value })}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-700 text-white rounded-md"
                  >
                    <option value="">Chọn nhân viên</option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.fullName || staff.username || `Nhân viên ${staff.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Danh mục dịch vụ</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-700 text-white rounded-md"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Dịch vụ</label>
                  <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto bg-gray-700 p-2 rounded-md">
                    {Object.values(services)
                      .filter((service) => !selectedCategory || service.categoryId === Number(selectedCategory))
                      .map((service) => {
                        const steps = parseServiceSteps(service);
                        const firstStep = steps[0];
                        return (
                          <div
                            key={service.id}
                            className="flex items-center space-x-2 p-2 bg-gray-600 rounded-md"
                          >
                            <input
                              type="checkbox"
                              value={service.id}
                              checked={newBooking.serviceIds.includes(service.id)}
                              onChange={(e) => {
                                const id = Number(e.target.value);
                                setNewBooking((prev) => ({
                                  ...prev,
                                  serviceIds: prev.serviceIds.includes(id)
                                    ? prev.serviceIds.filter((sid) => sid !== id)
                                    : [...prev.serviceIds, id],
                                }));
                              }}
                              className="h-4 w-4 text-purple-600 bg-gray-700 border-gray-300 rounded"
                            />
                            <img
                              src={getImageUrl(firstStep.image)}
                              alt={firstStep.name}
                              className="w-12 h-12 object-cover rounded-md cursor-pointer"
                              onError={(e) => (e.target.src = "/public/placeholder.png")}
                              onClick={() => handleViewServiceDetails(service)}
                            />
                            <span className="text-gray-200">
                              {firstStep.name} ({service.price.toLocaleString("vi-VN")} đ)
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Ngày bắt đầu</label>
                  <DatePicker
                    selected={newBooking.startTime}
                    onChange={(date) => setNewBooking({ ...newBooking, startTime: date })}
                    dateFormat="dd/MM/yyyy"
                    locale={vi}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-700 text-white rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Khung giờ trống</label>
                  <select
                    value={newBooking.startTime ? formatLocalDateTime(newBooking.startTime) : ""}
                    onChange={(e) => {
                      const selectedSlot = availableSlots.find((slot) => slot.startTime === e.target.value);
                      if (selectedSlot) {
                        setNewBooking({
                          ...newBooking,
                          startTime: new Date(selectedSlot.startTime),
                          endTime: new Date(selectedSlot.endTime),
                        });
                      }
                    }}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-700 text-white rounded-md"
                  >
                    <option value="">Chọn khung giờ</option>
                    {availableSlots.map((slot, index) => (
                      <option key={index} value={slot.startTime}>
                        {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Tổng tiền</label>
                  <input
                    type="number"
                    value={newBooking.totalPrice}
                    readOnly
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-700 text-white rounded-md"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateBooking}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50"
                >
                  {actionLoading ? "Đang tạo..." : "Tạo đặt lịch"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Edit Status Modal */}
        {showEditStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-2xl w-full max-w-md overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-purple-300">Cập nhật trạng thái đặt lịch #{editBookingId}</h2>
                <button
                  onClick={() => setShowEditStatusModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">Trạng thái mới</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-700 text-white rounded-md"
                >
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="SUCCESS">Thành công</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setShowEditStatusModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleStatusUpdate(editBookingId, newStatus)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                >
                  {actionLoading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Edit Booking Modal */}
        {showEditBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="edit-booking-modal bg-gray-800 text-white p-6 rounded-lg shadow-2xl w-full max-w-3xl overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-800 z-10">
                <h2 className="text-2xl font-bold text-purple-300">Chỉnh sửa đặt lịch #{editBooking.id}</h2>
                <button
                  onClick={() => setShowEditBookingModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200">Nhân viên</label>
                  <select
                    value={editBooking.staffId}
                    onChange={(e) => setEditBooking({ ...editBooking, staffId: e.target.value })}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-700 text-white rounded-md"
                  >
                    <option value="">Chọn nhân viên</option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.fullName || staff.username || `Nhân viên ${staff.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Danh mục dịch vụ</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-700 text-white rounded-md"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Dịch vụ</label>
                  <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto bg-gray-700 p-2 rounded-md">
                    {Object.values(services)
                      .filter((service) => !selectedCategory || service.categoryId === Number(selectedCategory))
                      .map((service) => {
                        const steps = parseServiceSteps(service);
                        const firstStep = steps[0];
                        return (
                          <div
                            key={service.id}
                            className="flex items-center space-x-2 p-2 bg-gray-600 rounded-md"
                          >
                            <input
                              type="checkbox"
                              value={service.id}
                              checked={editBooking.serviceIds.includes(service.id)}
                              onChange={(e) => {
                                const id = Number(e.target.value);
                                setEditBooking((prev) => ({
                                  ...prev,
                                  serviceIds: prev.serviceIds.includes(id)
                                    ? prev.serviceIds.filter((sid) => sid !== id)
                                    : [...prev.serviceIds, id],
                                }));
                              }}
                              className="h-4 w-4 text-purple-600 bg-gray-700 border-gray-300 rounded"
                            />
                            <img
                              src={getImageUrl(firstStep.image)}
                              alt={firstStep.name}
                              className="w-12 h-12 object-cover rounded-md cursor-pointer"
                              onError={(e) => (e.target.src = "/public/placeholder.png")}
                              onClick={() => handleViewServiceDetails(service)}
                            />
                            <span className="text-gray-200">
                              {firstStep.name} ({service.price.toLocaleString("vi-VN")} đ)
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Ngày bắt đầu</label>
                  <DatePicker
                    selected={editBooking.startTime}
                    onChange={(date) => setEditBooking({ ...editBooking, startTime: date })}
                    dateFormat="dd/MM/yyyy"
                    locale={vi}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-700 text-white rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Khung giờ trống</label>
                  <select
                    value={editBooking.startTime ? formatLocalDateTime(editBooking.startTime) : ""}
                    onChange={(e) => {
                      const selectedSlot = availableSlots.find((slot) => slot.startTime === e.target.value);
                      if (selectedSlot) {
                        setEditBooking({
                          ...editBooking,
                          startTime: new Date(selectedSlot.startTime),
                          endTime: new Date(selectedSlot.endTime),
                        });
                      }
                    }}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-700 text-white rounded-md"
                  >
                    <option value="">Chọn khung giờ</option>
                    {availableSlots.map((slot, index) => (
                      <option key={index} value={slot.startTime}>
                        {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Tổng tiền</label>
                  <input
                    type="number"
                    value={editBooking.totalPrice}
                    readOnly
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-700 text-white rounded-md"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setShowEditBookingModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={handleEditBooking}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50"
                >
                  {actionLoading ? "Đang cập nhật..." : "Cập nhật đặt lịch"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-purple-300">Đánh giá đặt lịch</h2>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                             <label className="block text-sm font-medium text-gray-200">Điểm đánh giá</label>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 ${star <= ratingData.rating ? "text-yellow-400" : "text-gray-400"}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Nhận xét</label>
                  <textarea
                    value={ratingData.comment || ""}
                    readOnly
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-700 text-white rounded-md"
                    rows={4}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Booking Detail Modal */}
        {showDetailModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="booking-detail-modal bg-gray-800 text-white p-6 rounded-lg shadow-2xl w-full max-w-4xl overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-800 z-10">
                <h2 className="text-2xl font-bold text-purple-300">Chi tiết đặt lịch #{selectedBooking.id}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">Thông tin khách hàng</h3>
                    <p className="mt-2 text-gray-300">
                      <span className="font-medium">Tên:</span>{" "}
                      {customerMap[selectedBooking.customerId] || `Khách hàng ${selectedBooking.customerId}`}
                    </p>
                    <button
                      onClick={() => handleViewCustomerDetails(selectedBooking.customerId)}
                      className="mt-2 text-cyan-400 hover:text-cyan-300"
                    >
                      Xem chi tiết khách hàng
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">Thông tin đặt lịch</h3>
                    <p className="mt-2 text-gray-300">
                      <span className="font-medium">Thời gian bắt đầu:</span>{" "}
                      {formatDateTime(selectedBooking.startTime)}
                    </p>
                    <p className="mt-2 text-gray-300">
                      <span className="font-medium">Thời gian kết thúc:</span>{" "}
                      {formatDateTime(selectedBooking.endTime)}
                    </p>
                    <p className="mt-2 text-gray-300">
                      <span className="font-medium">Nhân viên:</span>{" "}
                      {staffList.find((s) => s.id === selectedBooking.staffId)?.fullName || `Nhân viên ${selectedBooking.staffId}`}
                    </p>
                    <p className="mt-2 text-gray-300">
                      <span className="font-medium">Trạng thái:</span>{" "}
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
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
                      </span>
                    </p>
                    <p className="mt-2 text-gray-300">
                      <span className="font-medium">Tổng tiền:</span>{" "}
                      {selectedBooking.totalPrice.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">Dịch vụ đã chọn</h3>
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => setDetailDisplayMode(detailDisplayMode === "slider" ? "grid" : "slider")}
                      className="text-gray-300 hover:text-gray-200"
                    >
                      {detailDisplayMode === "slider" ? "Chuyển sang lưới" : "Chuyển sang slider"}
                    </button>
                  </div>
                  {detailDisplayMode === "slider" ? (
                    <Slider {...sliderSettings}>
                      {selectedBooking.serviceIds.map((serviceId) => {
                        const service = services[serviceId];
                        if (!service) return null;
                        const steps = parseServiceSteps(service);
                        return steps.map((step, index) => (
                          <div key={`${serviceId}-${index}`} className="px-2">
                            <div className="bg-gray-700 p-4 rounded-lg">
                              <img
                                src={getImageUrl(step.image)}
                                alt={step.name}
                                className="w-full h-48 object-cover rounded-md mb-4"
                                onError={(e) => (e.target.src = "/public/placeholder.png")}
                              />
                              <h4 className="text-lg font-semibold text-gray-200">{step.name}</h4>
                              <p className="text-gray-300">{step.description}</p>
                              <p className="text-gray-300 mt-2">Giá: {service.price.toLocaleString("vi-VN")} đ</p>
                              <button
                                onClick={() => handleViewServiceDetails(service)}
                                className="mt-2 text-cyan-400 hover:text-cyan-300"
                              >
                                Xem chi tiết dịch vụ
                              </button>
                            </div>
                          </div>
                        ));
                      })}
                    </Slider>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedBooking.serviceIds.map((serviceId) => {
                        const service = services[serviceId];
                        if (!service) return null;
                        const steps = parseServiceSteps(service);
                        return steps.map((step, index) => (
                          <div key={`${serviceId}-${index}`} className="bg-gray-700 p-4 rounded-lg">
                            <img
                              src={getImageUrl(step.image)}
                              alt={step.name}
                              className="w-full h-48 object-cover rounded-md mb-4"
                              onError={(e) => (e.target.src = "/public/placeholder.png")}
                            />
                            <h4 className="text-lg font-semibold text-gray-200">{step.name}</h4>
                            <p className="text-gray-300">{step.description}</p>
                            <p className="text-gray-300 mt-2">Giá: {service.price.toLocaleString("vi-VN")} đ</p>
                            <button
                              onClick={() => handleViewServiceDetails(service)}
                              className="mt-2 text-cyan-400 hover:text-cyan-300"
                            >
                              Xem chi tiết dịch vụ
                            </button>
                          </div>
                        ));
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => handleOpenEditBooking(selectedBooking)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Customer Detail Modal */}
        {showCustomerDetailModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="customer-detail-modal bg-gray-800 text-white p-6 rounded-lg shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-purple-300">Chi tiết khách hàng</h2>
                <button
                  onClick={() => setShowCustomerDetailModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-300">
                  <span className="font-medium">ID:</span> {selectedCustomer.id}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Tên:</span>{" "}
                  {selectedCustomer.fullName || selectedCustomer.username || "N/A"}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Email:</span>{" "}
                  {selectedCustomer.email || "N/A"}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Số điện thoại:</span>{" "}
                  {selectedCustomer.phoneNumber || "N/A"}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Địa chỉ:</span>{" "}
                  {selectedCustomer.address || "N/A"}
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowCustomerDetailModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Service Detail Modal */}
        {showServiceDetailModal && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="service-detail-modal bg-gray-800 text-white p-6 rounded-lg shadow-2xl w-full max-w-4xl overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-800 z-10">
                <h2 className="text-2xl font-bold text-purple-300">Chi tiết dịch vụ: {selectedService.name.split("|")[0]}</h2>
                <button
                  onClick={() => setShowServiceDetailModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-6">
                <Slider {...sliderSettings}>
                  {parseServiceSteps(selectedService).map((step, index) => (
                    <div key={index} className="px-2">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <img
                          src={getImageUrl(step.image)}
                          alt={step.name}
                          className="w-full h-64 object-cover rounded-md mb-4"
                          onError={(e) => (e.target.src = "/public/placeholder.png")}
                        />
                        <h4 className="text-lg font-semibold text-gray-200">{step.name}</h4>
                        <p className="text-gray-300">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </Slider>
                <div>
                  <h3 className="text-lg font-semibold text-gray-200">Thông tin chung</h3>
                  <p className="mt-2 text-gray-300">
                    <span className="font-medium">Giá:</span>{" "}
                    {selectedService.price.toLocaleString("vi-VN")} đ
                  </p>
                  <p className="mt-2 text-gray-300">
                    <span className="font-medium">Danh mục:</span>{" "}
                    {categories.find((c) => c.id === selectedService.categoryId)?.name || "N/A"}
                  </p>
                  <p className="mt-2 text-gray-300">
                    <span className="font-medium">Thời gian thực hiện:</span>{" "}
                    {selectedService.duration || "N/A"} phút
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowServiceDetailModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="delete-booking-modal bg-gray-800 text-white p-6 rounded-lg shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-purple-300">Xác nhận xóa</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-300">Bạn có chắc chắn muốn xóa đặt lịch #{selectedBookingId}?</p>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDeleteBooking(selectedBookingId)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 disabled:opacity-50"
                >
                  {actionLoading ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Toast Container */}
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
          theme="dark"
        />
      </div>
    </ErrorBoundary>
  );
};

export default Bookings;