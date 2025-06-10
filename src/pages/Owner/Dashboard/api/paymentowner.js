import axios from "axios";
import * as XLSX from "xlsx";

const PAYMENT_API = "http://localhost:8085/payments";
const SALON_API = "http://localhost:8084/salon";
const USER_API = "http://localhost:8082/user";

// Helper function to get token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Không tìm thấy token. Vui lòng đăng nhập.");
  }
  return { Authorization: `Bearer ${token.trim()}` };
};

export const fetchPayments = async (salonId) => {
  try {
    const response = await axios.get(
      `${PAYMENT_API}/payment/salon/${salonId}`,
      {
        headers: getAuthHeader(),
      }
    );
    const data = response.data;
    const mappedPayments = await Promise.all(
      data.payments.map(async (payment) => {
        const [salonDetails, userDetails] = await Promise.all([
          fetchSalonDetails(payment.salonId),
          fetchUserDetails(payment.userId),
        ]);
        return {
          id: payment.id,
          amount: payment.amount,
          booking_id: payment.bookingId,
          payment_link_id: `plink_${payment.id}`,
          payment_method: payment.paymentMethod.toLowerCase(),
          salon_id: payment.salonId,
          salon_name: salonDetails ? salonDetails.name : payment.salonId,
          status: payment.status.toLowerCase(),
          user_id: payment.userId,
          user_name: userDetails ? userDetails.fullName : payment.userId,
          date: payment.createdAt
            ? new Date(payment.createdAt).toISOString()
            : new Date().toISOString(),
        };
      })
    );
    return {
      payments: mappedPayments,
      stats: {
        totalRevenue: data.totalRevenue || 0,
        totalTransactions: data.totalTransactions || 0,
        successRate: data.successRate || 0,
      },
    };
  } catch (error) {
    console.error("Lỗi khi tải danh sách thanh toán:", error);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("401: Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    }
    return {
      payments: [],
      stats: { totalRevenue: 0, totalTransactions: 0, successRate: 0 },
    };
  }
};

export const fetchSalonDetails = async (salonId) => {
  try {
    const response = await axios.get(`${SALON_API}/${salonId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải chi tiết salon:", error);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("401: Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    }
    return null;
  }
};

export const fetchUserDetails = async (userId) => {
  try {
    const response = await axios.get(`${USER_API}/${userId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải chi tiết người dùng:", error);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("401: Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    }
    return null;
  }
};

export const updatePaymentStatus = async (paymentId, newStatus) => {
  try {
    console.log("Cập nhật trạng thái thanh toán:", {
      paymentId,
      newStatus,
      payload: JSON.stringify(newStatus),
    });
    const response = await axios.put(
      `${PAYMENT_API}/status/${paymentId}`,
      newStatus,
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      }
    );
    const updatedPayment = response.data;
    console.log("Phản hồi cập nhật thanh toán:", updatedPayment);
    return {
      id: updatedPayment.id,
      status: updatedPayment.status.toLowerCase(),
      amount: updatedPayment.amount,
      booking_id: updatedPayment.bookingId,
      payment_method: updatedPayment.paymentMethod.toLowerCase(),
      salon_id: updatedPayment.salonId,
      user_id: updatedPayment.userId,
      date: updatedPayment.createdAt
        ? new Date(updatedPayment.createdAt).toISOString()
        : new Date().toISOString(),
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái thanh toán:", error);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("401: Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    }
    throw new Error(
      error.response?.data?.message ||
        "Không thể cập nhật trạng thái thanh toán"
    );
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const getPaymentMethodLabel = (method) => {
  switch (method) {
    case "cash":
      return "Tiền mặt";
    case "credit_card":
      return "Thẻ tín dụng";
    case "momo":
      return "MoMo";
    case "bank_transfer":
      return "Chuyển khoản ngân hàng";
    case "zalopay":
      return "ZaloPay";
    default:
      return method.charAt(0).toUpperCase() + method.slice(1);
  }
};

export const sortPaymentsByAmount = (payments) => {
  return [...payments].sort((a, b) => b.amount - a.amount);
};

export const exportPaymentsToExcel = (payments) => {
  const worksheetData = payments.map((payment) => ({
    ID: payment.id,
    "Mã đặt lịch": payment.booking_id,
    "Người dùng": payment.user_name,
    "Số tiền": payment.amount,
    "Phương thức": getPaymentMethodLabel(payment.payment_method),
    Salon: payment.salon_name,
    "Trạng thái":
      payment.status.charAt(0).toUpperCase() +
      payment.status.slice(1).toLowerCase(),
    "Ngày thanh toán": new Date(payment.date).toLocaleString("vi-VN"),
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Thanh toán");
  XLSX.writeFile(workbook, "Báo_cáo_thanh_toán.xlsx");
};

export const getChartData = (payments) => {
  return {
    labels: payments.map((p) => `Thanh toán #${p.id}`),
    datasets: [
      {
        label: "Số tiền (VND)",
        data: payments.map((p) => p.amount),
        backgroundColor: "rgba(124, 58, 237, 0.6)", // Màu tím
        borderColor: "rgba(124, 58, 237, 1)",
        borderWidth: 1,
      },
    ],
  };
};

export const getStatsChartData = (stats) => {
  return {
    labels: ["Doanh thu", "Giao dịch", "Tỷ lệ thành công"],
    datasets: [
      {
        label: "Thống kê",
        data: [
          stats.totalRevenue,
          stats.totalTransactions * 10000, // Phóng đại để dễ nhìn
          stats.successRate * 1000, // Phóng đại để dễ nhìn
        ],
        backgroundColor: [
          "rgba(124, 58, 237, 0.6)", // Màu tím
          "rgba(59, 130, 246, 0.6)", // Màu xanh
          "rgba(236, 72, 153, 0.6)", // Màu hồng
        ],
        borderColor: [
          "rgba(124, 58, 237, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(236, 72, 153, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
};
