import axios from "axios";

const API_KEY = "AIzaSyCuJYFyIMLh3PLQrloXiZCSJhfTo2lKTUQ";

if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not defined in .env file");
}

export const sendMessageToGemini = async (text) => {
  try {
    if (!API_KEY) {
      throw new Error("API key is missing. Please check your .env file.");
    }

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: text,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const responseText =
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "🤖 Xin lỗi, tôi chưa hiểu câu hỏi của bạn.";
    return responseText;
  } catch (error) {
    console.error("Gemini API error:", error.message);
    if (error.response?.status === 400) {
      return "❌ Yêu cầu không hợp lệ. Vui lòng kiểm tra API key hoặc nội dung gửi đi.";
    }
    return "❌ Đã xảy ra lỗi khi gọi AI. Vui lòng thử lại sau.";
  }
};

export const fetchSalons = async () => {
  try {
    const res = await axios.get("http://localhost:8084/salon");
    const salons = Array.isArray(res.data) ? res.data : [res.data];
    console.log("Fetched salons:", salons);
    return salons;
  } catch (error) {
    console.error("Fetch salons error:", error.message);
    return [];
  }
};

export const fetchSalonServices = async (salonId) => {
  try {
    const res = await axios.get(
      `http://localhost:8083/service-offering/salon/${salonId}`
    );
    const services = Array.isArray(res.data) ? res.data : [res.data];
    console.log("Fetched services for salon", salonId, ":", services);
    return services;
  } catch (error) {
    console.error("Fetch salon services error:", error.message);
    return [];
  }
};

export const fetchSalonCategories = async (salonId) => {
  try {
    const res = await axios.get(
      `http://localhost:8086/categories/salon/${salonId}`
    );
    const categories = Array.isArray(res.data) ? res.data : [res.data];
    console.log("Fetched categories for salon", salonId, ":", categories);
    return categories;
  } catch (error) {
    console.error("Fetch salon categories error:", error.message);
    return [];
  }
};

export const fetchServicesByCategory = async (salonId, categoryId) => {
  try {
    const res = await axios.get(
      `http://localhost:8083/service-offering/salon/${salonId}/category/${categoryId}`
    );
    const services = Array.isArray(res.data) ? res.data : [res.data];
    console.log(
      "Fetched services for category",
      categoryId,
      "in salon",
      salonId,
      ":",
      services
    );
    return services;
  } catch (error) {
    console.error("Fetch services by category error:", error.message);
    return [];
  }
};
