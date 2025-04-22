import axios from "axios";

// Fetch bookings for a given salonId
export const fetchBookings = async (salonId) => {
  try {
    const response = await axios.get(
      `http://localhost:8087/booking/salon?salonId=${salonId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw new Error("Failed to fetch bookings");
  }
};

// Fetch services for a given salonId
export const fetchServices = async (salonId) => {
  try {
    const response = await axios.get(
      `http://localhost:8083/service-offering/salon/${salonId}`
    );
    return response.data.reduce((map, service) => {
      map[service.id] = service.name; // Map serviceId to service name
      return map;
    }, {});
  } catch (error) {
    console.error("Error fetching services:", error);
    throw new Error("Failed to fetch services");
  }
};

// Update booking status (CONFIRMED or CANCELLED)
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await axios.put(
      `http://localhost:8087/booking/${bookingId}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw new Error("Failed to update booking status");
  }
};
