import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getSalonById,
} from "../../Dashboard/api/Usersstaffowner";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaList,
  FaTh,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaCalendarAlt,
  FaSync,
  FaMapMarkerAlt,
  FaClock,
  FaCity,
  FaStar,
  FaHeart,
  FaGem,
  FaCrown,
  FaEye,
  FaEyeSlash,
  FaUserShield,
  FaCheck,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";

// Lazy load components
const SalonLoadingScreen = lazy(() =>
  import("../../Dashboard/homeowner/Loadingowner")
);

const User = () => {
  const [staff, setStaff] = useState([]);
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salonId, setSalonId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "STAFF",
    salonId: null,
  });
  const [originalData, setOriginalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const salonTitleRef = useRef(null);
  const sliderRef = useRef(null);

  // Fetch owner data and salonId from localStorage
  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          throw new Error("Không tìm thấy userId trong localStorage.");
        }
        const userData = await getUserById(userId);
        if (!userData.salonId) {
          throw new Error("Không tìm thấy salonId trong dữ liệu người dùng.");
        }
        setSalonId(userData.salonId);
        setFormData((prev) => ({ ...prev, salonId: userData.salonId }));
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", err);
        setError("Không thể tải salonId của chủ salon.");
        setLoading(false);
        toast.error("Không thể tải salonId của chủ salon.");
      }
    };
    fetchOwnerData();
  }, []);

  // Fetch staff and salon data
  useEffect(() => {
    const fetchData = async () => {
      if (!salonId) return; // Wait for salonId to be fetched
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const [users, salonData] = await Promise.all([
          getAllUsers(),
          getSalonById(salonId),
        ]);
        const staffMembers = users.filter(
          (user) => user.role === "STAFF" && user.salonId === salonId
        );
        setStaff(staffMembers);
        setSalon(salonData);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError("Không thể tải dữ liệu.");
        setLoading(false);
        toast.error("Không thể tải dữ liệu.");
      }
    };
    fetchData();
  }, [salonId]);

  // GSAP animations
  useEffect(() => {
    if (!loading) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, delay: 0.2, ease: "power3.out" }
      );
      if (salonTitleRef.current) {
        gsap.fromTo(
          salonTitleRef.current,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: 0.4,
            ease: "back.out(1.2)",
          }
        );
      }
    }
  }, [loading]);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
      easing: "ease-out",
      offset: 50,
    });
    return () => AOS.refresh();
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        if (isEditing && editingId) {
          // Prepare update payload, use original data for unchanged fields
          const updatePayload = {
            fullName: formData.fullName || originalData.fullName,
            username: formData.username || originalData.username,
            email: formData.email || originalData.email,
            phone: formData.phone || originalData.phone,
            role: "STAFF", // Hardcode role
            salonId: formData.salonId || originalData.salonId,
          };
          // Only include password if provided and non-empty
          if (formData.password && formData.password.trim() !== "") {
            updatePayload.password = formData.password;
          }
          await updateUser(editingId, updatePayload);
          setStaff((prev) =>
            prev.map((user) =>
              user.id === editingId ? { ...user, ...updatePayload } : user
            )
          );
          toast.success("Cập nhật nhân viên thành công!");
        } else {
          // Create new user
          if (!formData.password) {
            toast.error("Mật khẩu là bắt buộc khi tạo người dùng mới.");
            return;
          }
          const newUser = await createUser(formData);
          setStaff((prev) => [...prev, newUser]);
          toast.success("Thêm nhân viên thành công!");
        }
        setFormData({
          fullName: "",
          username: "",
          email: "",
          phone: "",
          password: "",
          role: "STAFF",
          salonId: salonId, // Use dynamic salonId
        });
        setOriginalData(null);
        setIsEditing(false);
        setEditingId(null);
        setShowFormModal(false);
        setShowPassword(false);
      } catch (err) {
        console.error("Lỗi khi lưu người dùng:", err);
        toast.error(
          `Không thể ${isEditing ? "cập nhật" : "thêm"} nhân viên: ${
            err.response?.data?.message || err.message
          }`
        );
      }
    },
    [isEditing, editingId, formData, originalData, salonId]
  );

  // Handle edit
  const handleEdit = useCallback(async (user) => {
    try {
      const userData = await getUserById(user.id);
      setIsEditing(true);
      setEditingId(user.id);
      setFormData({
        fullName: userData.fullName,
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        password: "", // Password not pre-filled for security
        role: "STAFF", // Hardcode role
        salonId: userData.salonId,
      });
      setOriginalData(userData); // Store original data for unchanged fields
      setShowDetails(null);
      setShowFormModal(true);
      setShowPassword(false);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu người dùng:", err);
      toast.error("Không thể tải dữ liệu người dùng để chỉnh sửa.");
    }
  }, []);

  // Handle delete
  const handleDeleteClick = useCallback((id) => {
    setDeleteId(id);
    setShowModal(true);
  }, []);

  // Confirm delete
  const confirmDelete = useCallback(async () => {
    try {
      await deleteUser(deleteId);
      setStaff((prev) => prev.filter((user) => user.id !== deleteId));
      toast.success("Xóa nhân viên thành công!");
      setShowModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error("Lỗi khi xóa người dùng:", err);
      toast.error("Không thể xóa nhân viên.");
    }
  }, [deleteId]);

  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  }, []);

  // Slider navigation
  const nextSlide = useCallback(() => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
      setCurrentSlide((prev) => (prev + 1) % (salon?.images?.length || 1));
    }
  }, [salon]);

  // Slider settings
  const sliderSettings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: false,
      fade: true,
      cssEase: "ease",
      arrows: false,
      responsive: [
        {
          breakpoint: 768,
          settings: { dots: false },
        },
      ],
    }),
    []
  );

  // Memoized staff list
  const staffList = useMemo(() => staff, [staff]);

  // Check if any modal is open
  const isAnyModalOpen = showModal || showDetails || showFormModal;

  if (loading) {
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-gray-700 text-xl font-semibold animate-pulse">
              Đang tải...
            </div>
          </div>
        }
      >
        <SalonLoadingScreen />
      </Suspense>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-gray-50"
        data-aos="fade-in"
      >
        <div className="text-6xl mb-4 animate-bounce">💔</div>
        <div className="text-2xl font-semibold text-gray-700 text-center px-4">
          {error}
        </div>
        <div className="mt-3 px-4 py-2 bg-red-100 rounded-full">
          <span className="text-gray-600 text-sm">Vui lòng thử lại sau</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={2000} />
      <style jsx global>
        {`
          .slick-dots li button:before {
            color: #6b7280;
            font-size: 8px;
          }
          .slick-dots li.slick-active button:before {
            color: #ec4899;
          }
          @media (max-width: 768px) {
            .container {
              padding: 0.75rem;
            }
          }
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(3px);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0.5rem;
          }
          .modal-content {
            max-height: 85vh;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #ec4899 #f3f4f6;
          }
          .modal-content::-webkit-scrollbar {
            width: 6px;
          }
          .modal-content::-webkit-scrollbar-track {
            background: #f3f4f6;
          }
          .modal-content::-webkit-scrollbar-thumb {
            background-color: #ec4899;
            border-radius: 3px;
          }
        `}
      </style>

      {/* Main Content */}
      <div className={`${isAnyModalOpen ? "hidden" : "block"} relative z-10`}>
        <div className="container mx-auto p-3 max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-8 py-6" data-aos="fade-down">
            <FaCrown className="text-4xl text-yellow-400 mx-auto mb-3" />
            <h1
              ref={titleRef}
              className="text-3xl sm:text-5xl font-bold mb-3 text-gray-800"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              PREMIUM SALON
            </h1>
            <p
              ref={subtitleRef}
              className="text-lg sm:text-xl font-semibold text-gray-700"
            >
              <FaGem className="inline mr-2 text-pink-500" />
              {salon ? salon.name : "Salon Elite"}
              <FaGem className="inline ml-2 text-purple-500" />
            </p>
            <div className="mt-4 w-20 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          {/* Salon Information */}
          {salon && (
            <div className="mb-8" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-white/90 rounded-2xl p-3 border border-gray-200 shadow-lg">
                <h2
                  ref={salonTitleRef}
                  className="text-xl sm:text-2xl font-semibold text-center mb-4 text-gray-800 flex items-center justify-center"
                >
                  <FaHeart className="mr-2 text-pink-500 text-lg" />
                  {salon.name}
                  <FaHeart className="ml-2 text-pink-500 text-lg" />
                </h2>
                <div className="max-w-3xl mx-auto">
                  <div className="relative mb-4 rounded-xl overflow-hidden shadow-lg">
                    <Slider ref={sliderRef} {...sliderSettings}>
                      {salon.images.map((image, index) => (
                        <div key={index}>
                          <img
                            src={`http://localhost:8084/salon-images/${image}`}
                            alt={`Salon ${salon.name} ${index + 1}`}
                            className="w-full h-40 sm:h-48 object-cover"
                          />
                        </div>
                      ))}
                    </Slider>
                    <button
                      onClick={nextSlide}
                      className="absolute bottom-3 right-3 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-sm"
                      aria-label="Next Slide"
                    >
                      <FaArrowRight className="text-sm" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-800">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-xl">
                        <FaMapMarkerAlt className="text-red-500 text-base" />
                        <div>
                          <span className="text-xs text-gray-600 block">
                            Địa chỉ
                          </span>
                          <span className="font-semibold text-sm">
                            {salon.address}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-xl">
                        <FaPhone className="text-green-500 text-base" />
                        <div>
                          <span className="text-xs text-gray-600 block">
                            Liên hệ
                          </span>
                          <span className="font-semibold text-sm">
                            {salon.contact}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-xl">
                        <FaCity className="text-yellow-500 text-base" />
                        <div>
                          <span className="text-xs text-gray-600 block">
                            Thành phố
                          </span>
                          <span className="font-semibold text-sm">
                            {salon.city}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-xl">
                        <FaClock className="text-purple-500 text-base" />
                        <div>
                          <span className="text-xs text-gray-600 block">
                            Giờ mở cửa
                          </span>
                          <span className="font-semibold text-sm">
                            {salon.openingTime} - {salon.closingTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div
            className="flex justify-center gap-3 mb-6"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <button
              onClick={() => setShowFormModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-sm text-sm"
              aria-label="Add New Staff"
            >
              <FaUserPlus className="inline mr-1" />
              Thêm nhân viên
            </button>
            <button
              onClick={toggleViewMode}
              className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-sm text-sm"
              aria-label={`Switch to ${
                viewMode === "grid" ? "List" : "Grid"
              } View`}
            >
              {viewMode === "grid" ? (
                <FaList className="inline mr-1" />
              ) : (
                <FaTh className="inline mr-1" />
              )}
              {viewMode === "grid" ? "Danh sách" : "Lưới"}
            </button>
          </div>

          {/* Staff Display */}
          {staffList.length === 0 ? (
            <div className="text-center py-12" data-aos="zoom-in">
              <div className="text-5xl mb-4 animate-bounce">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Chưa có nhân viên
              </h3>
              <p className="text-sm text-gray-600">
                Hãy thêm nhân viên đầu tiên cho salon của bạn
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {staffList.map((staffMember, index) => (
                <div
                  key={staffMember.id}
                  className="group bg-white/90 rounded-2xl p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200"
                  data-aos="flip-left"
                  data-aos-delay={index * 50}
                >
                  <div className="mb-3 flex justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                        {staffMember.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                        <FaStar className="text-yellow-800 text-xs" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 text-center mb-3 group-hover:text-pink-600 transition-all duration-200">
                    {staffMember.fullName}
                  </h3>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                      <FaUser className="text-blue-500 text-sm" />
                      <div className="flex-1">
                        <span className="text-xs text-gray-600 block">
                          Username
                        </span>
                        <span className="text-gray-800 font-medium text-sm">
                          {staffMember.username}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                      <FaEnvelope className="text-pink-500 text-sm" />
                      <div className="flex-1">
                        <span className="text-xs text-gray-600 block">
                          Email
                        </span>
                        <span className="text-gray-800 font-medium text-sm break-all">
                          {staffMember.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                      <FaPhone className="text-green-500 text-sm" />
                      <div className="flex-1">
                        <span className="text-xs text-gray-600 block">
                          Điện thoại
                        </span>
                        <span className="text-gray-800 font-medium text-sm">
                          {staffMember.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDetails(staffMember.id)}
                      className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 text-xs"
                      aria-label={`View Details of ${staffMember.fullName}`}
                    >
                      <FaEye className="inline mr-1" />
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleEdit(staffMember)}
                      className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 text-xs"
                      aria-label={`Edit ${staffMember.fullName}`}
                    >
                      <FaEdit className="inline mr-1" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteClick(staffMember.id)}
                      className="flex-1 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-orange-700 transition-all duration-200 text-xs"
                      aria-label={`Delete ${staffMember.fullName}`}
                    >
                      <FaTrash className="inline mr-1" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {staffList.map((staffMember, index) => (
                <div
                  key={staffMember.id}
                  className="bg-white/90 rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200"
                  data-aos="slide-right"
                  data-aos-delay={index * 50}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-sm">
                        {staffMember.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">
                          {staffMember.fullName}
                        </h4>
                        <p className="text-gray-600 text-xs flex items-center">
                          <FaEnvelope className="mr-1 text-xs" />
                          {staffMember.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 w-full sm:w-auto">
                      <button
                        onClick={() => setShowDetails(staffMember.id)}
                        className="flex-1 sm:flex-none px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 text-xs"
                        aria-label={`View Details of ${staffMember.fullName}`}
                      >
                        <FaEye className="inline mr-1" />
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleEdit(staffMember)}
                        className="flex-1 sm:flex-none px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-700 text-xs"
                        aria-label={`Edit ${staffMember.fullName}`}
                      >
                        <FaEdit className="inline mr-1" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteClick(staffMember.id)}
                        className="flex-1 sm:flex-none px-2 py-1 bg-gradient-to-r from-red-500 to-orange-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-orange-700 text-xs"
                        aria-label={`Delete ${staffMember.fullName}`}
                      >
                        <FaTrash className="inline mr-1" />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content bg-white/95 rounded-2xl max-w-xs w-full p-4 border shadow-lg">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-3 flex items-center">
              <FaTrash className="mr-2 text-red-600" />
              Xác nhận xóa
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Bạn có chắc muốn xóa nhân viên này?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 text-xs"
                aria-label="Confirm Delete"
              >
                Xóa
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setDeleteId(null);
                }}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 text-xs"
                aria-label="Cancel Delete"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && (
        <div className="modal-overlay">
          <div className="modal-content bg-white rounded-2xl max-w-md w-full p-4 border shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
                <FaUser className="mr-2 text-purple-600" />
                Chi tiết nhân viên
              </h2>
              <button
                onClick={() => setShowDetails(null)}
                className="p-1 hover:bg-gray-200 rounded-full"
                aria-label="Close Details"
              >
                <FaTimes className="text-lg text-gray-500" />
              </button>
            </div>
            {(() => {
              const staffMember = staff.find((user) => user.id === showDetails);
              if (!staffMember) return null;
              return (
                <div className="space-y-2">
                  <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      {staffMember.fullName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <p className="flex items-center text-xs text-gray-600">
                        <FaUser className="mr-1 text-blue-500" />
                        Họ tên
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {staffMember.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center text-xs text-gray-600">
                        <FaUserShield className="mr-1 text-blue-500" />
                        Username
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {staffMember.username}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center text-xs text-gray-600">
                        <FaEnvelope className="mr-1 text-pink-500" />
                        Email
                      </p>
                      <p className="text-sm font-medium text-gray-800 break-all">
                        {staffMember.email}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center text-xs text-gray-600">
                        <FaPhone className="mr-1 text-green-500" />
                        Điện thoại
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {staffMember.phone}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center text-xs text-gray-600">
                        <FaBriefcase className="mr-1 text-purple-500" />
                        Vai trò
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {staffMember.role}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center text-xs text-gray-600">
                        <FaCalendarAlt className="mr-1 text-yellow-500" />
                        Ngày tạo
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(staffMember.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(staffMember)}
                      className="flex-1 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-700 text-xs"
                      aria-label={`Edit ${staffMember.fullName}`}
                    >
                      <FaEdit className="inline mr-1" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteClick(staffMember.id)}
                      className="flex-1 py-1.5 bg-gradient-to-r from-red-500 to-orange-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-orange-700 text-xs"
                      aria-label={`Delete ${staffMember.fullName}`}
                    >
                      <FaTrash className="inline mr-1" />
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content bg-white/95 rounded-2xl max-w-md w-full p-4 border shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
                {isEditing ? (
                  <FaEdit className="mr-2 text-purple-600" />
                ) : (
                  <FaUserPlus className="mr-2 text-purple-600" />
                )}
                {isEditing ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}
              </h2>
              <button
                onClick={() => {
                  setShowFormModal(false);
                  setIsEditing(false);
                  setEditingId(null);
                  setFormData({
                    fullName: "",
                    username: "",
                    email: "",
                    phone: "",
                    password: "",
                    role: "STAFF",
                    salonId: salonId,
                  });
                  setOriginalData(null);
                  setShowPassword(false);
                }}
                className="p-1 hover:bg-gray-200 rounded-full"
                aria-label="Close Form"
              >
                <FaTimes className="text-lg text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="flex items-center text-xs text-gray-600 font-medium">
                    <FaUser className="mr-1 text-blue-500" />
                    Họ tên
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-sm text-gray-800"
                    placeholder="Nhập họ tên"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs text-gray-600 font-medium">
                    <FaUserShield className="mr-1 text-blue-500" />
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-sm text-gray-800"
                    placeholder="Nhập username"
                    required
                    aria-required="true"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center text-xs text-gray-600 font-medium">
                  <FaEnvelope className="mr-1 text-pink-500" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none bg-white text-sm text-gray-800"
                  placeholder="Nhập email"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label className="flex items-center text-xs text-gray-600 font-medium">
                  <FaPhone className="mr-1 text-green-500" />
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none bg-white text-sm text-gray-800"
                  placeholder="Nhập số điện thoại"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label className="flex items-center text-xs text-gray-600 font-medium">
                  <FaLock className="mr-1 text-yellow-500" />
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none bg-white text-sm text-gray-800"
                    placeholder={
                      isEditing
                        ? "Nhập mật khẩu mới (nếu muốn thay đổi)"
                        : "Nhập mật khẩu"
                    }
                    required={!isEditing}
                    aria-required={!isEditing}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm"
                aria-label={isEditing ? "Update Staff" : "Add Staff"}
              >
                {isEditing ? (
                  <FaCheck className="inline mr-1" />
                ) : (
                  <FaUserPlus className="inline mr-1" />
                )}
                {isEditing ? "Cập nhật" : "Thêm"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
