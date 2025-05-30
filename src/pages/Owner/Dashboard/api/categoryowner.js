import axios from "axios";

const API_URL = "http://localhost:8086/categories";
const SALON_API_URL = "http://localhost:8084/salon";

export const getCategoriesBySalon = async (salonId) => {
  try {
    const response = await axios.get(`${API_URL}/salon/${salonId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories by salon:", error);
    throw error;
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching category by id:", error);
    throw error;
  }
};

export const createCategory = async (salonId, category) => {
  try {
    const response = await axios.post(
      `${API_URL}/salon-owner/${salonId}`,
      category,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const updateCategory = async (salonId, id, category) => {
  try {
    const response = await axios.put(
      `${API_URL}/salon-owner/${salonId}/${id}`,
      category,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (salonId, id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/salon-owner/${salonId}/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

export const getSalons = async () => {
  try {
    const response = await axios.get(SALON_API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching salons:", error);
    throw error;
  }
};
