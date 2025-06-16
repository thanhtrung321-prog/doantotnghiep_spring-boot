import axios from "axios";

const API_URL = "http://localhost:8084/api/contact/message";

export const fetchNotifications = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")?.trim()}`,
      },
    });
    return response.data; // Array of notifications
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")?.trim()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw new Error(error.message || "Không thể xóa thông báo.");
  }
};

const submitContactForm = async (formData) => {
  try {
    const response = await fetch("http://localhost:8084/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Lỗi khi gửi tin nhắn");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message || "Lỗi mạng, vui lòng thử lại sau");
  }
};

export { submitContactForm };
