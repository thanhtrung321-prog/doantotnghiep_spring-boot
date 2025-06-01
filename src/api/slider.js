import { toast } from "react-toastify";

// Base URLs for APIs
const SALON_API = "http://localhost:8084/salon";
const SERVICES_API = "http://localhost:8086/categories/salon";
const SERVICE_OFFERINGS_API = "http://localhost:8083/service-offering/salon";
const SALON_IMAGE_BASE = "http://localhost:8084/salon-images";
const SERVICE_IMAGE_BASE = "http://localhost:8086/category-images";
const SERVICE_OFFERING_IMAGE_BASE =
  "http://localhost:8083/service-offering-images";

// Fetch all salons
export const fetchSalons = async () => {
  try {
    const response = await fetch(SALON_API);
    if (!response.ok) {
      throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách salon:", error);
    toast.error("Không thể tải danh sách salon");
    return [];
  }
};

// Fetch salon details
export const fetchSalonDetails = async (salonId) => {
  try {
    const response = await fetch(`${SALON_API}/${salonId}`);
    if (!response.ok) {
      throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    }
    const data = await response.json();
    return {
      ...data,
      images: data.images.map((image) => `${SALON_IMAGE_BASE}/${image}`),
    };
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết salon:", error);
    toast.error("Không thể tải thông tin salon");
    return null;
  }
};

// Fetch services for a salon
export const fetchServices = async (salonId) => {
  try {
    const response = await fetch(`${SERVICES_API}/${salonId}`);
    if (!response.ok) {
      throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    }
    const data = await response.json();
    return data.map((service) => ({
      ...service,
      image: `${SERVICE_IMAGE_BASE}/${service.image}`,
    }));
  } catch (error) {
    console.error("Lỗi khi lấy dịch vụ salon:", error);
    toast.error("Không thể tải danh sách dịch vụ");
    return [];
  }
};

// Fetch service offerings for a salon
export const fetchServiceOfferings = async (salonId) => {
  try {
    const response = await fetch(`${SERVICE_OFFERINGS_API}/${salonId}`);
    if (!response.ok) {
      throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data)
      ? data.map((offering) => ({
          ...offering,
          images: offering.image
            .split("|")
            .map((img) => `${SERVICE_OFFERING_IMAGE_BASE}/${img}`),
          name: offering.name,
        }))
      : [
          {
            ...data,
            images: data.image
              .split("|")
              .map((img) => `${SERVICE_OFFERING_IMAGE_BASE}/${img}`),
            name: data.name,
          },
        ];
  } catch (error) {
    console.error("Lỗi khi lấy dịch vụ cung cấp:", error);
    toast.error("Không thể tải dịch vụ cung cấp");
    return [];
  }
};
