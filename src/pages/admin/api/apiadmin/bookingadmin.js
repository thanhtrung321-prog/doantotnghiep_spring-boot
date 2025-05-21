import axios from "axios";

const setAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const API_CONFIG = {
  booking: "http://localhost:8087",
  service: "http://localhost:8083",
  category: "http://localhost:8086",
  user: "http://localhost:8082",
  payment: "http://localhost:8085",
  salon: "http://localhost:8084",
};

const createLocalDate = (dateString, timeString) => {
  return new Date(`${dateString}T${timeString}+07:00`);
};

const formatLocalDateTime = (date) => {
  if (!date) return null;
  return new Date(date)
    .toLocaleString("sv-SE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    .replace(" ", "T");
};

const formatLocalDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
};

export const fetchSalons = async () => {
  try {
    const response = await axios.get(
      `${API_CONFIG.salon}/salon`,
      setAuthHeader()
    );
    return Array.isArray(response.data)
      ? response.data.map((salon) => ({
          id: Number(salon.id),
          name: salon.name || "Salon không tên",
          address: salon.address || "",
          openingTime: salon.openingTime || "09:00:00",
          closingTime: salon.closingTime || "18:00:00",
          image: salon.image || "default.png",
        }))
      : [];
  } catch (error) {
    console.error("Error fetching salons:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tải danh sách salon"
    );
  }
};

export const fetchSalonDetails = async (salonId) => {
  try {
    const response = await axios.get(
      `${API_CONFIG.salon}/salon/${salonId}`,
      setAuthHeader()
    );
    return {
      id: Number(response.data.id),
      name: response.data.name || "Salon không tên",
      address: response.data.address || "",
      openingTime: response.data.openingTime || "09:00:00",
      closingTime: response.data.closingTime || "18:00:00",
      image: response.data.image || "default.png",
    };
  } catch (error) {
    console.error("Error fetching salon details:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tải thông tin salon"
    );
  }
};

export const fetchCustomers = async () => {
  try {
    const response = await axios.get(
      `${API_CONFIG.user}/user`,
      setAuthHeader()
    );
    const users = Array.isArray(response.data) ? response.data : [];
    return users
      .filter((user) => user.role === "USER")
      .map((user) => ({
        id: Number(user.id),
        fullName: user.fullName || user.username || `Khách hàng ${user.id}`,
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tải danh sách khách hàng"
    );
  }
};

export const fetchCustomerDetails = async (customerId) => {
  try {
    const response = await axios.get(
      `${API_CONFIG.user}/user/${customerId}`,
      setAuthHeader()
    );
    const data = response.data || {};
    return {
      id: Number(data.id) || customerId,
      fullName:
        data.fullName || data.username || `Khách hàng ${data.id || customerId}`,
      username: data.username || "",
      email: data.email || "",
      phone: data.phone || "",
      phoneNumber: data.phone || "",
      address: data.address || "",
    };
  } catch (error) {
    console.error("Error fetching customer details:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tải thông tin khách hàng"
    );
  }
};

export const fetchStaffBySalon = async (salonId) => {
  try {
    const response = await axios.get(
      `${API_CONFIG.user}/user`,
      setAuthHeader()
    );
    const users = Array.isArray(response.data) ? response.data : [];
    return users
      .filter(
        (user) => user.role === "STAFF" && user.salonId === Number(salonId)
      )
      .map((user) => ({
        id: Number(user.id),
        fullName: user.fullName || user.username || `Nhân viên ${user.id}`,
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        salonId: Number(user.salonId),
      }));
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tải danh sách nhân viên"
    );
  }
};

export const fetchBookings = async (salonId) => {
  try {
    const response = await axios.get(
      `${API_CONFIG.booking}/booking/salon?salonId=${salonId}`,
      setAuthHeader()
    );
    return Array.isArray(response.data)
      ? response.data.map((booking) => ({
          id: Number(booking.id),
          customerId: Number(booking.customerId),
          staffId: Number(booking.staffId),
          startTime: booking.startTime,
          endTime: booking.endTime,
          serviceIds: Array.isArray(booking.serviceIds)
            ? booking.serviceIds.map(Number)
            : [],
          totalPrice: Number(booking.totalPrice) || 0,
          status: booking.status?.toUpperCase() || "PENDING",
          salonId: Number(booking.salonId),
        }))
      : [];
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tải danh sách đặt lịch"
    );
  }
};

export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await axios.put(
      `${API_CONFIG.booking}/booking/${bookingId}/status`,
      null,
      { ...setAuthHeader(), params: { status } }
    );
    return {
      id: Number(response.data.id),
      customerId: Number(response.data.customerId),
      staffId: Number(response.data.staffId),
      startTime: response.data.startTime,
      endTime: response.data.endTime,
      serviceIds: Array.isArray(response.data.serviceIds)
        ? response.data.serviceIds.map(Number)
        : [],
      totalPrice: Number(response.data.totalPrice) || 0,
      status: response.data.status?.toUpperCase() || status.toUpperCase(),
      salonId: Number(response.data.salonId),
    };
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw new Error(
      error.response?.data?.message || "Không thể cập nhật trạng thái đặt lịch"
    );
  }
};

export const createBooking = async (salonId, customerId, bookingRequest) => {
  try {
    const formattedBookingRequest = {
      startTime: bookingRequest.startTime
        ? formatLocalDateTime(bookingRequest.startTime)
        : null,
      endTime: bookingRequest.endTime
        ? formatLocalDateTime(bookingRequest.endTime)
        : null,
      staffId: Number(bookingRequest.staffId),
      serviceIds: Array.isArray(bookingRequest.serviceIds)
        ? bookingRequest.serviceIds.map(Number)
        : [],
      totalPrice: Number(bookingRequest.totalPrice) || 0,
    };
    const response = await axios.post(
      `${API_CONFIG.booking}/booking?salonId=${salonId}&customerId=${customerId}`,
      formattedBookingRequest,
      setAuthHeader()
    );
    return {
      id: Number(response.data.id),
      customerId: Number(response.data.customerId),
      staffId: Number(response.data.staffId),
      startTime: response.data.startTime,
      endTime: response.data.endTime,
      serviceIds: Array.isArray(response.data.serviceIds)
        ? response.data.serviceIds.map(Number)
        : [],
      totalPrice: Number(response.data.totalPrice) || 0,
      status: response.data.status?.toUpperCase() || "PENDING",
      salonId: Number(response.data.salonId),
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    throw new Error(error.response?.data?.message || "Không thể tạo đặt lịch");
  }
};

export const updateBooking = async (bookingId, bookingRequest) => {
  try {
    if (
      !bookingRequest.staffId ||
      !bookingRequest.startTime ||
      !bookingRequest.endTime ||
      !Array.isArray(bookingRequest.serviceIds) ||
      bookingRequest.serviceIds.length === 0 ||
      bookingRequest.totalPrice <= 0
    ) {
      throw new Error(
        "Thiếu hoặc dữ liệu không hợp lệ cho các trường bắt buộc"
      );
    }

    const formattedBookingRequest = {
      startTime: formatLocalDateTime(bookingRequest.startTime),
      endTime: formatLocalDateTime(bookingRequest.endTime),
      staffId: Number(bookingRequest.staffId),
      serviceIds: bookingRequest.serviceIds.map(Number),
      totalPrice: Number(bookingRequest.totalPrice),
    };

    const response = await axios.patch(
      `${API_CONFIG.booking}/booking/${bookingId}`,
      formattedBookingRequest,
      setAuthHeader()
    );

    return {
      id: Number(response.data.id),
      customerId: Number(response.data.customerId),
      staffId: Number(response.data.staffId),
      startTime: response.data.startTime,
      endTime: response.data.endTime,
      serviceIds: Array.isArray(response.data.serviceIds)
        ? response.data.serviceIds.map(Number)
        : [],
      totalPrice: Number(response.data.totalPrice) || 0,
      status: response.data.status?.toUpperCase() || "PENDING",
      salonId: Number(response.data.salonId),
    };
  } catch (error) {
    console.error("Error updating booking:", error);
    throw new Error(
      error.response?.data?.message || "Không thể cập nhật đặt lịch"
    );
  }
};

export const deleteBooking = async (bookingId) => {
  try {
    await axios.delete(
      `${API_CONFIG.booking}/booking/${bookingId}`,
      setAuthHeader()
    );
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw new Error(error.response?.data?.message || "Không thể xóa đặt lịch");
  }
};

export const createPayment = async (paymentRequest) => {
  try {
    const formattedPaymentRequest = {
      user: {
        id: Number(paymentRequest.user.id),
        fullname: paymentRequest.user.fullname || "Nhân viên",
        email: paymentRequest.user.email || "",
      },
      booking: {
        id: Number(paymentRequest.booking.id),
        salonId: Number(paymentRequest.booking.salonId),
        totalPrice: Number(paymentRequest.booking.totalPrice) || 0,
        startTime: formatLocalDateTime(paymentRequest.booking.startTime),
        endTime: formatLocalDateTime(paymentRequest.booking.endTime),
      },
    };
    const response = await axios.post(
      `${API_CONFIG.payment}/payments/create?paymentMethod=CASH`,
      formattedPaymentRequest,
      setAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tạo thanh toán"
    );
  }
};

export const fetchCategories = async (salonId) => {
  try {
    const response = await axios.get(
      `${API_CONFIG.category}/categories/salon/${salonId}`,
      setAuthHeader()
    );
    return Array.isArray(response.data)
      ? response.data.map((category) => ({
          id: Number(category.id),
          name: category.name || "Không có tên",
          image: category.image || "default.png",
          description: category.description || "",
        }))
      : [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tải danh sách danh mục"
    );
  }
};

export const fetchCategoriesBySalon = async (salonId) => {
  try {
    const response = await axios.get(
      `${API_CONFIG.category}/categories/salon/${salonId}`,
      setAuthHeader()
    );
    return Array.isArray(response.data)
      ? response.data.map((category) => ({
          id: Number(category.id),
          name: category.name || "Không có tên",
          image: category.image || "default.png",
          description: category.description || "",
        }))
      : [];
  } catch (error) {
    console.error("Error fetching categories by salon:", error);
    throw new Error(
      error.response?.data?.message ||
        "Không thể tải danh sách danh mục của salon"
    );
  }
};

export const fetchServices = async (salonId) => {
  try {
    const response = await axios.get(
      `${API_CONFIG.service}/service-offering/salon/${salonId}`,
      setAuthHeader()
    );
    return Array.isArray(response.data)
      ? response.data.reduce((map, service) => {
          map[service.id] = {
            id: Number(service.id),
            name: service.name || "Dịch vụ không tên|Dịch vụ không tên",
            description: service.description || "Mô tả mặc định|Mô tả mặc định",
            image: service.image || "default.png|default.png",
            price: Number(service.price) || 0,
            duration: Number(service.duration) || 0,
            categoryId: service.categoryId ? Number(service.categoryId) : null,
          };
          return map;
        }, {})
      : {};
  } catch (error) {
    console.error("Error fetching services:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tải danh sách dịch vụ"
    );
  }
};

export const fetchBookedSlots = async (salonId, date) => {
  try {
    const formattedDate = formatLocalDate(date);
    const response = await axios.get(
      `${API_CONFIG.booking}/booking/slot/salon/${salonId}/date/${formattedDate}`,
      setAuthHeader()
    );
    return Array.isArray(response.data)
      ? response.data.map((slot) => ({
          staffId: Number(slot.staffId),
          startTime: slot.startTime,
          endTime: slot.endTime,
        }))
      : [];
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tải lịch đã đặt"
    );
  }
};

export const fetchAvailableSlots = async (salonId, staffId, date) => {
  try {
    const formattedDate = formatLocalDate(date);
    const [bookedSlotsResponse, salonResponse] = await Promise.all([
      axios.get(
        `${API_CONFIG.booking}/booking/slot/salon/${salonId}/date/${formattedDate}`,
        { ...setAuthHeader(), params: { staffId } }
      ),
      axios.get(`${API_CONFIG.salon}/salon/${salonId}`, setAuthHeader()),
    ]);

    const bookedSlots = Array.isArray(bookedSlotsResponse.data)
      ? bookedSlotsResponse.data.filter(
          (slot) => slot.staffId === Number(staffId)
        )
      : [];
    const salon = salonResponse.data;
    const openingTime = salon.openingTime || "09:00:00";
    const closingTime = salon.closingTime || "18:00:00";

    const workingHours = {
      start: createLocalDate(formattedDate, openingTime),
      end: createLocalDate(formattedDate, closingTime),
    };

    const slots = [];
    let currentTime = new Date(workingHours.start);

    while (currentTime < workingHours.end) {
      const slotEnd = new Date(currentTime.getTime() + 30 * 60 * 1000);
      if (slotEnd > workingHours.end) break;

      const isBooked = bookedSlots.some(
        (slot) =>
          new Date(slot.startTime) <= currentTime &&
          new Date(slot.endTime) >= slotEnd
      );

      if (!isBooked) {
        slots.push({
          startTime: formatLocalDateTime(currentTime),
          endTime: formatLocalDateTime(slotEnd),
          staffId: Number(staffId),
        });
      }

      currentTime = slotEnd;
    }

    return slots;
  } catch (error) {
    console.error("Error fetching available slots:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tải lịch trống"
    );
  }
};

export const fetchBookingRating = async (bookingId) => {
  try {
    const response = await axios.get(
      `${API_CONFIG.booking}/booking/${bookingId}/rating`,
      setAuthHeader()
    );
    return {
      rating: Number(response.data.rating) || 0,
      comment: response.data.comment || "",
    };
  } catch (error) {
    console.error("Error fetching booking rating:", error);
    throw new Error(error.response?.data?.message || "Không thể tải đánh giá");
  }
};
