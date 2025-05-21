import axios from "axios";

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
          name: staff.fullName,
          role: "Nhân viên", // Role STAFF displayed as "Nhân viên"
          monthlyRevenue: `${(monthlyRevenue / 1000000).toFixed(1)}tr`,
          bookings: staffBookings.length,
          rating: staff.rating || 4.5,
          img: staff.image || `${STATIC_IMAGE_PATH}/staff_${staff.id}.jpg`,
        };
      });

    // Stylist booking distribution (using STAFF instead of STYLIST)
    const stylistBookingData = staffList
      .map((staff) => ({
        name: staff.name,
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
