import axios from "axios";

const USER_API = "http://localhost:8082/user";
const BOOKING_API = "http://localhost:8087/booking";
const STAFF_API = "http://localhost:8082/staff";
const SERVICE_API = "http://localhost:8083/service-offering";
const IMAGE_BASE_URL = "http://localhost:8083/service-offering-images";
const SALON_API = "http://localhost:8084/salon";

const setAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const fetchUserInfo = async (userId, token) => {
  try {
    const response = await axios.get(`${USER_API}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw new Error("Failed to fetch user info");
  }
};

export const fetchAppointments = async (userId, token) => {
  try {
    const response = await axios.get(`${BOOKING_API}/customer/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = response.data;
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw new Error("Failed to fetch appointments");
  }
};

export const fetchStaffInfo = async (staffId, token) => {
  try {
    const response = await axios.get(`${STAFF_API}/${staffId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching staff info:", error);
    throw new Error("Failed to fetch staff info");
  }
};

export const fetchServiceDetails = async (serviceId, token) => {
  try {
    const response = await axios.get(`${SERVICE_API}/${serviceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const service = response.data;
    return {
      ...service,
      name: service.name || "Dịch vụ không xác định",
      description: service.description || "Không có mô tả",
      image: service.image
        ? service.image
            .split("|")
            .map((img) => (img ? `${IMAGE_BASE_URL}/${img}` : null))
            .filter(Boolean)
        : [],
    };
  } catch (error) {
    console.error(`Error fetching service details for ID ${serviceId}:`, error);
    throw new Error(`Failed to fetch service details for ID ${serviceId}`);
  }
};

export const deleteAppointment = async (bookingId, token) => {
  try {
    if (!bookingId) {
      throw new Error("Booking ID is required");
    }
    await axios.delete(`${BOOKING_API}/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(`Error deleting appointment ${bookingId}:`, error);
    throw new Error(
      error.response?.data?.message || "Failed to delete appointment"
    );
  }
};

export const fetchSalonInfo = async (salonId) => {
  try {
    const response = await axios.get(`${SALON_API}/${salonId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching salon info for ID ${salonId}:`, error);
    throw new Error(`Failed to fetch salon info for ID ${salonId}`);
  }
};
