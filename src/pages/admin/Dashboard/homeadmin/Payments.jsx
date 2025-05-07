import React, { useState, useEffect, useRef } from "react";
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
  BarChart2,
  PieChart,
} from "lucide-react";
import Chart from "chart.js/auto";
import {
  fetchPayments,
  fetchSalonDetails,
  fetchUserDetails,
  formatCurrency,
  getPaymentMethodLabel,
  exportPaymentsToExcel,
  getChartData,
  getStatsChartData,
} from "../../api/apiadmin/paymentsadmin";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center text-red-500">
          <p>Đã xảy ra lỗi. Vui lòng thử lại sau.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const Payments = () => {
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
  const [isLoading, setIsLoading] = useState(false);
  const paymentsPerPage = 5;

  const chartRef = useRef(null);
  const statsChartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const statsChartInstanceRef = useRef(null);

  useEffect(() => {
    const loadPayments = async () => {
      setIsLoading(true);
      try {
        const startTime = Date.now();
        const { payments, stats } = await fetchPayments();
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 1500 - elapsedTime);

        setTimeout(() => {
          setPayments(payments);
          setFilteredPayments(payments);
          setOriginalPayments(payments);
          setStats({ ...stats, bookingCount: payments.length });
          setIsLoading(false);
        }, remainingTime);
      } catch (error) {
        console.error("Failed to load payments:", error);
        setIsLoading(false);
      }
    };
    loadPayments();
  }, []);

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

    const filtered = sortedPayments.filter(
      (payment) =>
        payment.id.toString().includes(searchQuery) ||
        getPaymentMethodLabel(payment.payment_method)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        payment.salon_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.user_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredPayments(filtered);
    setCurrentPage(1);
  }, [searchQuery, sortOption, payments, originalPayments]);

  useEffect(() => {
    if (statsChartRef.current) {
      if (statsChartInstanceRef.current) {
        statsChartInstanceRef.current.destroy();
      }

      const ctx = statsChartRef.current.getContext("2d");
      statsChartInstanceRef.current = new Chart(ctx, {
        type: "bar",
        data: getStatsChartData(stats),
        options: {
          scales: {
            y: {
              beginAtZero: true,
              display: false,
            },
            x: {
              display: false,
            },
          },
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "Thống kê",
              color: "white",
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
  }, [stats]);

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
              title: {
                display: true,
                text: "Số tiền (VND)",
              },
            },
            x: {
              title: {
                display: true,
                text: "Mã thanh toán",
              },
            },
          },
          plugins: {
            legend: {
              display: true,
            },
            title: {
              display: true,
              text: "Biểu đồ doanh thu thanh toán",
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

  const handleViewDetails = async (payment) => {
    setSelectedPayment(payment);
    try {
      const salon = await fetchSalonDetails(payment.salon_id);
      const user = await fetchUserDetails(payment.user_id);
      setSalonDetails(salon);
      setUserDetails(user);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch details:", error);
    }
  };

  const handleViewUserDetails = async () => {
    if (selectedPayment) {
      try {
        const user = await fetchUserDetails(selectedPayment.user_id);
        setUserDetails(user);
        setIsUserModalOpen(true);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "success":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
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
    return (
      payment.id.toString().includes(searchQuery) ||
      getPaymentMethodLabel(payment.payment_method)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      payment.salon_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.user_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSearch = () => {
    setSearchQuery(searchTerm);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(
    indexOfFirstPayment,
    indexOfLastPayment
  );

  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-white">
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-white font-semibold">Đang tải...</p>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-10 relative z-10">
          <header className="mb-12 text-center relative">
            <div className="absolute top-0 left-0 w-64 h-32 z-10">
              <canvas ref={statsChartRef} className="w-full h-full"></canvas>
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4">
              Quản lý thanh toán
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Theo dõi và quản lý tất cả các giao dịch thanh toán từ khách hàng
              một cách hiệu quả với bảng điều khiển trực quan.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/70 p-6 rounded-lg shadow-lg border border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                Tổng doanh thu
              </h3>
              <p className="text-2xl font-bold text-purple-400">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-gray-800/70 p-6 rounded-lg shadow-lg border border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                Tỷ lệ thành công
              </h3>
              <p className="text-2xl font-bold text-green-400">
                {stats.successRate}%
              </p>
            </div>
            <div className="bg-gray-800/70 p-6 rounded-lg shadow-lg border border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                Số lịch đặt
              </h3>
              <p className="text-2xl font-bold text-blue-400">
                {stats.bookingCount}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="w-full md:w-[28rem] relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm theo ID, phương thức, salon, người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-12 py-2 w-full bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-lg"
              />
              <button
                onClick={handleSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Search className="h-5 w-5 text-gray-400 hover:text-purple-400 transition-colors" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-4 py-2 bg-gray-800/70 text-white rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-lg"
              >
                <option value="default">Mặc định</option>
                <option value="amountAsc">Số tiền: Thấp đến Cao</option>
                <option value="amountDesc">Số tiền: Cao đến Thấp</option>
                <option value="idAsc">ID: Thấp đến Cao</option>
                <option value="idDesc">ID: Cao đến Thấp</option>
              </select>
              <button
                onClick={() => setIsChartModalOpen(true)}
                className="flex items-center px-4 py-2 bg-gray-800/70 text-white rounded-lg hover:bg-gray-700/70 transition-colors backdrop-blur-lg border border-gray-700/50"
              >
                <PieChart className="h-5 w-5 mr-2" />
                Xem biểu đồ
              </button>
              <button
                onClick={() => exportPaymentsToExcel(filteredPayments)}
                className="flex items-center px-4 py-2 bg-gray-800/70 text-white rounded-lg hover:bg-gray-700/70 transition-colors backdrop-blur-lg border border-gray-700/50"
              >
                <Download className="h-5 w-5 mr-2" />
                Xuất báo cáo
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
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
                        Booking ID
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
                            {payment.user_name}
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
                              {getPaymentMethodLabel(payment.payment_method)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <Store className="h-4 w-4 mr-2 text-gray-400" />
                            {payment.salon_name}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(
                              payment.status
                            )}`}
                          >
                            {payment.status === "success" && (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            {payment.status === "failed" && (
                              <XCircle className="h-4 w-4 mr-1" />
                            )}
                            {payment.status === "pending" && (
                              <Clock className="h-4 w-4 mr-1" />
                            )}
                            {payment.status === "processing" && (
                              <Clock className="h-4 w-4 mr-1" />
                            )}
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(payment)}
                            className="text-indigo-400 hover:text-indigo-300 mr-3"
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

          <div className="flex items-center justify-between mt-6">
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
                className="px-4 py-2 bg-gray-800/70 text-white rounded-lg border border-gray-700/50 hover:bg-gray-700/70 transition-colors backdrop-blur-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`px-4 py-2 rounded-lg border border-gray-700/50 transition-colors backdrop-blur-lg ${
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
                className="px-4 py-2 bg-gray-800/70 text-white rounded-lg border border-gray-700/50 hover:bg-gray-700/70 transition-colors backdrop-blur-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        </div>

        {isDetailModalOpen && selectedPayment && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setIsDetailModalOpen(false);
              setSalonDetails(null);
              setUserDetails(null);
            }}
          >
            <div
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl max-w-2xl w-full mx-4 shadow-2xl border border-gray-700/50"
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
                    <p className="text-gray-400 text-sm">Booking ID</p>
                    <p className="text-white font-medium">
                      {selectedPayment.booking_id}
                    </p>
                  </div>

                  <div className="bg-gray-800/60 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Payment Link ID</p>
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
                        {getPaymentMethodLabel(selectedPayment.payment_method)}
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
                          : selectedPayment.salon_name}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-800/60 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Trạng thái</p>
                    <span
                      className={`mt-1 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusStyle(
                        selectedPayment.status
                      )}`}
                    >
                      {selectedPayment.status === "success" && (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      {selectedPayment.status === "failed" && (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      {selectedPayment.status === "pending" && (
                        <Clock className="h-4 w-4 mr-1" />
                      )}
                      {selectedPayment.status === "processing" && (
                        <Clock className="h-4 w-4 mr-1" />
                      )}
                      {selectedPayment.status}
                    </span>
                  </div>

                  <div className="bg-gray-800/60 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Người dùng</p>
                    <div className="flex items-center mt-1">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-white font-medium">
                        {userDetails
                          ? userDetails.fullName
                          : selectedPayment.user_name}
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
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors shadow-md"
                  >
                    Xem chi tiết người dùng
                  </button>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setSalonDetails(null);
                      setUserDetails(null);
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isUserModalOpen && userDetails && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/60 backdrop-blur-sm"
            onClick={() => setIsUserModalOpen(false)}
          >
            <div
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl max-w-lg w-full mx-4 shadow-2xl border border-gray-700/50"
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
                    {userDetails.email || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors shadow-md"
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
            onClick={() => setIsChartModalOpen(false)}
          >
            <div
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl max-w-4xl w-full mx-4 shadow-2xl border border-gray-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                Biểu đồ doanh thu thanh toán
              </h2>
              <canvas ref={chartRef}></canvas>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsChartModalOpen(false)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Payments;
