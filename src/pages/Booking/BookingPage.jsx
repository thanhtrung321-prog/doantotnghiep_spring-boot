import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale";
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
  const [startTime, setStartTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [bookingStatus, setBookingStatus] = useState("CHỜ XỬ LÝ");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [salonAddress, setSalonAddress] = useState("");
  const [salonLocation, setSalonLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);

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
    ? new Date(startTime.getTime() + totalDuration * 60000)
    : null;

  // Update cookie when selectedServices changes
  useEffect(() => {
    Cookies.set("selectedServices", JSON.stringify(selectedServices), {
      expires: 1,
    });
  }, [selectedServices]);

  // Fetch user data and salons
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }

    fetchSalons()
      .then((data) => setSalons(data || []))
      .catch((err) => {
        setError(err.message);
        toast.error("Không thể tải danh sách salon: " + err.message);
      });
  }, [navigate]);

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
          params: {
            q: address,
            format: "json",
            limit: 1,
          },
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
      throw err;
    }
  };

  // Fetch salon data and services
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

        // Geocode salon address
        try {
          const coords = await geocodeAddress(fullAddress);
          setSalonLocation(coords);
        } catch (err) {
          toast.warn(
            "Không thể lấy tọa độ salon. Sử dụng tọa độ mặc định (TP.HCM)."
          );
          setSalonLocation({
            lat: 10.7769,
            lng: 106.7009,
          });
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      }
    };
    loadData();
  }, [selectedSalon, selectedCategory]);

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

  const handleRemoveService = (serviceId) => {
    setSelectedServices(selectedServices.filter((id) => id !== serviceId));
  };

  const handleShowInvoice = () => {
    if (!selectedSalon || !startTime) {
      toast.error("Vui lòng chọn salon và thời gian");
      return;
    }
    if (!selectedServices.length) {
      toast.warn("Bạn chưa chọn dịch vụ, hóa đơn sẽ hiển thị 0 VND.");
    }
    setShowInvoice(true);
  };

  const handleSubmit = async () => {
    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    setLoading(true);
    setError("");

    const bookingRequest = {
      customerId: user?.id || userId,
      startTime: startTime.toISOString(),
      serviceIds: selectedServices,
      paymentMethod: paymentMethod.toUpperCase().replace(" ", "_"),
    };

    try {
      const booking = await createBooking(selectedSalon, bookingRequest);
      setBookingStatus("CHỜ XỬ LÝ");
      setShowQR(true);

      setTimeout(() => {
        const isSuccess = Math.random() > 0.2;
        setBookingStatus(isSuccess ? "THÀNH CÔNG" : "THẤT BẠI");
        if (isSuccess) {
          Cookies.remove("selectedServices");
          navigate("/booking", { state: { booking } });
        } else {
          setError("Đặt lịch thất bại. Vui lòng thử lại.");
        }
      }, 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error(err.message);
    }
  };

  const qrCodeValue = `Payment for booking: ${selectedServices.join(
    ","
  )} at salon ${selectedSalon} via ${paymentMethod}`;

  const filterTime = (time) => {
    const hours = time.getHours();
    return hours >= 9 && hours < 18;
  };

  // Simple path (straight line) between userLocation and salonLocation
  const path =
    userLocation && salonLocation
      ? [
          [userLocation.lat, userLocation.lng],
          [salonLocation.lat, salonLocation.lng],
        ]
      : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="container mx-auto px-4 py-10 mt-16 animate-slide-in">
        <h1 className="text-3xl font-bold text-amber-900 mb-6">Đặt Lịch Hẹn</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleShowInvoice();
          }}
          className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto"
        >
          <div className="mb-6">
            <label className="block text-amber-900 font-medium mb-2">
              Chọn Salon
            </label>
            <select
              value={selectedSalon}
              onChange={(e) => {
                setSelectedSalon(e.target.value);
                setSelectedCategory("");
                setCurrentService("");
              }}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600"
              required
            >
              <option value="">Chọn salon</option>
              {salons.map((salon) => (
                <option key={salon.id} value={salon.id}>
                  {salon.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-amber-900 font-medium mb-2">
              Chọn Danh Mục Dịch Vụ (Tùy Chọn)
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600"
              disabled={!selectedSalon}
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
              Chọn Dịch Vụ (Tùy Chọn)
            </label>
            <div className="flex items-center gap-2">
              <select
                value={currentService}
                onChange={(e) => setCurrentService(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600"
                disabled={!services.length}
              >
                <option value="">Chọn dịch vụ</option>
                {services
                  .filter(
                    (srv) => !selectedServices.includes(srv.id.toString())
                  )
                  .map((srv) => (
                    <option key={srv.id} value={srv.id.toString()}>
                      {srv.name} - {(srv.price || 0).toLocaleString("vi-VN")}{" "}
                      VND ({srv.duration || 0} phút)
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddService}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                disabled={!currentService}
              >
                Thêm
              </button>
            </div>
            {selectedServiceDetails.length > 0 && (
              <div className="mt-4">
                <p className="text-amber-900 font-medium mb-2">
                  Dịch vụ đã chọn:
                </p>
                <ul className="space-y-2">
                  {selectedServiceDetails.map((srv) => (
                    <li
                      key={srv.id}
                      className="flex justify-between items-center bg-gray-50 p-2 rounded"
                    >
                      <span>
                        {srv.name} - {(srv.price || 0).toLocaleString("vi-VN")}{" "}
                        VND ({srv.duration || 0} phút)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(srv.id.toString())}
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

          <div className="mb-6">
            <label className="block text-amber-900 font-medium mb-2">
              Ngày và Giờ
            </label>
            <DatePicker
              selected={startTime}
              onChange={(date) => setStartTime(date)}
              showTimeSelect
              timeIntervals={30}
              minDate={new Date()}
              filterTime={filterTime}
              dateFormat="dd/MM/yyyy HH:mm"
              locale={vi}
              placeholderText="Chọn ngày và giờ"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600"
              required
              wrapperClassName="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Xem Hóa Đơn
          </button>
        </form>

        {/* Button to Show Directions */}
        {selectedSalon && (
          <div className="mt-6 text-center">
            <button
              onClick={fetchUserLocation}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Chỉ Đường Đến Salon
            </button>
          </div>
        )}

        {/* React-Leaflet Map Section */}
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
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

        {showInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-2xl font-bold text-amber-900 mb-4">
                Hóa Đơn Đặt Lịch
              </h2>
              <div className="mb-4">
                <p className="text-gray-700">
                  <strong>Salon:</strong>{" "}
                  {salons.find((s) => s.id == selectedSalon)?.name ||
                    "Đang chọn"}
                </p>
                <p className="text-gray-700">
                  <strong>Thời gian bắt đầu:</strong>{" "}
                  {startTime
                    ? startTime.toLocaleString("vi-VN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "Chưa chọn"}
                </p>
                <p className="text-gray-700">
                  <strong>Thời gian hoàn thành:</strong>{" "}
                  {completionTime
                    ? completionTime.toLocaleString("vi-VN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "Không có dịch vụ"}
                </p>
              </div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                Dịch Vụ Đã Chọn
                <span className="text-green-600 font-semibold ml-2">
                  ({selectedServiceDetails.length} dịch vụ)
                </span>
              </h3>
              <ul className="mb-4">
                {selectedServiceDetails.length > 0 ? (
                  selectedServiceDetails.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-4 text-gray-700 mb-2"
                    >
                      <img
                        src={`http://localhost:8083/service-offering-images/${s.image}`}
                        alt={s.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.png";
                        }}
                      />
                      <div className="flex-1">
                        <span>{s.name}</span>
                        <span className="block text-sm">
                          {(s.price || 0).toLocaleString("vi-VN")} VND
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-700">
                    Không có dịch vụ nào được chọn
                  </li>
                )}
              </ul>
              <p className="text-lg text-amber-700 font-bold">
                Tổng cộng: {totalPrice.toLocaleString("vi-VN")} VND
              </p>
              <p className="text-gray-700 mt-2">
                Tổng thời gian: {totalDuration} phút
              </p>

              <div className="mt-4">
                <label className="block text-amber-900 font-medium mb-2">
                  Phương Thức Thanh Toán
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-600"
                >
                  <option value="">Chọn phương thức</option>
                  <option value="ZaloPay">ZaloPay</option>
                  <option value="MBBank">MBBank</option>
                </select>
              </div>

              {showQR && paymentMethod && (
                <div className="mt-4 text-center">
                  <p className="text-gray-700 mb-2">
                    Quét mã QR để thanh toán qua {paymentMethod}
                  </p>
                  <QRCode value={qrCodeValue} size={150} />
                </div>
              )}

              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowInvoice(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !paymentMethod}
                  className={`px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 ${
                    loading || !paymentMethod
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {loading ? "Đang xử lý..." : "Xác Nhận Thanh Toán"}
                </button>
              </div>
            </div>
          </div>
        )}

        {bookingStatus !== "CHỜ XỬ LÝ" && !showInvoice && (
          <div className="mt-6 text-center">
            <p
              className={`text-lg ${
                bookingStatus === "THÀNH CÔNG"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Đặt lịch {bookingStatus.toLowerCase()}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
