import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  Grid3x3,
  CreditCard,
  Store,
  Scissors,
  Users,
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  User,
  Info,
} from "lucide-react";

const Headerowner = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [salonData, setSalonData] = useState(null);
  const [showSalonModal, setShowSalonModal] = useState(false);
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Lucide icons
    if (typeof window !== "undefined" && window.lucide) {
      window.lucide.createIcons();
    }

    // GSAP animations
    if (typeof window !== "undefined" && window.gsap) {
      window.gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );

      window.gsap.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.7)", delay: 0.2 }
      );

      window.gsap.fromTo(
        ".nav-item",
        { opacity: 0, y: -10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.4,
        }
      );
    }

    // Fetch user data from localStorage
    const storedUser = localStorage.getItem("user");
    const userId = localStorage.getItem("userId");

    if (userId && storedUser) {
      const user = JSON.parse(storedUser);
      // Fetch user details from API
      fetch(`http://localhost:8082/user/${userId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          return response.json();
        })
        .then((data) => {
          setUserData(data);
          // If user is OWNER, fetch salon details
          if (data.role === "OWNER" && data.salonId) {
            fetch(`http://localhost:8084/salon/${data.salonId}`)
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Failed to fetch salon data");
                }
                return response.json();
              })
              .then((salon) => setSalonData(salon))
              .catch((error) =>
                console.error("Error fetching salon data:", error)
              );
          }
        })
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, []);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const navigationItems = [
    { to: "/owner", label: "Dashboard", icon: Home },
    { to: "/owner/ownerbookings", label: "Bookings", icon: Calendar },
    { to: "/owner/ownercategory", label: "Category", icon: Grid3x3 },
    { to: "/owner/ownerpayment", label: "Payment", icon: CreditCard },
    { to: "/owner/ownerservices", label: "Services", icon: Scissors },
    { to: "/owner/ownerusers", label: "Users", icon: Users },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className="bg-gray-900 border-b border-gray-700 shadow-xl relative z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {" "}
            {/* Increased height to h-20 */}
            {/* Logo */}
            <div ref={logoRef} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div className="max-w-[200px] overflow-hidden">
                {" "}
                {/* Limit width for long names */}
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent truncate leading-tight">
                  {salonData ? salonData.name : "Salon Owner"}
                </h1>
                <p className="text-xs text-gray-400 truncate">
                  Management System
                </p>
              </div>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-item flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? "text-white bg-purple-600 shadow-lg shadow-purple-500/30"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium truncate max-w-[100px]">
                    {userData ? userData.fullName : "Admin"}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                    <div className="py-2">
                      {userData && (
                        <div className="px-4 py-2 border-b border-gray-700">
                          <p className="text-sm text-gray-300 truncate">
                            ID: {userData.id}
                          </p>
                          <p className="text-sm text-gray-300 truncate">
                            Tên: {userData.fullName}
                          </p>
                          <p className="text-sm text-gray-300 truncate">
                            Email: {userData.email}
                          </p>
                          <p className="text-sm text-gray-300 truncate">
                            Vai trò: {userData.role}
                          </p>
                        </div>
                      )}
                      {userData && userData.role === "OWNER" && salonData && (
                        <button
                          onClick={() => setShowSalonModal(true)}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                        >
                          <Info className="w-4 h-4" />
                          <span>Chi tiết salon</span>
                        </button>
                      )}
                      <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-700 bg-gray-800">
            <div className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? "text-white bg-purple-600 shadow-lg"
                          : "text-gray-300 hover:text-white hover:bg-gray-700"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Overlay for profile dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsProfileOpen(false)}
        />
      )}

      {/* Salon Details Modal */}
      {showSalonModal && salonData && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowSalonModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-lg w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Chi tiết salon</h2>
                <button
                  onClick={() => setShowSalonModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-300">
                  <span className="font-medium">Tên salon:</span>{" "}
                  {salonData.name}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Địa chỉ:</span>{" "}
                  {salonData.address}, {salonData.city}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Liên hệ:</span>{" "}
                  {salonData.contact}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Email:</span> {salonData.email}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Giờ mở cửa:</span>{" "}
                  {salonData.openingTime} - {salonData.closingTime}
                </p>
                <div>
                  <p className="text-gray-300 font-medium">Hình ảnh:</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {salonData.images.map((image, index) => (
                      <img
                        key={index}
                        src={`http://localhost:8084/salon-images/${image}`}
                        alt={`Salon ${salonData.name} image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSalonModal(false)}
                className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Headerowner;
