import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { vi } from "date-fns/locale";
import { parseISO, isValid, addMinutes, format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Cookies from "js-cookie";
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
  fetchBookedSlots,
} from "../../api/booking";

const BookingPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { userId, salonId, services: preSelected } = state || {};

  const [user, setUser] = useState(null);
  const [salons, setSalons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [salon, setSalon] = useState(salonId || "");
  const [category, setCategory] = useState("");
  const [selectedServices, setSelectedServices] = useState(() => {
    const saved = Cookies.get("selectedServices");
    const preIds = preSelected
      ? preSelected
          .filter(
            (s) => s.id && s.name && s.price != null && s.duration != null
          )
          .map((s) => s.id.toString())
      : [];
    return saved ? [...new Set([...JSON.parse(saved), ...preIds])] : preIds;
  });
  const [currentService, setCurrentService] = useState("");
  const [staff, setStaff] = useState("");
  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("CHỜ XỬ LÝ");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showBill, setShowBill] = useState(false);
  const [address, setAddress] = useState("");
  const [paymentLink, setPaymentLink] = useState(null);
  const [hours, setHours] = useState({ open: "09:00", close: "18:00" });
  const [successModal, setSuccessModal] = useState(false);
  const [failureModal, setFailureModal] = useState(false);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedDetails = allServices.filter((s) =>
    selectedServices.includes(s.id.toString())
  );
  const totalPrice = selectedDetails.reduce(
    (sum, s) => sum + (s.price || 0),
    0
  );
  const totalDuration = selectedDetails.reduce(
    (sum, s) => sum + (s.duration || 0),
    0
  );
  const endTime =
    startTime && totalDuration > 0
      ? addMinutes(startTime, totalDuration)
      : null;

  useEffect(() => {
    Cookies.set("selectedServices", JSON.stringify(selectedServices), {
      expires: 1,
    });
  }, [selectedServices]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.id) setUser(parsed);
        else {
          toast.error("Thiếu ID người dùng. Đăng nhập lại.");
          navigate("/login");
        }
      } catch {
        toast.error("Dữ liệu người dùng không hợp lệ. Đăng nhập lại.");
        navigate("/login");
      }
    } else {
      toast.error("Vui lòng đăng nhập.");
      navigate("/login");
    }

    fetchSalons()
      .then((data) => {
        if (data?.length) setSalons(data);
        else {
          setSalons([]);
          toast.warn("Không tìm thấy salon.");
        }
      })
      .catch((err) => {
        setError(err.message);
        setSalons([]);
        toast.error("Lỗi tải danh sách salon: " + err.message);
      });

    const fetchStaff = async () => {
      try {
        const res = await axios.get("http://localhost:8082/user", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const staff = (res.data || []).filter((u) => u.role === "STAFF");
        console.log("Staff list:", staff);
        setStaffList(staff);
        if (!staff.length) {
          toast.warn("Không có nhân viên.");
          setStaff("");
        }
      } catch (err) {
        setError(err.message);
        toast.error("Lỗi tải danh sách nhân viên: " + err.message);
        setStaffList([]);
        setStaff("");
      }
    };
    fetchStaff();
  }, [navigate]);

  useEffect(() => {
    if (!salon) {
      setCategories([]);
      setServices([]);
      setAllServices([]);
      setCategory("");
      setCurrentService("");
      setAddress("");
      setHours({ open: "09:00", close: "18:00" });
      setBookedSlots([]);
      setStaff("");
      return;
    }

    const loadData = async () => {
      try {
        const [catData, srvData, salonData] = await Promise.all([
          fetchCategoriesBySalon(salon),
          fetchServicesBySalon(salon, category || null),
          fetchSalonById(salon),
        ]);

        const validServices = srvData.filter(
          (s) => s.id && s.name && s.price != null && s.duration != null
        );

        setCategories(catData || []);
        setAllServices(validServices);
        setServices(validServices);
        setCurrentService("");
        setAddress(`${salonData.address}, ${salonData.city}, Vietnam`);
        setHours({
          open: salonData.openingTime.slice(0, 5),
          close: salonData.closingTime.slice(0, 5),
        });
        console.log(
          "Salon hours:",
          salonData.openingTime,
          salonData.closingTime
        );
      } catch (err) {
        setError(err.message);
        toast.error("Lỗi tải dữ liệu salon: " + err.message);
        setServices([]);
        setAllServices([]);
      }
    };
    loadData();
  }, [salon, category]);

  useEffect(() => {
    if (salon && date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      console.log(
        "Fetching booked slots for salon:",
        salon,
        "date:",
        formattedDate,
        "staff:",
        staff
      );
      fetchBookedSlots(salon, formattedDate)
        .then((data) => {
          console.log("Booked slots received:", data);
          setBookedSlots(data || []);
          if (!data.length) {
            toast.info("Không có lịch đặt cho ngày này.");
          }
        })
        .catch((err) => {
          console.error("Error fetching booked slots:", err);
          setError(err.message);
          toast.error("Lỗi tải lịch đã đặt: " + err.message);
          setBookedSlots([]);
        });
    } else {
      setBookedSlots([]);
    }
  }, [salon, date, staff]);

  const addService = () => {
    if (!currentService) return toast.warn("Chọn dịch vụ");
    if (selectedServices.includes(currentService)) {
      toast.warn("Dịch vụ đã chọn");
      setCurrentService("");
      setDropdownOpen(false);
      return;
    }
    setSelectedServices((prev) => [...prev, currentService]);
    setCurrentService("");
    setDropdownOpen(false);
  };

  const removeService = (id) =>
    setSelectedServices(selectedServices.filter((s) => s !== id));

  const showService = async (id) => {
    try {
      const details = await fetchServiceById(id);
      setServiceDetails(details);
    } catch (err) {
      toast.error("Lỗi tải chi tiết dịch vụ: " + err.message);
    }
  };

  const selectSlot = (slot) => {
    setStartTime(parseISO(slot.startTime));
    console.log("Selected slot:", slot.startTime);
  };

  const generateSlots = () => {
    if (!hours.open || !hours.close || !date) return [];
    const [openH, openM] = hours.open.split(":").map(Number);
    const [closeH, closeM] = hours.close.split(":").map(Number);
    const slots = [];
    let time = new Date(date);
    time.setHours(openH, openM, 0, 0);
    const closeTime = new Date(date);
    closeTime.setHours(closeH, closeM, 0, 0);

    while (time < closeTime) {
      const start = new Date(time);
      time = addMinutes(time, 30);
      if (time <= closeTime) {
        slots.push({
          startTime: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
          endTime: format(time, "yyyy-MM-dd'T'HH:mm:ss"),
        });
      }
    }
    console.log("Generated slots:", slots);
    return slots;
  };

  const isSlotAvailable = (slot) => {
    if (!bookedSlots.length) {
      console.log("No booked slots, slot available:", slot.startTime);
      return true;
    }
    const slotStart = parseISO(slot.startTime);
    const slotEnd = parseISO(slot.endTime);
    if (!isValid(slotStart) || !isValid(slotEnd)) {
      console.warn("Invalid slot times:", slot);
      return false;
    }
    const isAvailable = !bookedSlots.some((b) => {
      const bookedStart = parseISO(b.startTime);
      const bookedEnd = parseISO(b.endTime);
      if (!isValid(bookedStart) || !isValid(bookedEnd)) {
        console.warn("Invalid booked slot times:", b);
        return false;
      }
      const isOverlapping = slotStart < bookedEnd && slotEnd > bookedStart;
      const staffMatch = staff ? b.staffId.toString() === staff : true;
      console.log(
        `Checking slot ${format(slotStart, "HH:mm")} - ${format(
          slotEnd,
          "HH:mm"
        )}: ` +
          `isOverlapping=${isOverlapping}, staffMatch=${staffMatch}, ` +
          `booked=${format(bookedStart, "HH:mm")} - ${format(
            bookedEnd,
            "HH:mm"
          )}, ` +
          `bookedStaffId=${b.staffId}`
      );
      return isOverlapping && staffMatch;
    });
    console.log(
      `Slot ${format(slotStart, "HH:mm")} is ${
        isAvailable ? "available" : "unavailable"
      }`
    );
    return isAvailable;
  };

  const nextStep = () => {
    if (step === 1 && !salon) return toast.error("Chọn salon");
    if (step === 2 && !selectedServices.length)
      return toast.error("Chọn ít nhất một dịch vụ");
    if (step === 3 && !staff) return toast.error("Chọn nhân viên");
    if (step === 4 && (!date || !startTime))
      return toast.error("Chọn ngày giờ");
    if (step === 4) {
      const [openH, openM] = hours.open.split(":").map(Number);
      const [closeH, closeM] = hours.close.split(":").map(Number);
      const startH = startTime.getHours();
      const startM = startTime.getMinutes();
      const end = endTime || startTime;
      const endH = end.getHours();
      const endM = end.getMinutes();
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      const openMin = openH * 60 + openM;
      const closeMin = closeH * 60 + closeM;

      if (startMin < openMin || endMin > closeMin)
        return toast.error(
          `Thời gian phải trong giờ hoạt động (${hours.open} - ${hours.close})`
        );
      if (!endTime) return toast.error("Lỗi tính thời gian kết thúc.");
    }
    if (step === 5 && !paymentMethod)
      return toast.error("Chọn phương thức thanh toán");
    if (step === 5) setShowBill(true);
    else setStep(step + 1);
  };

  const prevStep = () => step > 1 && setStep(step - 1);

  const jumpToStep = (target) => {
    if (target > step) {
      if (target >= 2 && !salon) return toast.error("Chọn salon trước");
      if (target >= 3 && !selectedServices.length)
        return toast.error("Chọn dịch vụ trước");
      if (target >= 4 && !staff) return toast.error("Chọn nhân viên trước");
      if (target >= 5 && (!date || !startTime))
        return toast.error("Chọn ngày giờ trước");
    }
    setStep(target);
  };

  const changeStaff = (value) => {
    if (value === "random") {
      if (!staffList.length) {
        toast.error("Không có nhân viên để chọn.");
        setStaff("");
      } else {
        const random = staffList[Math.floor(Math.random() * staffList.length)];
        setStaff(random.id.toString());
        toast.info(
          `Chọn ngẫu nhiên: ${
            random.fullName || random.username || "Nhân viên"
          }`
        );
        console.log("Selected random staff:", random.id);
      }
    } else if (value && staffList.some((s) => s.id.toString() === value)) {
      setStaff(value);
      console.log("Selected staff:", value);
    } else {
      setStaff("");
      console.log("Staff cleared");
    }
  };

  const submit = async () => {
    if (!user?.id) {
      toast.error("Lỗi người dùng. Đăng nhập lại.");
      navigate("/login");
      return;
    }
    if (!salon) return toast.error("Chọn salon.");
    if (!selectedServices.length)
      return toast.error("Chọn ít nhất một dịch vụ.");
    if (!staff) return toast.error("Chọn nhân viên.");
    if (!startTime) return toast.error("Chọn thời gian bắt đầu.");
    if (!endTime) return toast.error("Lỗi thời gian kết thúc.");
    if (totalPrice <= 0) return toast.error("Tổng giá phải lớn hơn 0.");

    setLoading(true);
    setError("");

    const bookingReq = {
      startTime: format(startTime, "yyyy-MM-dd'T'HH:mm:ss"),
      endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
      staffId: Number(staff),
      totalPrice,
      serviceIds: selectedServices.map(Number),
    };

    console.log(
      "Booking request payload:",
      JSON.stringify(bookingReq, null, 2)
    );

    const userData = {
      id: user.id,
      fullname: user.fullname || "Unknown",
      email: user.email || "unknown@example.com",
    };

    try {
      console.log("Creating booking...");
      const bookingRes = await createBooking(salon, user.id, bookingReq);
      console.log("Booking created:", bookingRes);

      const booking = {
        id: bookingRes.id,
        totalPrice,
        salonId: Number(salon),
        customerId: user.id,
        staffId: Number(staff),
        startTime: bookingReq.startTime,
        endTime: bookingReq.endTime,
        serviceIds: bookingReq.serviceIds,
      };

      console.log("Creating payment link...");
      const paymentRes = await createPaymentLink(
        userData,
        booking,
        paymentMethod.toUpperCase()
      );
      console.log(
        "Payment link response:",
        JSON.stringify(paymentRes, null, 2)
      );

      const paymentId = paymentRes.getPayment_link_id;
      setPaymentLink(paymentRes);
      setStatus("CHỜ XỬ LÝ");

      let paymentSuccess = paymentMethod.toUpperCase() === "CASH";
      if (!paymentSuccess) {
        console.log("Processing payment for ID:", paymentId);
        paymentSuccess = await proceedPayment(paymentId);
        console.log("Payment processing result:", paymentSuccess);
        if (!paymentSuccess) {
          throw new Error("Thanh toán thất bại: Không thể xử lý thanh toán.");
        }
      }

      console.log("Saving booking to database...");
      await axios.post(
        "http://localhost:8087/booking/save",
        {
          id: booking.id,
          salonId: booking.salonId,
          customerId: booking.customerId,
          staffId: booking.staffId,
          totalPrice: booking.totalPrice,
          startTime: booking.startTime,
          endTime: booking.endTime,
          serviceIds: booking.serviceIds,
          paymentId: paymentId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Booking saved with paymentId:", paymentId);

      console.log("Checking booking status...");
      let statusRes;
      try {
        statusRes = await axios.get(
          `http://localhost:8087/booking/${booking.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Booking status:", statusRes.data.status);
      } catch (statusErr) {
        console.warn(
          "Status check failed, assuming success since booking saved:",
          statusErr.message
        );
        statusRes = { data: { status: "PENDING" } }; // Fallback to allow success modal
      }

      if (
        statusRes.data.status === "PENDING" ||
        statusRes.data.status === "SUCCESS"
      ) {
        setStatus("THÀNH CÔNG");
        setSelectedServices([]);
        Cookies.remove("selectedServices");
        setSuccessModal(true);
      } else {
        setStatus("THẤT BẠI");
        setError(
          `Đặt lịch thất bại: Trạng thái không phải SUCCESS (nhận được: ${statusRes.data.status})`
        );
        setFailureModal(true);
      }
    } catch (err) {
      console.error("Error in submit:", err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(
        `Đặt lịch thất bại: ${
          errorMessage.includes("connect") || errorMessage.includes("network")
            ? "Không thể kết nối đến dịch vụ thanh toán"
            : errorMessage
        }`
      );
      setStatus("THẤT BẠI");
      setFailureModal(true);
    } finally {
      setLoading(false);
    }
  };

  const parseSteps = (srv) => {
    const names = srv.name.split("|");
    const images = srv.image ? srv.image.split("|") : [];
    return names.map((name, i) => ({ name, image: images[i] || "" }));
  };

  const getValidSteps = (desc) =>
    desc
      ? desc
          .split("|")
          .filter(
            (step) =>
              step.trim().length > 0 &&
              step.trim() !== "eqwewqe" &&
              step.trim() !== "fewfdsf"
          )
      : [];

  const closeSuccess = () => {
    setSuccessModal(false);
    navigate("/");
  };

  const closeFailure = () => setFailureModal(false);

  const closeDetails = () => setServiceDetails(null);

  const formatDateTime = (d) =>
    d ? format(d, "dd/MM/yyyy HH:mm", { locale: vi }) : "Chưa chọn";

  const formatTime = (d) => format(d, "HH:mm", { locale: vi });

  const isAllSlotsBooked = () =>
    date &&
    generateSlots().length > 0 &&
    generateSlots().every((slot) => !isSlotAvailable(slot));

  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>Đặt Lịch Salon</title>
        <meta name="description" content="Đặt lịch hẹn salon dễ dàng." />
        <meta
          name="keywords"
          content="đặt lịch salon, làm đẹp, dịch vụ salon"
        />
      </Helmet>
      <ToastContainer />
      <div className="container mx-auto px-4 py-10 mt-16">
        <h1 className="text-4xl font-bold text-amber-900 mb-8 text-center">
          Đặt Lịch Hẹn
        </h1>
        {error && !failureModal && (
          <p className="text-red-500 mb-4 text-center">{error}</p>
        )}

        <div className="mb-8">
          <div className="flex justify-between gap-2">
            {[
              "Chọn Salon",
              "Chọn Dịch Vụ",
              "Chọn Nhân Viên",
              "Chọn Thời Gian",
              "Thanh Toán",
            ].map((label, i) => (
              <button
                key={i}
                onClick={() => jumpToStep(i + 1)}
                className={`flex-1 py-3 rounded-lg transition-all duration-300 ${
                  step > i + 1
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : step === i + 1
                    ? "bg-amber-600 text-white"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-amber-600`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                Chọn Salon
              </h2>
              <select
                value={salon}
                onChange={(e) => {
                  setSalon(e.target.value);
                  setCategory("");
                  setCurrentService("");
                  setDate(null);
                  setStartTime(null);
                  setStaff("");
                }}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600"
                disabled={!salons.length}
              >
                <option value="">Chọn salon</option>
                {salons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {!salons.length && (
                <p className="text-red-500 mt-2">Không có salon khả dụng.</p>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                Chọn Dịch Vụ
              </h2>
              <div className="mb-6">
                <label className="block text-amber-900 font-medium mb-2">
                  Danh Mục
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setCurrentService("");
                  }}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600"
                >
                  <option value="">Tất cả</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-amber-900 font-medium mb-2">
                  Dịch Vụ
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full p-3 border rounded-lg bg-white text-left flex justify-between focus:outline-none focus:ring-2 focus:ring-amber-600"
                      disabled={!services.length}
                    >
                      <span>
                        {currentService
                          ? services
                              .find((s) => s.id.toString() === currentService)
                              ?.name.split("|")[0] || "Chọn dịch vụ"
                          : "Chọn dịch vụ"}
                      </span>
                      <svg
                        className={`w-5 h-5 transition-transform ${
                          dropdownOpen ? "rotate-180" : ""
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
                    {dropdownOpen && (
                      <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {services.length ? (
                          services
                            .filter(
                              (s) => !selectedServices.includes(s.id.toString())
                            )
                            .map((s) => (
                              <li
                                key={s.id}
                                onClick={() => {
                                  setCurrentService(s.id.toString());
                                  setDropdownOpen(false);
                                }}
                                className="flex gap-3 p-3 hover:bg-gray-100 cursor-pointer"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    setCurrentService(s.id.toString());
                                    setDropdownOpen(false);
                                  }
                                }}
                              >
                                <img
                                  src={
                                    s.image
                                      ? `http://localhost:8083/service-offering-images/${
                                          s.image.split("|")[0]
                                        }`
                                      : "/placeholder-image.png"
                                  }
                                  alt={s.name.split("|")[0]}
                                  className="w-6 h-6 object-cover rounded"
                                  onError={(e) =>
                                    (e.target.src = "/placeholder-image.png")
                                  }
                                />
                                <div className="flex-1">
                                  <span>{s.name.split("|")[0]}</span>
                                  <span className="block text-sm text-gray-600">
                                    {(s.price || 0).toLocaleString("vi-VN")} VND
                                    ({s.duration || 0} phút)
                                  </span>
                                </div>
                              </li>
                            ))
                        ) : (
                          <li className="p-3 text-gray-500">
                            Không có dịch vụ
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={addService}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                    disabled={!currentService}
                  >
                    Thêm
                  </button>
                </div>
              </div>
              {selectedDetails.length > 0 && (
                <div>
                  <p className="text-amber-900 font-medium mb-3">
                    Dịch vụ đã chọn:
                  </p>
                  <ul className="space-y-3">
                    {selectedDetails.map((s) => (
                      <li
                        key={s.id}
                        className="flex gap-4 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => showService(s.id)}
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === "Enter" && showService(s.id)
                        }
                      >
                        <img
                          src={
                            s.image
                              ? `http://localhost:8083/service-offering-images/${
                                  s.image.split("|")[0]
                                }`
                              : "/placeholder-image.png"
                          }
                          alt={s.name.split("|")[0]}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) =>
                            (e.target.src = "/placeholder-image.png")
                          }
                        />
                        <div className="flex-1">
                          <span className="font-medium">
                            {s.name.split("|")[0]}
                          </span>
                          <span className="block text-sm text-gray-600">
                            {(s.price || 0).toLocaleString("vi-VN")} VND (
                            {s.duration || 0} phút)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeService(s.id.toString());
                          }}
                          className="text-red-500 hover:text-red-700 font-semibold"
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
                Chọn Nhân Viên
              </h2>
              <select
                value={staff}
                onChange={(e) => changeStaff(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600"
                disabled={!staffList.length}
              >
                <option value="">Chọn nhân viên</option>
                <option value="random">Giao cho salon</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id.toString()}>
                    {s.fullName || s.username || "Nhân viên"}
                  </option>
                ))}
              </select>
              {!staffList.length && (
                <p className="text-red-500 mt-2">Không có nhân viên.</p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                Chọn "Giao cho salon" để phân bổ ngẫu nhiên.
              </p>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                Chọn Ngày Giờ
              </h2>
              <div className="mb-6">
                <label className="block text-amber-900 font-medium mb-2">
                  Ngày
                </label>
                <DatePicker
                  selected={date}
                  onChange={(d) => {
                    setDate(d);
                    setStartTime(null);
                  }}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  locale={vi}
                  placeholderText="Chọn ngày"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600"
                  wrapperClassName="w-full"
                />
              </div>
              {date && (
                <div>
                  <label className="block text-amber-900 font-medium mb-2">
                    Giờ ({hours.open} - {hours.close})
                  </label>
                  {generateSlots().length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {generateSlots().map((slot, i) => (
                          <button
                            key={i}
                            onClick={() =>
                              isSlotAvailable(slot) && selectSlot(slot)
                            }
                            disabled={!isSlotAvailable(slot)}
                            className={`p-3 rounded-lg text-center transition-colors ${
                              isSlotAvailable(slot)
                                ? startTime &&
                                  parseISO(slot.startTime).getTime() ===
                                    startTime.getTime()
                                  ? "bg-amber-600 text-white"
                                  : "bg-green-100 hover:bg-green-200 text-green-900"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            {format(parseISO(slot.startTime), "HH:mm")}
                          </button>
                        ))}
                      </div>
                      {isAllSlotsBooked() && (
                        <p className="text-red-500 mt-4">
                          Tất cả khung giờ đã được đặt. Vui lòng chọn ngày khác
                          hoặc nhân viên khác.
                        </p>
                      )}
                      {staff &&
                        bookedSlots.length > 0 &&
                        !isAllSlotsBooked() && (
                          <p className="text-sm text-gray-600 mt-4">
                            Các khung giờ màu xám đã được đặt bởi nhân viên đã
                            chọn.
                          </p>
                        )}
                      {staff && bookedSlots.length === 0 && (
                        <p className="text-sm text-gray-600 mt-4">
                          Tất cả khung giờ đều khả dụng cho nhân viên đã chọn.
                        </p>
                      )}
                      {!staff &&
                        bookedSlots.length > 0 &&
                        !isAllSlotsBooked() && (
                          <p className="text-sm text-gray-600 mt-4">
                            Các khung giờ màu xám đã được đặt. Vui lòng chọn
                            nhân viên để xem lịch chi tiết.
                          </p>
                        )}
                    </>
                  ) : (
                    <p className="text-red-500">
                      Không có khung giờ khả dụng trong giờ hoạt động.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                Thanh Toán
              </h2>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600"
              >
                <option value="">Chọn phương thức</option>
                <option value="CASH">Tiền mặt</option>
              </select>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Quay Lại
              </button>
            )}
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              {step === 5 ? "Hóa Đơn" : "Tiếp"}
            </button>
          </div>
        </div>

        {showBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-12 rounded-xl max-w-4xl w-full h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-bold text-amber-900 mb-6">
                Hóa Đơn
              </h2>
              <div className="mb-6 space-y-3">
                <p>
                  <strong>Salon:</strong>{" "}
                  {salons.find((s) => s.id === Number(salon))?.name ||
                    "Đang chọn"}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {address}
                </p>
                <p>
                  <strong>Nhân viên:</strong>{" "}
                  {staffList.find((s) => s.id === Number(staff))?.fullName ||
                    staffList.find((s) => s.id === Number(staff))?.username ||
                    "Chưa chọn"}
                </p>
                <p>
                  <strong>Bắt đầu:</strong> {formatDateTime(startTime)}
                </p>
                <p>
                  <strong>Kết thúc:</strong> {formatDateTime(endTime)}
                </p>
                <p>
                  <strong>Thanh toán:</strong> {paymentMethod.toUpperCase()}
                </p>
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-3">
                Dịch Vụ ({selectedDetails.length})
              </h3>
              <ul className="mb-6 space-y-4">
                {selectedDetails.length ? (
                  selectedDetails.map((s) => (
                    <li key={s.id} className="flex gap-6 py-3">
                      <img
                        src={
                          s.image
                            ? `http://localhost:8083/service-offering-images/${
                                s.image.split("|")[0]
                              }`
                            : "/placeholder-image.png"
                        }
                        alt={s.name.split("|")[0]}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) =>
                          (e.target.src = "/placeholder-image.png")
                        }
                      />
                      <div className="flex-1">
                        <span>{s.name.split("|")[0]}</span>
                        <span className="block text-sm">
                          {(s.price || 0).toLocaleString("vi-VN")} VND
                        </span>
                      </div>
                      <button
                        onClick={() => showService(s.id)}
                        className="px-4 py-1 border border-amber-600 text-amber-600 rounded-md hover:bg-amber-600 hover:text-white"
                      >
                        Chi tiết
                      </button>
                    </li>
                  ))
                ) : (
                  <li>Không có dịch vụ.</li>
                )}
              </ul>
              <p className="text-2xl text-amber-700 font-bold">
                Tổng: {totalPrice.toLocaleString("vi-VN")} VND
              </p>
              <p className="text-gray-700 mt-2">
                Thời gian: {totalDuration} phút
              </p>
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => setShowBill(false)}
                  className="px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={submit}
                  disabled={loading}
                  className={`px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Đang xử lý..." : "Đặt Lịch"}
                </button>
              </div>
            </div>
          </div>
        )}

        {serviceDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-12 rounded-xl w-full max-w-[95vw] h-[95vh] overflow-y-auto">
              <div className="flex justify-between mb-8">
                <h2 className="text-3xl font-bold text-amber-900">
                  Chi Tiết: {serviceDetails.name.split("|")[0]}
                </h2>
                <button
                  onClick={closeDetails}
                  className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300"
                >
                  ×
                </button>
              </div>
              <div className="mb-8">
                <img
                  src={
                    serviceDetails.image
                      ? `http://localhost:8083/service-offering-images/${
                          serviceDetails.image.split("|")[0]
                        }`
                      : "/placeholder-image.png"
                  }
                  alt={serviceDetails.name.split("|")[0]}
                  className="w-full max-w-md h-64 object-cover rounded-lg mb-6 mx-auto"
                  onError={(e) => (e.target.src = "/placeholder-image.png")}
                />
                <table className="w-full text-left border rounded-lg">
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="p-4 font-semibold text-amber-900">Tên</td>
                      <td className="p-4">
                        {serviceDetails.name.split("|")[0]}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-amber-900">Giá</td>
                      <td className="p-4">
                        {(serviceDetails.price || 0).toLocaleString("vi-VN")}{" "}
                        VND
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-4 font-semibold text-amber-900">
                        Thời gian
                      </td>
                      <td className="p-4">
                        {serviceDetails.duration || 0} phút
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {getValidSteps(serviceDetails.description).length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-amber-900 mb-6">
                    Các Bước
                  </h3>
                  <div className="space-y-6">
                    {parseSteps(serviceDetails)
                      .slice(1)
                      .map((step, i) => (
                        <div
                          key={i}
                          className="flex gap-4 p-6 bg-gray-50 rounded-lg shadow-sm"
                        >
                          <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-lg font-semibold">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-lg font-semibold text-gray-700">
                              Bước {i + 1}: {step.name || "Không tên"}
                              ...
                            </p>
                            <p className="text-gray-700 text-lg mt-2">
                              {getValidSteps(serviceDetails.description)[
                                i
                              ]?.trim() || "Không mô tả"}
                            </p>
                            {step.image && (
                              <img
                                src={`http://localhost:8083/service-offering-images/${step.image}`}
                                alt={`Bước ${i + 1}`}
                                className="mt-4 w-32 h-32 object-cover rounded-lg"
                                onError={(e) =>
                                  (e.target.src = "/placeholder-image.png")
                                }
                              />
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {!getValidSteps(serviceDetails.description).length && (
                <p className="text-gray-700 text-lg">
                  Không có thông tin bước.
                </p>
              )}
              <div className="mt-10 flex justify-end">
                <button
                  onClick={closeDetails}
                  className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {successModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl max-w-md w-full text-center">
              <h2 className="text-3xl font-bold text-green-600 mb-4">
                Thành Công
              </h2>
              <p className="text-gray-700 mb-6">
                Lịch hẹn tại{" "}
                {salons.find((s) => s.id === Number(salon))?.name || "salon"} đã
                xác nhận.
              </p>
              <button
                onClick={closeSuccess}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {failureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl max-w-md w-full text-center">
              <h2 className="text-3xl font-bold text-red-600 mb-4">Thất Bại</h2>
              <p className="text-gray-700 mb-6">
                {error || "Lỗi đặt lịch. Thử lại."}
              </p>
              <button
                onClick={closeFailure}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
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
