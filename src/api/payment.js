import axios from "axios";

const API_BASE_URL = "http://localhost:8085"; // Payment service runs on port 8085

// Create payment link
export const createPaymentLink = async (user, booking, paymentMethod) => {
  try {
    const bookingDTO = {
      id: booking.id,
      totalPrice: booking.totalPrice,
      salonId: booking.salonId,
      customerId: booking.customerId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
    };

    const response = await axios.post(
      `${API_BASE_URL}/payments/create?paymentMethod=${paymentMethod}`,
      { booking: bookingDTO, user },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data; // { payment_link_url, payment_link_id }
  } catch (error) {
    throw new Error("Không thể tạo liên kết thanh toán: " + error.message);
  }
};

// Proceed with payment verification
export const proceedPayment = async (paymentId, paymentLinkId) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/payments/proceed`,
      null,
      {
        params: { paymentId, paymentLinkId },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    return response.data; // Boolean indicating success
  } catch (error) {
    throw new Error("Không thể xác nhận thanh toán: " + error.message);
  }
};
