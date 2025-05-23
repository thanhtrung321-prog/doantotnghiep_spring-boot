import axios from "axios";

const API_BASE_URL = "http://localhost";

export const fetchUser = async (userId, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}:8082/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch user: ${error.response?.status} - ${error.message}`
    );
  }
};

export const fetchSalon = async (salonId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}:8084/salon/${salonId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch salon: ${error.response?.status} - ${error.message}`
    );
  }
};

export const fetchSalonBookings = async (salonId, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}:8087/booking/salon?salonId=${salonId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch salon bookings: ${error.response?.status} - ${error.message}`
    );
  }
};

export const fetchStaffBookings = async (staffId, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}:8087/booking/staff/${staffId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch staff bookings: ${error.response?.status} - ${error.message}`
    );
  }
};

export const fetchCustomer = async (customerId, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}:8082/user/${customerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch customer: ${error.response?.status} - ${error.message}`
    );
  }
};

export const fetchService = async (serviceId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}:8083/service-offering/${serviceId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch service: ${error.response?.status} - ${error.message}`
    );
  }
};

export const updateBookingStatus = async (bookingId, status, token) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}:8087/booking/${bookingId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to update booking status: ${error.response?.status} - ${error.message}`
    );
  }
};
