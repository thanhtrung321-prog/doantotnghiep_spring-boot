import axios from "axios";

// Base API URLs
const CATEGORY_API_URL = "http://localhost:8086/categories/salon/302";
const SERVICE_API_URL = "http://localhost:8083/service-offering/salon/302";

// Function to fetch salon categories
export const fetchCategories = async () => {
  try {
    const response = await axios.get(CATEGORY_API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming token is stored in localStorage
      },
    });
    return response.data; // Returns list of categories
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Function to fetch services for a specific category
export const fetchServicesByCategory = async (categoryId) => {
  try {
    const response = await axios.get(
      `${SERVICE_API_URL}?categoryId=${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data; // Returns list of services
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

// Function to get logged-in user information (mocked or from API)
export const getUserInfo = async () => {
  try {
    // Assuming user info is stored in localStorage or fetched from an API
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      throw new Error("User not logged in");
    }
    return user; // Returns user object { id, name, email, etc. }
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

// Function to handle service selection and redirect to booking page
export const selectServiceAndRedirect = async (service, navigate) => {
  try {
    const user = await getUserInfo();
    const bookingData = {
      user,
      service,
      salonId: 302,
    };

    // Redirect to booking page with booking data
    navigate("/booking", { state: bookingData });
  } catch (error) {
    console.error("Error during service selection:", error);
    throw error;
  }
};
