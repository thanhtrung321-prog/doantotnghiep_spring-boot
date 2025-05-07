import * as XLSX from "xlsx";

export const fetchPayments = async () => {
  try {
    const response = await fetch("http://localhost:8085/payments/all");
    const data = await response.json();
    const mappedPayments = await Promise.all(
      data.payments.map(async (payment) => {
        const salonDetails = await fetchSalonDetails(payment.salonId);
        const userDetails = await fetchUserDetails(payment.userId);
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
          date: new Date().toISOString(), // Adjust if backend provides date
        };
      })
    );
    return {
      payments: mappedPayments,
      stats: {
        totalRevenue: data.totalRevenue,
        totalTransactions: data.totalTransactions,
        successRate: data.successRate,
      },
    };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return {
      payments: [],
      stats: { totalRevenue: 0, totalTransactions: 0, successRate: 0 },
    };
  }
};

export const fetchSalonDetails = async (salonId) => {
  try {
    const response = await fetch(`http://localhost:8084/salon/${salonId}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching salon details:", error);
    return null;
  }
};

export const fetchUserDetails = async (userId) => {
  try {
    const response = await fetch(`http://localhost:8082/user/${userId}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const getPaymentMethodLabel = (method) => {
  return method === "cash" ? "Tiền mặt" : method;
};

export const sortPaymentsByAmount = (payments) => {
  return [...payments].sort((a, b) => b.amount - a.amount);
};

export const exportPaymentsToExcel = (payments) => {
  const worksheetData = payments.map((payment) => ({
    ID: payment.id,
    "Booking ID": payment.booking_id,
    "Người dùng": payment.user_name,
    "Số tiền": payment.amount,
    "Phương thức": getPaymentMethodLabel(payment.payment_method),
    Salon: payment.salon_name,
    Status: payment.status,
    "Ngày thanh toán": new Date(payment.date).toLocaleString("vi-VN"),
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
  XLSX.writeFile(workbook, "Payments_Report.xlsx");
};

export const getChartData = (payments) => {
  return {
    labels: payments.map((p) => `Payment #${p.id}`),
    datasets: [
      {
        label: "Số tiền (VND)",
        data: payments.map((p) => p.amount),
        backgroundColor: "rgba(124, 58, 237, 0.6)",
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
          stats.totalTransactions * 10000,
          stats.successRate * 1000,
        ],
        backgroundColor: [
          "rgba(124, 58, 237, 0.6)",
          "rgba(59, 130, 246, 0.6)",
          "rgba(236, 72, 153, 0.6)",
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
