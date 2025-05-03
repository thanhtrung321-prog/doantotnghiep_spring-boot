import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost";

// Retry utility function
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

/**
 * Fetches categories for a specific salon.
 * @param {number} salonId - The ID of the salon.
 * @returns {Promise<object[]>} Array of category objects.
 * @throws {Error} If the request fails.
 */
export const fetchCategoriesBySalon = async (salonId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}:8086/categories/salon/${salonId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi từ server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không thể kết nối đến dịch vụ danh mục: ${error.message}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Fetches services for a salon, optionally filtered by category.
 * @param {number} salonId - The ID of the salon.
 * @param {number|null} categoryId - The ID of the category (optional).
 * @returns {Promise<object[]>} Array of service objects.
 * @throws {Error} If the request fails.
 */
export const fetchServicesBySalon = async (salonId, categoryId = null) => {
  try {
    const url = categoryId
      ? `${API_BASE_URL}:8083/service-offering/salon/${salonId}?categoryId=${categoryId}`
      : `${API_BASE_URL}:8083/service-offering/salon/${salonId}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi từ server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không thể kết nối đến dịch vụ dịch vụ: ${error.message}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Fetches details of a specific service.
 * @param {number} serviceId - The ID of the service.
 * @returns {Promise<object>} The service object with detailed information.
 * @throws {Error} If the request fails.
 */
export const fetchServiceById = async (serviceId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}:8083/service-offering/${serviceId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi từ server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không thể kết nối đến dịch vụ chi tiết: ${error.message}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Fetches available time slots for a salon on a specific date.
 * @param {number} salonId - The ID of the salon.
 * @param {string} date - The date in YYYY-MM-DD format.
 * @returns {Promise<object[]>} Array of available slot objects.
 * @throws {Error} If the request fails.
 */
export const fetchAvailableSlots = async (salonId, date) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}:8087/booking/slot/salon/${salonId}/date/${date}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi từ server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không thể kết nối đến dịch vụ lịch trống: ${error.message}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Creates a booking for a salon with the specified customer and staff.
 * @param {number} salonId - The ID of the salon.
 * @param {number} customerId - The ID of the customer (user).
 * @param {string} staffId - The ID of the staff member.
 * @param {object} bookingRequest - The booking request object containing startTime and serviceIds.
 * @returns {Promise<object>} The created booking object.
 * @throws {Error} If the request fails.
 */
export const createBooking = async (
  salonId,
  customerId,
  staffId,
  bookingRequest
) => {
  try {
    if (!salonId || !customerId || !staffId) {
      throw new Error("salonId, customerId, và staffId là bắt buộc");
    }
    if (!bookingRequest?.startTime || !bookingRequest?.serviceIds?.length) {
      throw new Error("startTime và serviceIds là bắt buộc");
    }

    const cleanedBookingRequest = {
      startTime: bookingRequest.startTime,
      serviceIds: bookingRequest.serviceIds,
    };

    console.log("Sending booking request to :8080/booking:", {
      salonId,
      customerId,
      staffId,
      cleanedBookingRequest,
    });
    const response = await axios.post(
      `${API_BASE_URL}:8080/booking`,
      cleanedBookingRequest,
      {
        params: { salonId, customerId, staffId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Booking response:", response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi từ server đặt lịch: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không thể kết nối đến booking service: ${error.message}`;
    console.warn("Booking creation failed:", errorMessage);
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Fetches details of a specific salon.
 * @param {number} salonId - The ID of the salon.
 * @returns {Promise<object>} The salon object.
 * @throws {Error} If the request fails.
 */
export const fetchSalonById = async (salonId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}:8084/salon/${salonId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi từ server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không thể kết nối đến dịch vụ salon: ${error.message}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Fetches all salons.
 * @returns {Promise<object[]>} Array of salon objects.
 * @throws {Error} If the request fails.
 */
export const fetchSalons = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}:8084/salon`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi từ server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không thể kết nối đến dịch vụ salon: ${error.message}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Creates a payment link for a booking.
 * @param {object} user - The user object containing id, fullname, email.
 * @param {object} booking - The booking object.
 * @param {string} paymentMethod - The payment method (VNPAY or CASH).
 * @returns {Promise<object>} Object containing paymentLinkUrl and paymentLinkId.
 * @throws {Error} If the request fails.
 */
export const createPaymentLink = async (user, booking, paymentMethod) => {
  try {
    console.log("Creating payment link with:", {
      user,
      booking,
      paymentMethod,
    });
    const bookingDTO = {
      id: booking.id,
      totalPrice: booking.totalPrice,
      salonId: booking.salonId,
      customerId: booking.customerId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      serviceIds: booking.serviceIds,
      staffId: booking.staffId,
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
    console.log("Payment link response:", response.data);
    return {
      paymentLinkUrl: response.data.payment_link_url,
      paymentLinkId: response.data.payment_link_id,
    };
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi từ server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không thể kết nối đến payment service: ${error.message}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Proceeds with payment verification (for VNPAY only).
 * @param {string} paymentId - The payment ID.
 * @param {string} paymentLinkId - The payment link ID.
 * @returns {Promise<boolean>} True if payment is successful.
 * @throws {Error} If the request fails.
 */
export const proceedPayment = async (paymentId, paymentLinkId) => {
  const request = async () => {
    const response = await axios.patch(
      `${API_BASE_URL}:8085/payments/proceed`,
      null,
      {
        params: { paymentId, paymentLinkId },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response;
  };

  try {
    console.log("Proceeding VNPAY payment with:", { paymentId, paymentLinkId });
    const response = await retry(request, 3, 1000);
    console.log("VNPAY payment proceed response:", response.data);
    if (response.data === true) {
      return true; // Payment successful
    } else {
      throw new Error("VNPAY payment verification failed");
    }
  } catch (error) {
    const errorMessage = error.response
      ? `Lỗi từ server: ${error.response.status} - ${
          error.response.data.message || error.message
        }`
      : `Không thể kết nối đến payment service: ${error.message}`;
    console.warn("VNPAY payment proceed failed:", errorMessage);
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};