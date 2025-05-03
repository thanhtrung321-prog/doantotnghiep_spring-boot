import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { vi } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import QRCode from "react-qr-code";
import Cookies from "js-cookie";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import {
  fetchCategoriesBySalon,
  fetchServicesBySalon,
  createBooking,
  fetchSalonById,
  fetchSalons,
  createPaymentLink,
  proceedPayment,
  fetchServiceById,
  fetchAvailableSlots,
} from "../../api/booking";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    userId,
    salonId,
    services: preSelectedServices,
  } = location.state || {};

  const [user, setUser] = useState(null);
  const [salons, setSalons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(salonId || "");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedServices, setSelectedServices] = useState(() => {
    const savedServices = Cookies.get("selectedServices");
    const preSelectedIds = preSelectedServices
      ? preSelectedServices
          .filter(
            (s) => s.id && s.name && s.price != null && s.duration != null
          )
          .map((s) => s.id.toString())
      : [];
    return savedServices
      ? [...new Set([...JSON.parse(savedServices), ...preSelectedIds])]
      : preSelectedIds;
  });
  const [currentService, setCurrentService] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [bookingStatus, setBookingStatus] = useState("CHỜ XỬ LÝ");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showBill, setShowBill] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [salonAddress, setSalonAddress] = useState("");
  const [salonLocation, setSalonLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [paymentLink, setPaymentLink] = useState(null);
  const [salonOperatingHours, setSalonOperatingHours] = useState({
    openingTime: "09:00",
    closingTime: "18:00",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [showServiceDetails, setShowServiceDetails] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calculate total price and duration
  const selectedServiceDetails = allServices.filter((s) =>
    selectedServices.includes(s.id.toString())
  );
  const totalPrice = selectedServiceDetails.reduce(
    (sum, s) => sum + (s.price || 0),
    0
  );
  const totalDuration = selectedServiceDetails.reduce(
    (sum, s) => sum + (s.duration || 0),
    0
  );

  // Estimate completion time
  const completionTime = startTime
    ? new Date(startTime.getTime() + totalDuration * 60 * 1000)
    : null;

  // Update cookie when selectedServices changes
  useEffect(() => {
    Cookies.set("selectedServices", JSON.stringify(selectedServices), {
      expires: 1,
    });
  }, [selectedServices]);

  // Fetch user data, salons, and staff
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.id) {
          setUser(parsedUser);
          console.log("User loaded from localStorage:", parsedUser);
        } else {
          toast.error("Thông tin người dùng thiếu ID. Vui lòng đăng nhập lại.");
          navigate("/login");
        }
      } catch (e) {
        toast.error("Dữ liệu người dùng không hợp lệ. Vui lòng đăng nhập lại.");
        navigate("/login");
      }
    } else {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
    }

    fetchSalons()
      .then((data) => {
        setSalons(data || []);
        console.log("Salons fetched:", data);
      })
      .catch((err) => {
        setError(err.message);
        toast.error("Không thể tải danh sách salon: " + err.message);
      });

    // Fetch staff and filter by role=STAFF
    axios
      .get("http://localhost:8082/user?role=STAFF", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        const staff = (response.data || []).filter(
          (user) => user.role === "STAFF"
        );
        setStaffList(staff);
        console.log("Staff fetched and filtered:", staff);
        if (!staff.length) {
          toast.warn("Không có nhân viên nào khả dụng.");
        }
      })
      .catch((err) => {
        setError(err.message);
        toast.error("Không thể tải danh sách nhân viên: " + err.message);
      });
  }, [navigate]);

  // Fetch salon data, services, and operating hours
  useEffect(() => {
    if (!selectedSalon) {
      setCategories([]);
      setServices([]);
      setAllServices([]);
      setSelectedCategory("");
      setCurrentService("");
      setSalonAddress("");
      setSalonLocation(null);
      setShowMap(false);
      setSalonOperatingHours({ openingTime: "09:00", closingTime: "18:00" });
      setAvailableSlots([]);
      setSelectedStaff("");
      return;
    }

    const loadData = async () => {
      try {
        const [categoryData, allServicesData, filteredServicesData, salonData] =
          await Promise.all([
            fetchCategoriesBySalon(selectedSalon),
            fetchServicesBySalon(selectedSalon, null),
            fetchServicesBySalon(selectedSalon, selectedCategory || null),
            fetchSalonById(selectedSalon),
          ]);

        const validAllServices = allServicesData.filter(
          (s) => s.id && s.name && s.price != null && s.duration != null
        );
        const validFilteredServices = filteredServicesData.filter(
          (s) => s.id && s.name && s.price != null && s.duration != null
        );

        const validSelectedServices = selectedServices.filter((id) => {
          const isAvailable = validAllServices.some(
            (s) => s.id.toString() === id
          );
          if (!isAvailable) {
            const service =
              allServices.find((s) => s.id.toString() === id) ||
              preSelectedServices?.find((s) => s.id.toString() === id);
            if (service) {
              toast.error(
                `Dịch vụ "${service.name}" không có sẵn tại salon này`
              );
            }
          }
          return isAvailable;
        });

        setCategories(categoryData || []);
        setAllServices(validAllServices);
        setServices(validFilteredServices);
        setSelectedServices(validSelectedServices);
        setCurrentService("");
        const fullAddress = `${salonData.address}, ${salonData.city}, Vietnam`;
        setSalonAddress(fullAddress);
        setSalonOperatingHours({
          openingTime: salonData.openingTime.slice(0, 5),
          closingTime: salonData.closingTime.slice(0, 5),
        });

        const coords = await geocodeAddress(fullAddress);
        setSalonLocation(coords);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      }
    };
    loadData();
  }, [selectedSalon, selectedCategory]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedSalon && selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      fetchAvailableSlots(selectedSalon, formattedDate)
        .then((slots) => {
          setAvailableSlots(slots || []);
          console.log("Available slots fetched:", slots);
        })
        .catch((err) => {
          setError(err.message);
          toast.error("Không thể tải lịch trống: " + err.message);
        });
    } else {
      setAvailableSlots([]);
    }
  }, [selectedSalon, selectedDate]);

  // Fetch user location
  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setShowMap(true);
        },
        (err) => {
          toast.warn(
            "Không thể lấy vị trí của bạn. Vui lòng bật quyền truy cập vị trí."
          );
          console.error("Geolocation error:", err);
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error("Trình duyệt không hỗ trợ định vị.");
    }
  };

  // Geocode salon address using Nominatim
  const geocodeAddress = async (address) => {
    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: { q: address, format: "json", limit: 1 },
          headers: {
            "User-Agent": "SalonBookingApp/1.0 (contact@example.com)",
          },
        }
      );
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      } else {
        throw new Error("Không tìm thấy tọa độ cho địa chỉ này");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      toast.warn(
        "Không thể lấy tọa độ salon. Sử dụng tọa độ mặc định (TP.HCM)."
      );
      return { lat: 10.7769, lng: 106.7009 };
    }
  };

  // Handle service addition
  const handleAddService = () => {
    if (!currentService) {
      toast.warn("Vui lòng chọn một dịch vụ");
      return;
    }
    if (!selectedServices.includes(currentService)) {
      setSelectedServices((prev) => [...prev, currentService]);
      setCurrentService("");
    } else {
      toast.warn("Dịch vụ này đã được chọn");
    }
  };

  // Handle service removal
  const handleRemoveService = (serviceId) => {
    setSelectedServices(selectedServices.filter((id) => id !== serviceId));
  };

  // Handle service details click
  const handleServiceClick = async (serviceId) => {
    try {
      const serviceDetails = await fetchServiceById(serviceId);
      setShowServiceDetails(serviceDetails);
    } catch (err) {
      toast.error("Không thể tải chi tiết dịch vụ: " + err.message);
    }
  };

  // Handle time slot selection
  const handleSelectSlot = (slot) => {
    const slotStart = new Date(slot.startTime);
    setStartTime(slotStart);
  };

  // Generate all possible slots for the day
  const generateAllSlots = () => {
    if (!salonOperatingHours.openingTime || !salonOperatingHours.closingTime)
      return [];
    const [openHour, openMinute] = salonOperatingHours.openingTime
      .split(":")
      .map(Number);
    const [closeHour, closeMinute] = salonOperatingHours.closingTime
      .split(":")
      .map(Number);
    const slots = [];
    let currentTime = new Date(selectedDate);
    currentTime.setHours(openHour, openMinute, 0, 0);

    const closeTime = new Date(selectedDate);
    closeTime.setHours(closeHour, closeMinute, 0, 0);

    while (currentTime < closeTime) {
      const slotStart = new Date(currentTime);
      currentTime.setMinutes(currentTime.getMinutes() + 30);
      if (currentTime <= closeTime) {
        slots.push({
          startTime: slotStart.toISOString(),
          endTime: currentTime.toISOString(),
        });
      }
    }
    return slots;
  };

  // Check if a slot is available
  const isSlotAvailable = (slot) => {
    if (availableSlots.length === 0) {
      return true;
    }
    return availableSlots.some(
      (available) =>
        new Date(available.startTime).getTime() ===
        new Date(slot.startTime).getTime()
    );
  };

  // Validate and proceed to next step
  const handleNextStep = () => {
    if (step === 1 && !selectedSalon) {
      toast.error("Vui lòng chọn salon");
      return;
    }
    if (step === 2 && selectedServices.length === 0) {
      toast.error("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }
    if (step === 3 && !selectedStaff) {
      toast.error("Vui lòng chọn nhân viên hoặc giao cho salon");
      return;
    }
    if (step === 4 && (!selectedDate || !startTime)) {
      toast.error("Vui lòng chọn ngày và giờ");
      return;
    }
    if (step === 4) {
      const startHour = startTime.getHours();
      const startMinute = startTime.getMinutes();
      const endTime = completionTime || startTime;
      const endHour = endTime.getHours();
      const endMinute = endTime.getMinutes();
      const [openHour, openMinute] = salonOperatingHours.openingTime
        .split(":")
        .map(Number);
      const [closeHour, closeMinute] = salonOperatingHours.closingTime
        .split(":")
        .map(Number);

      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;
      const openTimeInMinutes = openHour * 60 + openMinute;
      const closeTimeInMinutes = closeHour * 60 + closeMinute;

      if (
        startTimeInMinutes < openTimeInMinutes ||
        endTimeInMinutes > closeTimeInMinutes
      ) {
        toast.error(
          `Thời gian đặt lịch phải nằm trong giờ hoạt động của salon (${salonOperatingHours.openingTime} - ${salonOperatingHours.closingTime})`
        );
        return;
      }
    }
    if (step === 5 && !paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }
    if (step === 5) {
      setShowBill(true);
    } else {
      setStep(step + 1);
    }
  };

  // Go to previous step
  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Jump to a specific step
  const handleJumpToStep = (targetStep) => {
    if (targetStep > step) {
      if (targetStep >= 2 && !selectedSalon) {
        toast.error("Vui lòng chọn salon trước");
        return;
      }
      if (targetStep >= 3 && selectedServices.length === 0) {
        toast.error("Vui lòng chọn ít nhất một dịch vụ trước");
        return;
      }
      if (targetStep >= 4 && !selectedStaff) {
        toast.error("Vui lòng chọn nhân viên trước");
        return;
      }
      if (targetStep >= 5 && (!selectedDate || !startTime)) {
        toast.error("Vui lòng chọn ngày và giờ trước");
        return;
      }
    }
    setStep(targetStep);
  };

  // Handle staff selection (including random assignment)
  const handleStaffChange = (value) => {
    if (value === "random") {
      if (staffList.length === 0) {
        toast.warn("Không có nhân viên nào khả dụng để chọn ngẫu nhiên.");
        setSelectedStaff("");
      } else if (staffList.length === 1) {
        setSelectedStaff(staffList[0].id);
        toast.info(
          `Chọn nhân viên duy nhất: ${
            staffList[0].fullName ||
            staffList[0].username ||
            "Nhân viên không tên"
          }`
        );
      } else {
        const randomStaff =
          staffList[Math.floor(Math.random() * staffList.length)];
        setSelectedStaff(randomStaff.id);
        toast.info(
          `Đã chọn ngẫu nhiên: ${
            randomStaff.fullName ||
            randomStaff.username ||
            "Nhân viên không tên"
          }`
        );
      }
    } else {
      setSelectedStaff(value);
    }
  };

  // Submit booking
  const handleSubmit = async () => {
    if (!user || !user.id) {
      toast.error("Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    const bookingRequest = {
      startTime: startTime.toISOString(),
      serviceIds: selectedServices.map((id) => parseInt(id)),
    };

    const userData = {
      id: user.id,
      fullname: user.fullname || "Unknown",
      email: user.email || "unknown@example.com",
    };

    try {
      console.log(
        "Calling createBooking with salonId:",
        selectedSalon,
        "customerId:",
        user.id,
        "staffId:",
        selectedStaff,
        "bookingRequest:",
        bookingRequest
      );
      const bookingResponse = await createBooking(
        selectedSalon,
        user.id,
        selectedStaff,
        bookingRequest
      );
      const booking = {
        id: bookingResponse.id,
        totalPrice: totalPrice,
        salonId: parseInt(selectedSalon),
        customerId: user.id,
        staffId: selectedStaff,
        startTime: bookingRequest.startTime,
        endTime: completionTime ? completionTime.toISOString() : null,
        status: "PENDING",
        serviceIds: bookingRequest.serviceIds,
      };

      console.log(
        "Sending payment request with user:",
        userData,
        "booking:",
        booking,
        "paymentMethod:",
        paymentMethod
      );
      const paymentResponse = await createPaymentLink(
        userData,
        booking,
        paymentMethod.toUpperCase()
      );

      setPaymentLink(paymentResponse);
      setBookingStatus("CHỜ XỬ LÝ");

      if (
        paymentMethod.toUpperCase() === "VNPAY" &&
        paymentResponse.paymentLinkUrl
      ) {
        setShowQR(true);
        setTimeout(async () => {
          window.location.href = paymentResponse.paymentLinkUrl;
          try {
            const paymentSuccess = await proceedPayment(
              paymentResponse.paymentLinkId,
              paymentResponse.paymentLinkId
            );
            if (paymentSuccess) {
              setBookingStatus("THÀNH CÔNG");
              setSelectedServices([]);
              Cookies.remove("selectedServices");
              setShowSuccessModal(true);
            } else {
              setBookingStatus("THẤT BẠI");
              setError("Thanh toán VNPAY không thành công.");
              setShowFailureModal(true);
            }
          } catch (err) {
            setError("Thanh toán VNPAY không thành công: " + err.message);
            setBookingStatus("THẤT BẠI");
            setShowFailureModal(true);
          }
        }, 5000);
      } else if (paymentMethod.toUpperCase() === "CASH") {
        setBookingStatus("THÀNH CÔNG");
        setSelectedServices([]);
        Cookies.remove("selectedServices");
        setShowSuccessModal(true);
      }
    } catch (err) {
      setError("Đặt lịch không thành công: " + err.message);
      setBookingStatus("THẤT BẠI");
      setShowFailureModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Parse service steps for name and image
  const parseSteps = (service) => {
    const names = service.name.split("|");
    const images = service.image.split("|");
    return names.map((name, index) => ({
      name,
      image: images[index] || "",
    }));
  };

  // Filter valid description steps
  const getValidSteps = (description) => {
    if (!description) return [];
    const steps = description.split("|").filter((step) => {
      const trimmed = step.trim();
      return (
        trimmed.length > 0 && trimmed !== "eqwewqe" && trimmed !== "fewfdsf"
      );
    });
    return steps;
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/booking");
  };

  const handleCloseFailureModal = () => {
    setShowFailureModal(false);
  };

  const handleCloseServiceDetails = () => {
    setShowServiceDetails(null);
  };

  const qrCodeValue =
    paymentLink?.paymentLinkUrl ||
    `Payment for booking at salon ${selectedSalon} via ${paymentMethod}`;

  const formatDateTime = (date) => {
    if (!date) return "Chưa chọn";
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const path =
    userLocation && salonLocation
      ? [
          [userLocation.lat, userLocation.lng],
          [salonLocation.lat, salonLocation.lng],
        ]
      : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>Đặt Lịch Salon - Dịch Vụ Làm Đẹp Chuyên Nghiệp</title>
        <meta
          name="description"
          content="Đặt lịch hẹn tại salon làm đẹp với quy trình dễ dàng, chọn dịch vụ, nhân viên, thời gian và thanh toán trực tuyến. Đảm bảo trải nghiệm tuyệt vời!"
        />
        <meta
          name="keywords"
          content="đặt lịch salon, làm đẹp, dịch vụ salon, cắt tóc, gội đầu, VNPay"
        />
      </Helmet>
      <ToastContainer />
      <div className="container mx-auto px-4 py-10 mt-16 animate-slide-in">
        <h1 className="text-4xl font-bold text-amber-900 mb-8 text-center">
          Đặt Lịch Hẹn
        </h1>
        {error && !showFailureModal && (
          <p className="text-red-500 mb-4 text-center">{error}</p>
        )}

        {/* Step Navigation */}
        <div className="mb-8">
          <div className="flex justify-between items-center gap-2">
            {[
              "Chọn Salon",
              "Chọn Dịch Vụ",
              "Chọn Nhân Viên",
              "Chọn Thời Gian",
              "Phương Thức Thanh Toán",
            ].map((label, index) => (
              <button
                key={index}
                onClick={() => handleJumpToStep(index + 1)}
                className={`flex-1 text-center py-3 rounded-lg transition-all duration-300 ${
                  step > index + 1
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : step === index + 1
                    ? "bg-amber-600 text-white"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-amber-600`}
                aria-label={`Chuyển đến bước ${label}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto transition-all duration-500">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                Bước 1: Chọn Salon
              </h2>
              <select
                value={selectedSalon}
                onChange={(e) => {
                  setSelectedSalon(e.target.value);
                  setSelectedCategory("");
                  setCurrentService("");
                  setSelectedDate(null);
                  setStartTime(null);
                  setSelectedStaff("");
                }}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600 transition-all"
                aria-label="Chọn salon"
              >
                <option value="">Chọn salon</option>
                {salons.map((salon) => (
                  <option key={salon.id} value={salon.id}>
                    {salon.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                Bước 2: Chọn Dịch Vụ
              </h2>
              <div className="mb-6">
                <label className="block text-amber-900 font-medium mb-2">
                  Chọn Danh Mục (Tùy Chọn)
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600 transition-all"
                  aria-label="Chọn danh mục dịch vụ"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-amber-900 font-medium mb-2">
                  Chọn Dịch Vụ
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600 bg-white text-left flex items-center justify-between transition-all"
                      aria-expanded={isDropdownOpen}
                      aria-controls="service-dropdown"
                      disabled={!services.length}
                    >
                      <span>
                        {currentService
                          ? services
                              .find(
                                (srv) => srv.id.toString() === currentService
                              )
                              ?.name.split("|")[0] || "Chọn dịch vụ"
                          : "Chọn dịch vụ"}
                      </span>
                      <svg
                        className={`w-5 h-5 transform transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <ul
                        id="service-dropdown"
                        className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        role="listbox"
                      >
                        {services
                          .filter(
                            (srv) =>
                              !selectedServices.includes(srv.id.toString())
                          )
                          .map((srv) => (
                            <li
                              key={srv.id}
                              onClick={() => {
                                setCurrentService(srv.id.toString());
                                setIsDropdownOpen(false);
                              }}
                              className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer transition-all"
                              role="option"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  setCurrentService(srv.id.toString());
                                  setIsDropdownOpen(false);
                                }
                              }}
                            >
                              <img
                                src={
                                  srv.image
                                    ? `http://localhost:8083/service-offering-images/${
                                        srv.image.split("|")[0]
                                      }`
                                    : "/placeholder-image.png"
                                }
                                alt={srv.name.split("|")[0]}
                                className="w-6 h-6 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = "/placeholder-image.png";
                                }}
                              />
                              <div className="flex-1">
                                <span>{srv.name.split("|")[0]}</span>
                                <span className="block text-sm text-gray-600">
                                  {(srv.price || 0).toLocaleString("vi-VN")} VND
                                  ({srv.duration || 0} phút)
                                </span>
                              </div>
                            </li>
                          ))}
                        {services.filter(
                          (srv) => !selectedServices.includes(srv.id.toString())
                        ).length === 0 && (
                          <li className="p-3 text-gray-500">
                            Không có dịch vụ nào
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-all"
                    disabled={!currentService}
                    aria-label="Thêm dịch vụ"
                  >
                    Thêm
                  </button>
                </div>
              </div>
              {selectedServiceDetails.length > 0 && (
                <div>
                  <p className="text-amber-900 font-medium mb-3">
                    Dịch vụ đã chọn:
                  </p>
                  <ul className="space-y-3">
                    {selectedServiceDetails.map((srv) => (
                      <li
                        key={srv.id}
                        className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-all"
                        onClick={() => handleServiceClick(srv.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleServiceClick(srv.id)
                        }
                        aria-label={`Xem chi tiết dịch vụ ${
                          srv.name.split("|")[0]
                        }`}
                      >
                        <img
                          src={
                            srv.image
                              ? `http://localhost:8083/service-offering-images/${
                                  srv.image.split("|")[0]
                                }`
                              : "/placeholder-image.png"
                          }
                          alt={srv.name.split("|")[0]}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "/placeholder-image.png";
                          }}
                        />
                        <div className="flex-1">
                          <span className="font-medium">
                            {srv.name.split("|")[0]}
                          </span>
                          <span className="block text-sm text-gray-600">
                            {(srv.price || 0).toLocaleString("vi-VN")} VND (
                            {srv.duration || 0} phút)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveService(srv.id.toString());
                          }}
                          className="text-red-500 hover:text-red-700 font-semibold"
                          aria-label={`Xóa dịch vụ ${srv.name.split("|")[0]}`}
                        >
                          Xóa
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                Bước 3: Chọn Nhân Viên
              </h2>
              <select
                value={selectedStaff}
                onChange={(e) => handleStaffChange(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600 transition-all"
                aria-label="Chọn nhân viên"
                disabled={staffList.length === 0}
              >
                <option value="">Chọn nhân viên</option>
                <option value="random">Giao cho salon chọn</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName || staff.username || "Nhân viên không tên"}
                  </option>
                ))}
              </select>
              {staffList.length === 0 && (
                <p className="text-red-500 mt-2">
                  Không có nhân viên nào khả dụng.
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                Bước 4: Chọn Ngày và Giờ
              </h2>
              <div className="mb-6">
                <label className="block text-amber-900 font-medium mb-2">
                  Chọn Ngày
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  locale={vi}
                  placeholderText="Chọn ngày"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600 transition-all"
                  wrapperClassName="w-full"
                  aria-label="Chọn ngày"
                />
              </div>
              {selectedDate && (
                <div>
                  <label className="block text-amber-900 font-medium mb-2">
                    Chọn Giờ ({salonOperatingHours.openingTime} -{" "}
                    {salonOperatingHours.closingTime})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {generateAllSlots().map((slot, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          isSlotAvailable(slot) && handleSelectSlot(slot)
                        }
                        disabled={!isSlotAvailable(slot)}
                        className={`p-3 rounded-lg text-center transition-all ${
                          isSlotAvailable(slot)
                            ? startTime &&
                              new Date(slot.startTime).getTime() ===
                                startTime.getTime()
                              ? "bg-amber-600 text-white"
                              : "bg-green-100 hover:bg-green-200 text-green-900"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        aria-label={`Chọn khung giờ ${formatTime(
                          new Date(slot.startTime)
                        )}`}
                      >
                        {formatTime(new Date(slot.startTime))}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                Bước 5: Chọn Phương Thức Thanh Toán
              </h2>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600 transition-all"
                aria-label="Chọn phương thức thanh toán"
              >
                <option value="">Chọn phương thức</option>
                <option value="VNPAY">VNPay</option>
                <option value="CASH">Tiền mặt</option>
              </select>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
                aria-label="Quay lại bước trước"
              >
                Quay Lại
              </button>
            )}
            <button
              onClick={handleNextStep}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all"
              aria-label={step === 5 ? "Xem hóa đơn" : "Tiếp theo"}
            >
              {step === 5 ? "Xem Hóa Đơn" : "Tiếp Theo"}
            </button>
          </div>
        </div>

        {/* Bill Display */}
        {showBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-12 rounded-xl shadow-2xl max-w-4xl w-full h-[90vh] overflow-y-auto animate-fade-in">
              <h2 className="text-3xl font-bold text-amber-900 mb-6">
                Hóa Đơn Đặt Lịch
              </h2>
              <div className="mb-6 space-y-3">
                <p className="text-gray-700">
                  <strong>Salon:</strong>{" "}
                  {salons.find((s) => s.id == selectedSalon)?.name ||
                    "Đang chọn"}
                </p>
                <p className="text-gray-700">
                  <strong>Địa chỉ:</strong> {salonAddress}
                </p>
                <p className="text-gray-700">
                  <strong>Nhân viên:</strong>{" "}
                  {staffList.find((s) => s.id == selectedStaff)?.fullName ||
                    staffList.find((s) => s.id == selectedStaff)?.username ||
                    "Giao cho salon chọn"}
                </p>
                <p className="text-gray-700">
                  <strong>Thời gian bắt đầu:</strong>{" "}
                  {formatDateTime(startTime)}
                </p>
                <p className="text-gray-700">
                  <strong>Thời gian hoàn thành:</strong>{" "}
                  {formatDateTime(completionTime)}
                </p>
                <p className="text-gray-700">
                  <strong>Phương thức thanh toán:</strong>{" "}
                  {paymentMethod.toUpperCase()}
                </p>
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-3">
                Dịch Vụ Đã Chọn
                <span className="text-green-600 font-semibold ml-2">
                  ({selectedServiceDetails.length} dịch vụ)
                </span>
              </h3>
              <ul className="mb-6 space-y-4 max-w-full">
                {selectedServiceDetails.length > 0 ? (
                  selectedServiceDetails.map((srv) => (
                    <li
                      key={srv.id}
                      className="flex items-center gap-6 text-gray-700 py-3"
                    >
                      <img
                        src={
                          srv.image
                            ? `http://localhost:8083/service-offering-images/${
                                srv.image.split("|")[0]
                              }`
                            : "/placeholder-image.png"
                        }
                        alt={srv.name.split("|")[0]}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.png";
                        }}
                      />
                      <div className="flex-1">
                        <span>{srv.name.split("|")[0]}</span>
                        <span className="block text-sm">
                          {(srv.price || 0).toLocaleString("vi-VN")} VND
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => handleServiceClick(srv.id)}
                          className="px-4 py-1 border border-amber-600 text-amber-600 font-semibold rounded-md hover:bg-amber-600 hover:text-white transition duration-200 cursor-pointer"
                          aria-label={`Xem chi tiết dịch vụ ${
                            srv.name.split("|")[0]
                          }`}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-700">
                    Không có dịch vụ nào được chọn
                  </li>
                )}
              </ul>
              <p className="text-2xl text-amber-700 font-bold">
                Tổng cộng: {totalPrice.toLocaleString("vi-VN")} VND
              </p>
              <p className="text-gray-700 mt-2">
                Tổng thời gian: {totalDuration} phút
              </p>

              {showQR &&
                paymentMethod &&
                paymentMethod.toUpperCase() === "VNPAY" && (
                  <div className="mt-6 text-center max-w-sm mx-auto">
                    <p className="text-gray-700 mb-3">
                      Quét mã QR để thanh toán qua VNPay
                    </p>
                    <QRCode value={qrCodeValue} size={150} />
                  </div>
                )}

              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => setShowBill(false)}
                  className="px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
                  aria-label="Hủy hóa đơn"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-label="Xác nhận đặt lịch"
                >
                  {loading ? "Đang xử lý..." : "Đặt Lịch"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Details Modal */}
        {showServiceDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-12 rounded-xl shadow-2xl w-full max-w-[95vw] h-[95vh] overflow-y-auto animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-amber-900">
                  Chi Tiết Dịch Vụ: {showServiceDetails.name.split("|")[0]}
                </h2>
                <button
                  onClick={handleCloseServiceDetails}
                  className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 transition-all"
                  aria-label="Đóng chi tiết dịch vụ"
                >
                  ×
                </button>
              </div>
              <div className="mb-8">
                <img
                  src={
                    showServiceDetails.image
                      ? `http://localhost:8083/service-offering-images/${
                          showServiceDetails.image.split("|")[0]
                        }`
                      : "/placeholder-image.png"
                  }
                  alt={showServiceDetails.name.split("|")[0]}
                  className="w-full max-w-md h-64 object-cover rounded-lg mb-6 mx-auto"
                  onError={(e) => {
                    e.target.src = "/placeholder-image.png";
                  }}
                />
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <tbody>
                      <tr className="bg-gray-50">
                        <td className="p-4 font-semibold text-amber-900">
                          Tên Dịch Vụ
                        </td>
                        <td className="p-4 text-gray-700">
                          {showServiceDetails.name.split("|")[0]}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-amber-900">
                          Giá
                        </td>
                        <td className="p-4 text-gray-700">
                          {(showServiceDetails.price || 0).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VND
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-4 font-semibold text-amber-900">
                          Thời Gian
                        </td>
                        <td className="p-4 text-gray-700">
                          {showServiceDetails.duration || 0} phút
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              {getValidSteps(showServiceDetails.description).length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-amber-900 mb-6">
                    Các Bước Thực Hiện
                  </h3>
                  <div className="space-y-6">
                    {(() => {
                      const steps = parseSteps(showServiceDetails);
                      const descriptions = getValidSteps(
                        showServiceDetails.description
                      );
                      return steps.slice(1).map((step, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg shadow-sm"
                        >
                          <div className="flex-shrink-0 w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-lg font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-lg font-semibold text-gray-700">
                              {index === 0 ? "Dịch vụ" : `Bước ${index + 1}`}:{" "}
                              {step.name || "Không có tên"}
                            </p>
                            <p className="text-gray-700 text-lg mt-2">
                              {descriptions[index]
                                ? descriptions[index].trim()
                                : "Không có mô tả"}
                            </p>
                            {step.image && (
                              <img
                                src={`http://localhost:8083/service-offering-images/${step.image}`}
                                alt={`Hình ảnh bước ${index + 1}`}
                                className="mt-4 w-32 h-32 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = "/placeholder-image.png";
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
              {getValidSteps(showServiceDetails.description).length === 0 && (
                <p className="text-gray-700 text-lg">
                  Không có thông tin về các bước thực hiện
                </p>
              )}
              <div className="mt-10 flex justify-end">
                <button
                  onClick={handleCloseServiceDetails}
                  className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all"
                  aria-label="Đóng chi tiết dịch vụ"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map */}
        {selectedSalon && (
          <div className="mt-8 text-center">
            <button
              onClick={fetchUserLocation}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              aria-label="Hiển thị bản đồ chỉ đường"
            >
              Chỉ Đường Đến Salon
            </button>
          </div>
        )}

        {showMap && selectedSalon && userLocation && salonLocation && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">
              Đường đi đến{" "}
              {salons.find((s) => s.id == selectedSalon)?.name || "Salon"}
            </h2>
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={12}
              style={{ height: "400px", width: "100%" }}
              className="rounded-lg shadow-md"
            >
              <TileLayer
                url="https://://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>Vị trí của bạn</Popup>
              </Marker>
              <Marker position={[salonLocation.lat, salonLocation.lng]}>
                <Popup>
                  {salons.find((s) => s.id == selectedSalon)?.name || "Salon"}
                </Popup>
              </Marker>
              {path.length > 0 && (
                <Polyline
                  positions={path}
                  color="#ff7800"
                  weight={5}
                  opacity={0.65}
                />
              )}
            </MapContainer>
          </div>
        )}

        {/* Modals */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center animate-fade-in">
              <h2 className="text-3xl font-bold text-green-600 mb-4">
                Đặt Lịch Thành Công
              </h2>
              <p className="text-gray-700 mb-6">
                Lịch hẹn của bạn tại{" "}
                {salons.find((s) => s.id == selectedSalon)?.name || "salon"} đã
                được xác nhận.
              </p>
              <button
                onClick={handleCloseSuccessModal}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all"
                aria-label="Đóng thông báo thành công"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {showFailureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2KILL max-w-md w-full text-center animate-fade-in">
              <h2 className="text-3xl font-bold text-red-600 mb-4">
                Đặt Lịch Thất Bại
              </h2>
              <p className="text-gray-700 mb-6">
                {error || "Đã xảy ra lỗi khi đặt lịch. Vui lòng thử lại."}
              </p>
              <button
                onClick={handleCloseFailureModal}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all"
                aria-label="Đóng thông báo thất bại"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
