import axios from "axios";

export const fetchUser = async (userId, token) => {
  try {
    const response = await axios.get(`http://localhost:8082/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // { id, fullName, email, role, salonId, ... }
  } catch (error) {
    throw new Error("Không thể tải thông tin người dùng: " + error.message);
  }
};

export const fetchSalon = async (salonId) => {
  try {
    const response = await axios.get(`http://localhost:8084/salon/${salonId}`);
    return response.data; // { id, name, images, address, ... }
  } catch (error) {
    throw new Error("Không thể tải thông tin salon: " + error.message);
  }
};
