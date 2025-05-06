import axios from "axios";

// Set default headers for authentication
const setAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// Fetch bookings for a given salonId
export const fetchBookings = async (salonId) => {
  try {
    const response = await axios.get(
      `http://localhost:8087/booking/salon?salonId=${salonId}`,
      setAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch bookings"
    );
  }
};

// Fetch services for a given salonId
export const fetchServices = async (salonId) => {
  try {
    const response = await axios.get(
      `http://localhost:8083/service-offering/salon/${salonId}`,
      setAuthHeader()
    );
    return response.data.reduce((map, service) => {
      map[service.id] = service.name.split("|")[0]; // Map serviceId to first name part
      return map;
    }, {});
  } catch (error) {
    console.error("Error fetching services:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch services"
    );
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await axios.put(
      `http://localhost:8087/booking/${bookingId}/status`,
      null,
      { ...setAuthHeader(), params: { status } }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update booking status"
    );
  }
};

// Create a new booking
export const createBooking = async (salonId, customerId, bookingRequest) => {
  try {
    const response = await axios.post(
      `http://localhost:8087/booking`,
      bookingRequest,
      {
        ...setAuthHeader(),
        params: { salonId, customerId },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create booking"
    );
  }
};

// Save a booking (update status to PENDING)
export const saveBooking = async (bookingDTO) => {
  try {
    const response = await axios.post(
      `http://localhost:8087/booking/save`,
      bookingDTO,
      setAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error saving booking:", error);
    throw new Error(error.response?.data?.message || "Failed to save booking");
  }
};

// Fetch bookings by customer ID
export const fetchBookingsByCustomerId = async (customerId) => {
  try {
    const response = await axios.get(
      `http://localhost:8087/booking/customer`,
      setAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch customer bookings"
    );
  }
};

// Fetch booking by ID
export const fetchBookingById = async (bookingId) => {
  try {
    const response = await axios.get(
      `http://localhost:8087/booking/${bookingId}`,
      setAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching booking by ID:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch booking");
  }
};

// Fetch booked slots for a salon and date
export const fetchBookedSlots = async (salonId, date) => {
  try {
    const response = await axios.get(
      `http://localhost:8087/booking/slot/salon/${salonId}/date/${date}`,
      setAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch booked slots"
    );
  }
};

// Fetch salon report
export const fetchSalonReport = async (salonId) => {
  try {
    const response = await axios.get(
      `http://localhost:8087/booking/report`,
      setAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching salon report:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch salon report"
    );
  }
};

// Fetch customer details by ID
export const fetchCustomerDetails = async (customerId) => {
  try {
    const response = await axios.get(
      `http://localhost:8082/user/${customerId}`,
      setAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching customer details:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch customer details"
    );
  }
};

// Fetch rating for a booking
export const fetchBookingRating = async (bookingId) => {
  try {
    const response = await axios.get(
      `http://localhost:8087/booking/${bookingId}/rating`,
      setAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching booking rating:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch booking rating"
    );
  }
};
