import axios from "axios";

const API_URL = "http://localhost:8082/categories"; // Thay đổi URL nếu cần

// Lấy danh sách danh mục theo salon_id
export const getCategoriesBySalon = async (salonId) => {
  try {
    const response = await axios.get(`${API_URL}/salon/${salonId}`);
    return response.data; // Trả về Set<Category>
  } catch (error) {
    console.error("Error fetching categories by salon:", error);
    throw error;
  }
};

// Lấy danh mục theo id
export const getCategoryById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data; // Trả về Category
  } catch (error) {
    console.error("Error fetching category by id:", error);
    throw error;
  }
};

// Thêm danh mục mới
export const createCategory = async (category) => {
  try {
    const response = await axios.post(`${API_URL}/salon-owner`, category);
    return response.data; // Trả về Category mới được tạo
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Xóa danh mục theo id
export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/salon-owner/${id}`);
    return response.data; // Trả về thông báo "Deleted successfully"
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
