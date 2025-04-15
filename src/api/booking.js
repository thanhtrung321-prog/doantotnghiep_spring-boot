import axios from "axios";

const API_BASE_URL = "http://localhost";

export const getStaff = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}:8082/user`);
    const staff = response.data.filter((user) => user.role === "STAFF");
    return staff;
  } catch (error) {
    throw new Error("Không thể tải danh sách nhân viên");
  }
};
