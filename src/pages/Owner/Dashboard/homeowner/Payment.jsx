import React, {
  useState,
  useEffect,
  useRef,
  lazy,
  Suspense,
  startTransition,
} from "react";
import {
  Search,
  Download,
  DollarSign,
  CreditCard,
  User,
  Calendar,
  Store,
  CheckCircle,
  XCircle,
  Clock,
  PieChart,
} from "lucide-react";
import Chart from "chart.js/auto";
import AOS from "aos";
import "aos/dist/aos.css";
import { gsap } from "gsap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchPayments,
  fetchSalonDetails,
  fetchUserDetails,
  formatCurrency,
  getPaymentMethodLabel,
  exportPaymentsToExcel,
  getChartData,
  getStatsChartData,
  updatePaymentStatus,
} from "../../Dashboard/api/paymentowner";
import { getUserById } from "../../Dashboard/api/Usersstaffowner";

// Lazy load components
const SalonLoadingScreen = lazy(() =>
  import("../../Dashboard/homeowner/Loadingowner")
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center text-red-500 p-8">
          <p className="text-xl font-semibold">Đã xảy ra lỗi</p>
          <p>{this.state.error?.message || "Vui lòng thử lại sau."}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [originalPayments, setOriginalPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    successRate: 0,
    bookingCount: 0,
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [salonDetails, setSalonDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [salonId, setSalonId] = useState(null);
  const paymentsPerPage = 5;

  // Refs
  const searchInputRef = useRef(null);
  const headerRef = useRef(null);
  const statsRef = useRef([]);
  const tableRef = useRef(null);
  const modalRef = useRef(null);
  const chartRef = useRef(null);
  const statsChartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const statsChartInstanceRef = useRef(null);
  const noResultsRef = useRef(null);

  // Handle pagination
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(
    indexOfFirstPayment,
    indexOfLastPayment
  );
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  // Fetch salonId and payments with 1.5-second loading delay
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      try {
        // Fetch salonId
        const userId = localStorage.getItem("userId");
        if (!userId) {
          throw new Error("Không tìm thấy userId trong localStorage.");
        }
        const userData = await getUserById(userId);
        if (!userData.salonId) {
          throw new Error("Không tìm thấy salonId trong dữ liệu người dùng.");
        }

        // Fetch payments
        const { payments, stats } = await fetchPayments(userData.salonId);

        // Update state after 1.5-second delay
        setTimeout(() => {
          if (isMounted) {
            startTransition(() => {
              setSalonId(userData.salonId);
              setPayments(payments);
              setFilteredPayments(payments);
              setOriginalPayments(payments);
              setStats({ ...stats, bookingCount: payments.length });
              setIsLoading(false);
            });
          }
        }, 1500);
      } catch (err) {
        console.error("Lỗi khi khởi tạo dữ liệu:", err);
        if (isMounted) {
          startTransition(() => {
            setIsLoading(false);
          });
          toast.error("Không thể tải dữ liệu ban đầu.");
        }
      }
    };

    AOS.init({ duration: 800, easing: "ease-out", once: true });
    initializeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // GSAP animations for header, stats, table, and no-results
  useEffect(() => {
    if (!isLoading) {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -50 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
      }

      statsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: index * 0.2,
              ease: "power2.out",
            }
          );
        }
      });

      if (tableRef.current) {
        gsap.fromTo(
          tableRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
      }

      if (
        noResultsRef.current &&
        filteredPayments.length === 0 &&
        searchQuery
      ) {
        gsap.fromTo(
          noResultsRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
      }
    }
  }, [isLoading, filteredPayments, searchQuery]);

  // Handle search and sorting
  useEffect(() => {
    let sortedPayments = [...payments];
    switch (sortOption) {
      case "amountAsc":
        sortedPayments.sort((a, b) => a.amount - b.amount);
        break;
      case "amountDesc":
        sortedPayments.sort((a, b) => b.amount - a.amount);
        break;
      case "idAsc":
        sortedPayments.sort((a, b) => a.id - b.id);
        break;
      case "idDesc":
        sortedPayments.sort((a, b) => b.id - b.id);
        break;
      case "default":
      default:
        sortedPayments = [...originalPayments];
        break;
    }

    const filtered = sortedPayments.filter((payment) => {
      const salonName = payment.salon_name ? String(payment.salon_name) : "";
      const userName = payment.user_name || "";
      const paymentMethod = getPaymentMethodLabel(payment.payment_method) || "";
      const paymentId = payment.id ? String(payment.id) : "";
      return (
        paymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    startTransition(() => {
      setFilteredPayments(filtered);
      setCurrentPage(1);
    });

    if (searchQuery && filtered.length > 0 && searchInputRef.current) {
      searchInputRef.current.focus();
      gsap.to(searchInputRef.current, {
        boxShadow:
          "0 0 10px rgba(124, 58, 237, 0.7), 0 0 20px rgba(0, 0, 255, 0.5)",
        duration: 0.5,
        ease: "power2.out",
      });
    } else if (searchInputRef.current) {
      gsap.to(searchInputRef.current, {
        boxShadow: "none",
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [searchQuery, sortOption, payments, originalPayments]);

  // Stats chart
  useEffect(() => {
    if (statsChartRef.current && !isLoading) {
      if (statsChartInstanceRef.current) {
        statsChartInstanceRef.current.destroy();
      }

      const ctx = statsChartRef.current.getContext("2d");
      statsChartInstanceRef.current = new Chart(ctx, {
        type: "bar",
        data: getStatsChartData(stats),
        options: {
          scales: {
            y: { beginAtZero: true, display: false },
            x: { display: false },
          },
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "Thống kê",
              color: "#fff",
              font: { size: 14 },
            },
          },
          maintainAspectRatio: false,
        },
      });
    }

    return () => {
      if (statsChartInstanceRef.current) {
        statsChartInstanceRef.current.destroy();
      }
    };
  }, [stats, isLoading]);

  // Payment chart
  useEffect(() => {
    if (isChartModalOpen && chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      chartInstanceRef.current = new Chart(ctx, {
        type: "bar",
        data: getChartData(filteredPayments),
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: "Số tiền (VND)", color: "#fff" },
            },
            x: {
              title: { display: true, text: "Mã thanh toán", color: "#fff" },
            },
          },
          plugins: {
            legend: { display: true },
            title: {
              display: true,
              text: "Biểu đồ doanh thu thanh toán",
              color: "#fff",
            },
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [isChartModalOpen, filteredPayments]);

  // Modal animations
  useEffect(() => {
    if (
      (isDetailModalOpen || isUserModalOpen || isChartModalOpen) &&
      modalRef.current
    ) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, y: 100, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(2)" }
      );
    }
  }, [isDetailModalOpen, isUserModalOpen, isChartModalOpen]);

  const handleViewDetails = async (payment) => {
    startTransition(() => {
      setSelectedPayment(payment);
      setNewPaymentStatus(payment.status.toLowerCase());
      setIsDetailModalOpen(true);
    });
    try {
      const [salon, user] = await Promise.all([
        fetchSalonDetails(payment.salon_id),
        fetchUserDetails(payment.user_id),
      ]);
      startTransition(() => {
        setSalonDetails(salon);
        setUserDetails(user);
      });
    } catch (error) {
      toast.error("Không thể tải chi tiết salon hoặc người dùng");
    }
  };

  const handleViewUserDetails = async () => {
    if (selectedPayment) {
      try {
        const user = await fetchUserDetails(selectedPayment.user_id);
        startTransition(() => {
          setUserDetails(user);
          setIsUserModalOpen(true);
        });
      } catch (error) {
        toast.error("Lỗi khi tải chi tiết người dùng");
      }
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!selectedPayment || !newPaymentStatus) return;
    try {
      const updatedPayment = await updatePaymentStatus(
        selectedPayment.id,
        newPaymentStatus.toUpperCase()
      );
      startTransition(() => {
        setPayments((prev) =>
          prev.map((payment) =>
            payment.id === selectedPayment.id
              ? { ...payment, status: updatedPayment.status.toLowerCase() }
              : payment
          )
        );
        setFilteredPayments((prev) =>
          prev.map((payment) =>
            payment.id === selectedPayment.id
              ? { ...payment, status: updatedPayment.status.toLowerCase() }
              : payment
          )
        );
        setOriginalPayments((prev) =>
          prev.map((payment) =>
            payment.id === selectedPayment.id
              ? { ...payment, status: updatedPayment.status.toLowerCase() }
              : payment
          )
        );
        setStats((prev) => {
          const newSuccessCount =
            newPaymentStatus.toLowerCase() === "success" &&
            selectedPayment.status !== "success"
              ? prev.successRate * prev.totalTransactions + 1
              : prev.successRate * prev.totalTransactions;
          return {
            ...prev,
            totalRevenue:
              newPaymentStatus.toLowerCase() === "success" &&
              selectedPayment.status !== "success"
                ? prev.totalRevenue + selectedPayment.amount
                : prev.totalRevenue,
            successRate:
              prev.totalTransactions > 0
                ? (newSuccessCount / prev.totalTransactions) * 100
                : 0,
          };
        });
        setIsDetailModalOpen(false);
      });
      toast.success("Cập nhật trạng thái thanh toán thành công");
    } catch (error) {
      toast.error(`Không thể cập nhật trạng thái thanh toán: ${error.message}`);
    }
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case "credit_card":
        return <CreditCard className="h-5 w-5" />;
      case "momo":
        return (
          <div className="h-5 w-5 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            M
          </div>
        );
      case "bank_transfer":
        return <DollarSign className="h-5 w-5" />;
      case "zalopay":
        return (
          <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            Z
          </div>
        );
      case "cash":
        return <DollarSign className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const isHighlighted = (payment) => {
    if (!searchQuery) return false;
    const salonName = payment.salon_name ? String(payment.salon_name) : "";
    const userName = payment.user_name || "";
    const paymentMethod = getPaymentMethodLabel(payment.payment_method) || "";
    const paymentId = payment.id ? String(payment.id) : "";
    return (
      paymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSearch = () => {
    startTransition(() => {
      setSearchQuery(searchTerm);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      startTransition(() => {
        setSearchQuery(searchTerm);
      });
    }
  };

  const handleSortChange = (e) => {
    startTransition(() => {
      setSortOption(e.target.value);
    });
  };

  const handleChartModalToggle = () => {
    startTransition(() => {
      setIsChartModalOpen((prev) => !prev);
    });
  };

  const handleCloseDetailModal = () => {
    startTransition(() => {
      setIsDetailModalOpen(false);
      setSalonDetails(null);
      setUserDetails(null);
    });
  };

  const handleCloseUserModal = () => {
    startTransition(() => {
      setIsUserModalOpen(false);
    });
  };

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      startTransition(() => {
        setCurrentPage(pageNumber);
      });
    }
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<SalonLoadingScreen />}>
        {isLoading ? (
          <SalonLoadingScreen />
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-white">
            <style>
              {`
                @keyframes rgbText {
                  0% { color: #7C3AED; }
                  33% { color: #EC4899; }
                  66% { color: #3B82F6; }
                  100% { color: #7C3AED; }
                }
                .rgb-placeholder::placeholder {
                  animation: rgbText 3s infinite;
                }
                .rgb-message {
                  animation: rgbText 3s infinite;
                }
                .card {
                  transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .card:hover {
                  transform: translateY(-4px);
                  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                }
                .modal {
                  border-radius: 12px;
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                }
                .button {
                  transition: background-color 0.2s ease, transform 0.2s ease;
                }
                .button:hover {
                  transform: scale(1.05);
                }
              `}
            </style>

            <div className="container mx-auto px-4 py-10 relative z-10">
              <header ref={headerRef} className="mb-12 text-center">
                <div className="w-64 h-32 mx-auto mb-4">
                  <canvas
                    ref={statsChartRef}
                    className="w-full h-full"
                  ></canvas>
                </div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4">
                  Quản lý thanh toán
                </h1>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  Theo dõi và quản lý tất cả các giao dịch thanh toán từ khách
                  hàng một cách hiệu quả với bảng điều khiển trực quan.
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  {
                    title: "Tổng doanh thu",
                    value: formatCurrency(stats.totalRevenue),
                    color: "text-purple-400",
                  },
                  {
                    title: "Tỷ lệ thành công",
                    value: `${stats.successRate.toFixed(1)}%`,
                    color: "text-green-400",
                  },
                  {
                    title: "Số lịch đặt",
                    value: stats.bookingCount,
                    color: "text-blue-400",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    ref={(el) => (statsRef.current[index] = el)}
                    className="card bg-gray-800/70 p-6 rounded-lg shadow-lg border border-gray-700/50"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">
                      {stat.title}
                    </h3>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
                data-aos="fade-right"
              >
                <div className="w-full md:w-[28rem] relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Tìm kiếm theo ID, phương thức, salon, người dùng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 pr-12 py-2 w-full bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-lg rgb-placeholder"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center button"
                  >
                    <Search className="h-5 w-5 text-gray-400 hover:text-purple-400 transition-colors" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={sortOption}
                    onChange={handleSortChange}
                    className="px-4 py-2 bg-gray-800/70 text-white rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-lg button"
                  >
                    <option value="default">Mặc định</option>
                    <option value="amountAsc">Số tiền: Thấp đến Cao</option>
                    <option value="amountDesc">Số tiền: Cao đến Thấp</option>
                    <option value="idAsc">ID: Thấp đến Cao</option>
                    <option value="idDesc">ID: Cao đến Thấp</option>
                  </select>
                  <button
                    onClick={handleChartModalToggle}
                    className="flex items-center px-4 py-2 bg-gray-800/70 text-white rounded-lg hover:bg-gray-700/70 transition-colors backdrop-blur-lg border border-gray-700/50 button"
                  >
                    <PieChart className="h-5 w-5 mr-2" />
                    Xem biểu đồ
                  </button>
                  <button
                    onClick={() => exportPaymentsToExcel(filteredPayments)}
                    className="flex items-center px-4 py-2 bg-gray-800/70 text-white rounded-lg hover:bg-gray-700/70 transition-colors backdrop-blur-lg border border-gray-700/50 button"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Xuất báo cáo
                  </button>
                </div>
              </div>

              <div ref={tableRef} className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden shadow-lg rounded-xl backdrop-blur-lg border border-gray-800">
                    <table className="min-w-full divide-y divide-gray-800">
                      <thead className="bg-gray-900/80">
                        <tr>
                          <th
                            scope="col"
                            className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider"
                          >
                            ID
                          </th>
                          <th
                            scope="col"
                            className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Mã đặt lịch
                          </th>
                          <th
                            scope="col"
                            className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Người dùng
                          </th>
                          <th
                            scope="col"
                            className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Số tiền
                          </th>
                          <th
                            scope="col"
                            className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Phương thức
                          </th>
                          <th
                            scope="col"
                            className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Salon
                          </th>
                          <th
                            scope="col"
                            className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Trạng thái
                          </th>
                          <th
                            scope="col"
                            className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800/50 divide-y divide-gray-800">
                        {currentPayments.map((payment) => (
                          <tr
                            key={payment.id}
                            className={`transition-colors ${
                              isHighlighted(payment)
                                ? "bg-purple-900/30 shadow-md shadow-purple-500/50"
                                : "hover:bg-gray-700/30"
                            }`}
                            data-aos="fade-up"
                            data-aos-delay={payment.id * 100}
                          >
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-white">
                              {payment.id}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                              {payment.booking_id}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                {payment.user_name || "Không xác định"}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                                {formatCurrency(payment.amount)}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                              <div className="flex items-center">
                                {getPaymentMethodIcon(payment.payment_method)}
                                <span className="ml-2">
                                  {getPaymentMethodLabel(
                                    payment.payment_method
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                              <div className="flex items-center">
                                <Store className="h-4 w-4 mr-2 text-gray-400" />
                                {payment.salon_name || "Không xác định"}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(
                                  payment.status
                                )}`}
                              >
                                {payment.status.toLowerCase() === "success" && (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                {payment.status.toLowerCase() === "failed" && (
                                  <XCircle className="h-4 w-4 mr-1" />
                                )}
                                {payment.status.toLowerCase() === "pending" && (
                                  <Clock className="h-4 w-4 mr-1" />
                                )}
                                {payment.status.charAt(0).toUpperCase() +
                                  payment.status.slice(1).toLowerCase()}
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleViewDetails(payment)}
                                className="text-indigo-400 hover:text-indigo-300 mr-3 button"
                              >
                                Chi tiết
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {filteredPayments.length === 0 && searchQuery && (
                <div ref={noResultsRef} className="text-center mt-8">
                  <p className="text-3xl font-bold rgb-message">
                    Không tìm thấy kết quả
                  </p>
                </div>
              )}

              <div
                className="flex items-center justify-between mt-6"
                data-aos="fade-up"
              >
                <div className="text-sm text-gray-400">
                  Hiển thị{" "}
                  <span className="font-medium text-white">
                    {indexOfFirstPayment + 1}-
                    {Math.min(indexOfLastPayment, filteredPayments.length)}
                  </span>{" "}
                  của{" "}
                  <span className="font-medium text-white">
                    {filteredPayments.length}
                  </span>{" "}
                  kết quả
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-800/70 text-white rounded-lg border border-gray-700/50 hover:bg-gray-700/70 transition-colors backdrop-blur-lg disabled:opacity-50 disabled:cursor-not-allowed button"
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`px-4 py-2 rounded-lg border border-gray-700/50 transition-colors backdrop-blur-lg button ${
                          currentPage === pageNumber
                            ? "bg-purple-600/60 text-white"
                            : "bg-gray-800/70 text-white hover:bg-gray-700/70"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-800/70 text-white rounded-lg border border-gray-700/50 hover:bg-gray-700/70 transition-colors backdrop-blur-lg disabled:opacity-50 disabled:cursor-not-allowed button"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>

            {isDetailModalOpen && selectedPayment && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/60 backdrop-blur-sm"
                onClick={handleCloseDetailModal}
              >
                <div
                  ref={modalRef}
                  className="modal bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl max-w-2xl w-full mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                    Chi tiết thanh toán #{selectedPayment.id}
                  </h2>

                  <div className="space-y-4">
                    {salonDetails &&
                      salonDetails.images &&
                      salonDetails.images.length > 0 && (
                        <div className="mb-4">
                          <img
                            src={`http://localhost:8084/salon-images/${salonDetails.images[0]}`}
                            alt={salonDetails.name}
                            className="w-full h-48 object-cover rounded-lg"
                            loading="lazy"
                          />
                        </div>
                      )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800/60 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">ID</p>
                        <p className="text-white font-medium">
                          {selectedPayment.id}
                        </p>
                      </div>
                      <div className="bg-gray-800/60 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">Số tiền</p>
                        <p className="text-white font-medium">
                          {formatCurrency(selectedPayment.amount)}
                        </p>
                      </div>
                      <div className="bg-gray-800/60 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">Mã đặt lịch</p>
                        <p className="text-white font-medium">
                          {selectedPayment.booking_id}
                        </p>
                      </div>
                      <div className="bg-gray-800/60 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">
                          Mã liên kết thanh toán
                        </p>
                        <p className="text-white font-medium">
                          {selectedPayment.payment_link_id}
                        </p>
                      </div>
                      <div className="bg-gray-800/60 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">
                          Phương thức thanh toán
                        </p>
                        <div className="flex items-center mt-1">
                          {getPaymentMethodIcon(selectedPayment.payment_method)}
                          <span className="ml-2 text-white font-medium">
                            {getPaymentMethodLabel(
                              selectedPayment.payment_method
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-800/60 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">Salon</p>
                        <div className="flex items-center mt-1">
                          <Store className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-white font-medium">
                            {salonDetails
                              ? salonDetails.name
                              : selectedPayment.salon_name || "Không xác định"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-800/60 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">Trạng thái</p>
                        <select
                          value={newPaymentStatus}
                          onChange={(e) =>
                            startTransition(() =>
                              setNewPaymentStatus(e.target.value)
                            )
                          }
                          className="mt-2 w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="success">Thành công</option>
                          <option value="failed">Thất bại</option>
                        </select>
                      </div>
                      <div className="bg-gray-800/60 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">Người dùng</p>
                        <div className="flex items-center mt-1">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-white font-medium">
                            {userDetails
                              ? userDetails.fullName
                              : selectedPayment.user_name || "Không xác định"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-800/60 p-4 rounded-lg col-span-2">
                        <p className="text-gray-400 text-sm">Ngày thanh toán</p>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-white font-medium">
                            {new Date(selectedPayment.date).toLocaleString(
                              "vi-VN",
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-6">
                      <button
                        onClick={handleViewUserDetails}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors shadow-md button"
                      >
                        Xem chi tiết người dùng
                      </button>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleUpdatePaymentStatus}
                          className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors shadow-md button"
                        >
                          Cập nhật trạng thái
                        </button>
                        <button
                          onClick={handleCloseDetailModal}
                          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md button"
                        >
                          Đóng
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isUserModalOpen && userDetails && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/60 backdrop-blur-sm"
                onClick={handleCloseUserModal}
              >
                <div
                  ref={modalRef}
                  className="modal bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl max-w-lg w-full mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
                    Chi tiết người dùng
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-gray-800/60 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">ID</p>
                      <p className="text-white font-medium">{userDetails.id}</p>
                    </div>
                    <div className="bg-gray-800/60 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Họ và tên</p>
                      <p className="text-white font-medium">
                        {userDetails.fullName}
                      </p>
                    </div>
                    <div className="bg-gray-800/60 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white font-medium">
                        {userDetails.email || "Không có"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleCloseUserModal}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors shadow-md button"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isChartModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/60 backdrop-blur-sm"
                onClick={handleChartModalToggle}
              >
                <div
                  ref={modalRef}
                  className="modal bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl max-w-4xl w-full mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                    Biểu đồ doanh thu thanh toán
                  </h2>
                  <canvas ref={chartRef}></canvas>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleChartModalToggle}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md button"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}
            <ToastContainer position="bottom-right" autoClose={3000} />
          </div>
        )}
      </Suspense>
    </ErrorBoundary>
  );
};

export default Payment;
