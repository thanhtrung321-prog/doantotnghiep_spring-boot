import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost";

const retry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(
        `Retry ${i + 1} failed: ${error.message}. Retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const fetchCategoriesBySalon = async (salonId) => {
  if (!salonId) throw new Error("Thiếu salonId");
  try {
    const response = await axios.get(
      `${API_BASE_URL}:8086/categories/salon/${salonId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    console.log("fetchCategoriesBySalon response:", response.data);
    return response.data || [];
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không kết nối được dịch vụ danh mục: ${error.message}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const fetchServicesBySalon = async (salonId, categoryId = null) => {
  if (!salonId) throw new Error("Thiếu salonId");
  try {
    const url = categoryId
      ? `${API_BASE_URL}:8083/service-offering/salon/${salonId}?categoryId=${categoryId}`
      : `${API_BASE_URL}:8083/service-offering/salon/${salonId}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("fetchServicesBySalon response:", response.data);
    return response.data || [];
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không kết nối được dịch vụ: ${error.message}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const fetchServiceById = async (serviceId) => {
  if (!serviceId) throw new Error("Thiếu serviceId");
  try {
    const response = await axios.get(
      `${API_BASE_URL}:8083/service-offering/${serviceId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    console.log("fetchServiceById response:", response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không kết nối được dịch vụ chi tiết: ${error.message}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const fetchBookedSlots = async (salonId, date) => {
  if (!salonId || !date) throw new Error("Thiếu salonId hoặc date");
  try {
    const response = await axios.get(
      `${API_BASE_URL}:8087/booking/slot/salon/${salonId}/date/${date}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    const data = response.data || [];
    console.log(`fetchBookedSlots for salon ${salonId}, date ${date}:`, data);
    const validData = data.filter((slot) => {
      const isValid =
        slot.startTime &&
        slot.endTime &&
        slot.staffId &&
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/.test(
          slot.startTime
        ) &&
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/.test(
          slot.endTime
        ) &&
        new Date(slot.startTime) < new Date(slot.endTime);
      if (!isValid) {
        console.warn("Invalid booked slot:", slot);
      }
      return isValid;
    });
    validData.forEach((slot) => {
      console.log(
        `Parsed slot: start=${new Date(slot.startTime).toLocaleString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
        })}, end=${new Date(slot.endTime).toLocaleString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
        })}, staffId=${slot.staffId}`
      );
    });
    return validData;
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không kết nối được dịch vụ lịch đã đặt: ${error.message}`;
    console.error("fetchBookedSlots error:", errorMessage);
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const createBooking = async (salonId, customerId, bookingRequest) => {
  if (!salonId || !customerId) throw new Error("Thiếu salonId hoặc customerId");
  if (
    !bookingRequest?.startTime ||
    !bookingRequest?.endTime ||
    !bookingRequest?.serviceIds?.length ||
    !bookingRequest?.staffId ||
    bookingRequest?.totalPrice == null
  ) {
    throw new Error(
      "Thiếu startTime, endTime, serviceIds, staffId, hoặc totalPrice"
    );
  }
  try {
    const bookingData = {
      startTime: bookingRequest.startTime,
      endTime: bookingRequest.endTime,
      staffId: bookingRequest.staffId,
      totalPrice: bookingRequest.totalPrice,
      serviceIds: bookingRequest.serviceIds,
    };
    const response = await axios.post(
      `${API_BASE_URL}:8087/booking`,
      bookingData,
      {
        params: { salonId, customerId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("createBooking response:", response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi đặt lịch: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không kết nối được booking service: ${error.message}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const fetchSalonById = async (salonId) => {
  if (!salonId) throw new Error("Thiếu salonId");
  try {
    const response = await axios.get(`${API_BASE_URL}:8084/salon/${salonId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("fetchSalonById response:", response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không kết nối được dịch vụ salon: ${error.message}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const fetchSalons = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}:8084/salon`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("fetchSalons response:", response.data);
    return response.data || [];
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không kết nối được dịch vụ salon: ${error.message}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const createPaymentLink = async (user, booking, paymentMethod) => {
  if (!user || !booking || !paymentMethod)
    throw new Error("Thiếu user, booking, hoặc paymentMethod");
  try {
    const bookingDTO = {
      id: booking.id,
      salonId: booking.salonId,
      totalPrice: booking.totalPrice,
      startTime: booking.startTime,
      endTime: booking.endTime,
    };
    const response = await axios.post(
      `${API_BASE_URL}:8085/payments/create?paymentMethod=${paymentMethod}`,
      { user, booking: bookingDTO },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(
      "createPaymentLink raw response:",
      JSON.stringify(response.data, null, 2)
    );

    // Handle alternative field names
    const data = response.data;
    const paymentLinkUrl =
      data.payment_link_url || data.paymentLinkUrl || data.paymentUrl || "";
    const paymentId =
      data.getPayment_link_id || data.get_payment_link_id || data.id;

    if (paymentMethod.toUpperCase() !== "CASH" && !paymentLinkUrl) {
      throw new Error(
        "Phản hồi thanh toán thiếu URL thanh toán cho phương thức không phải CASH"
      );
    }

    return {
      payment_link_url: paymentLinkUrl,
      getPayment_link_id: paymentId,
    };
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không kết nối được payment service: ${error.message}`;
    console.error("createPaymentLink error:", errorMessage);
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const proceedPayment = async (paymentOrderId) => {
  if (!paymentOrderId) throw new Error("Thiếu paymentOrderId");
  const request = async () => {
    const response = await axios.patch(
      `${API_BASE_URL}:8085/payments/proceed`,
      null,
      {
        params: { paymentOrderId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  };
  try {
    const response = await retry(request, 3, 1000);
    console.log("proceedPayment response:", response.data);
    return response.data === true;
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không kết nối được payment service: ${error.message}`;
    console.error("proceedPayment error:", errorMessage);
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
