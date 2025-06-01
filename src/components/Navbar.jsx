import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import {
  FaUser,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaStar,
  FaGem,
} from "react-icons/fa";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Refs for GSAP animations
  const navRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navLinksRef = useRef([]);
  const sparkleRefs = useRef([]);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: false,
      mirror: true,
    });
  }, []);

  // Load user from localStorage on mount (commented out to avoid localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle scroll effect with enhanced animations
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);

      // Animate navbar on scroll
      if (navRef.current) {
        gsap.to(navRef.current, {
          backgroundColor: isScrolled
            ? "rgba(255, 255, 255, 0.95)"
            : "rgba(255, 255, 255, 1)",
          backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enhanced GSAP animations
  useEffect(() => {
    // Navbar entrance animation
    const tl = gsap.timeline();

    tl.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
    );

    // Animate nav links with stagger
    if (navLinksRef.current.length > 0) {
      gsap.fromTo(
        navLinksRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.3,
        }
      );
    }

    // Sparkle animations
    sparkleRefs.current.forEach((sparkle, index) => {
      if (sparkle) {
        gsap.to(sparkle, {
          rotation: 360,
          scale: 1.2,
          duration: 2 + index * 0.5,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });
      }
    });

    return () => tl.kill();
  }, []);

  // Mobile menu animations
  useEffect(() => {
    if (isMenuOpen && mobileMenuRef.current) {
      const tl = gsap.timeline();

      tl.fromTo(
        mobileMenuRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.4, ease: "power2.out" }
      ).fromTo(
        mobileMenuRef.current.children,
        { y: 30, opacity: 0, rotationX: -90 },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          stagger: 0.1,
          duration: 0.4,
          ease: "back.out(1.7)",
        },
        "-=0.2"
      );
    }
  }, [isMenuOpen]);

  // User menu animations
  useEffect(() => {
    if (isUserMenuOpen && userMenuRef.current) {
      gsap.fromTo(
        userMenuRef.current,
        {
          y: -20,
          opacity: 0,
          scale: 0.8,
          rotationX: -15,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotationX: 0,
          duration: 0.3,
          ease: "back.out(2)",
        }
      );
    }
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  const navLinks = [
    { to: "/", label: "Trang Chủ", icon: "🏠" },
    { to: "/services", label: "Dịch Vụ", icon: "✨" },
    { to: "/collection", label: "Mẫu Tóc", icon: "💇‍♀️" },
    { to: "/tableprice", label: "Bảng Giá", icon: "💰" },
    { to: "/about", label: "Về Chúng Tôi", icon: "👥" },
    { to: "/contact", label: "Liên Hệ", icon: "📞" },
  ];

  // Enhanced link hover animation
  const handleLinkHover = (e, isEnter) => {
    const link = e.currentTarget;
    const underline = link.querySelector(".nav-underline");
    const text = link.querySelector(".nav-text");
    const icon = link.querySelector(".nav-icon");

    if (isEnter) {
      gsap.to(underline, {
        width: "100%",
        duration: 0.4,
        ease: "power2.out",
      });

      gsap.to(text, {
        y: -2,
        color: "#d97706",
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(icon, {
        scale: 1.3,
        rotation: 10,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    } else {
      gsap.to(underline, {
        width: "0%",
        duration: 0.4,
        ease: "power2.out",
      });

      gsap.to(text, {
        y: 0,
        color: "#92400e",
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(icon, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    }
  };

  const UserMenu = ({ isMobile = false }) => (
    <div
      ref={isMobile ? null : userMenuRef}
      className="absolute right-0 top-full mt-3 w-52 backdrop-blur-xl border border-amber-200/30 rounded-2xl shadow-2xl py-3 z-50 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(251,191,36,0.1) 50%, rgba(236,72,153,0.1) 100%)",
        boxShadow:
          "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(251, 191, 36, 0.1)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-amber-50/50 to-pink-50/50"></div>
      <div className="relative z-10">
        {!user ? (
          <>
            <Link
              to="/login"
              className="group flex items-center px-5 py-3 text-amber-900 hover:text-amber-600 transition-all duration-300 relative overflow-hidden"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-pink-100/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <span className="relative z-10 font-medium">🔑 Đăng nhập</span>
            </Link>
            <Link
              to="/register"
              className="group flex items-center px-5 py-3 text-amber-900 hover:text-amber-600 transition-all duration-300 relative overflow-hidden"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-pink-100/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <span className="relative z-10 font-medium">📝 Đăng ký</span>
            </Link>
          </>
        ) : (
          <>
            <div className="px-5 py-2 border-b border-amber-200/30 mb-2">
              <p className="text-sm text-amber-700 font-medium">Xin chào,</p>
              <p className="text-amber-900 font-bold truncate">
                {user.fullName || user.email}
              </p>
            </div>
            <Link
              to="/profile"
              className="group flex items-center px-5 py-3 text-amber-900 hover:text-amber-600 transition-all duration-300 relative overflow-hidden"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-pink-100/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <span className="relative z-10 font-medium">
                👤 Trang Cá Nhân
              </span>
            </Link>
            <button
              className="group flex items-center w-full px-5 py-3 text-red-600 hover:text-red-700 transition-all duration-300 relative overflow-hidden"
              onClick={handleLogout}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-pink-50/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <span className="relative z-10 font-medium">🚪 Đăng Xuất</span>
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <nav
      ref={navRef}
      className="fixed w-full z-50 top-0"
      style={{
        background: scrolled
          ? "rgba(255, 255, 255, 0.95)"
          : "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(254,243,199,0.8) 50%, rgba(252,231,243,0.6) 100%)",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(251, 191, 36, 0.2)"
          : "1px solid rgba(251, 191, 36, 0.1)",
        boxShadow: scrolled
          ? "0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(251, 191, 36, 0.1)"
          : "0 4px 20px -2px rgba(0, 0, 0, 0.1)",
      }}
      data-aos="fade-down"
      data-aos-duration="800"
    >
      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-2 left-1/4 w-2 h-2 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 opacity-40 animate-pulse"></div>
        <FaStar
          ref={(el) => (sparkleRefs.current[1] = el)}
          className="absolute top-3 right-1/3 text-pink-300 opacity-30 text-sm"
        />
        <FaGem
          ref={(el) => (sparkleRefs.current[2] = el)}
          className="absolute bottom-2 left-1/2 text-purple-300 opacity-35 text-xs"
        />
        <div className="absolute bottom-3 right-1/4 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-50 animate-bounce"></div>
      </div>

      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div data-aos="fade-right" data-aos-delay="200">
            <Header />
          </div>

          {/* Desktop Menu */}
          <div
            className="hidden lg:flex items-center space-x-8"
            data-aos="fade-left"
            data-aos-delay="400"
          >
            {navLinks.map((link, index) => (
              <Link
                key={link.to}
                ref={(el) => (navLinksRef.current[index] = el)}
                to={link.to}
                className="nav-link relative group"
                onMouseEnter={(e) => handleLinkHover(e, true)}
                onMouseLeave={(e) => handleLinkHover(e, false)}
                data-aos="fade-up"
                data-aos-delay={100 * index}
              >
                <div className="flex items-center space-x-2">
                  <span className="nav-icon text-lg">{link.icon}</span>
                  <span className="nav-text font-semibold text-amber-900 transition-all duration-300">
                    {link.label}
                  </span>
                </div>
                <span className="nav-underline absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-pink-500 rounded-full shadow-lg"></span>

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-100/0 via-amber-200/30 to-pink-100/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </Link>
            ))}

            {/* Enhanced Desktop User Menu */}
            <div className="relative" data-aos="fade-left" data-aos-delay="600">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 focus:outline-none transition-all duration-300 group relative overflow-hidden rounded-xl px-4 py-2"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(236,72,153,0.1) 100%)",
                  border: "1px solid rgba(251, 191, 36, 0.2)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-pink-200/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

                <div className="relative z-10 flex items-center space-x-3">
                  <div className="relative">
                    <div
                      className="bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 p-3 rounded-full shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105"
                      style={{
                        boxShadow:
                          "0 4px 15px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
                      }}
                    >
                      <FaUser className="h-4 w-4 text-white filter drop-shadow-sm" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse"></div>
                  </div>

                  {user && (
                    <div className="flex flex-col items-start uppercase">
                      <span className="font-bold text-amber-900 max-w-28 truncate text-sm ">
                        {user.fullName || user.email}
                      </span>
                      <span className="text-xs text-amber-600 opacity-75">
                        Thành viên{" "}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <FaChevronDown
                    className={`h-3 w-3 text-amber-700 transition-all duration-300 ${
                      isUserMenuOpen ? "rotate-180 text-amber-500" : ""
                    }`}
                  />
                </div>
              </button>
              {isUserMenuOpen && <UserMenu />}
            </div>
          </div>

          {/* Mobile Menu Controls */}
          <div
            className="lg:hidden flex items-center space-x-4"
            data-aos="fade-left"
            data-aos-delay="300"
          >
            {/* Mobile User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 focus:outline-none group"
              >
                <div className="bg-gradient-to-br from-amber-300 to-amber-400 p-2.5 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <FaUser className="h-4 w-4 text-white" />
                </div>
                {user && (
                  <span className="font-semibold text-sm max-w-20 truncate bg-gradient-to-r from-amber-800 to-pink-800 bg-clip-text text-transparent">
                    {user.fullName || user.email}
                  </span>
                )}
              </button>
              {isUserMenuOpen && <UserMenu isMobile />}
            </div>

            {/* Enhanced Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:outline-none p-3 rounded-xl transition-all duration-300 group relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(236,72,153,0.1) 100%)",
                border: "1px solid rgba(251, 191, 36, 0.2)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-200/30 to-pink-200/30 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl"></div>

              <div className="relative z-10">
                {isMenuOpen ? (
                  <FaTimes className="h-5 w-5 text-red-500 transform rotate-0 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <FaBars className="h-5 w-5 text-amber-700 transform rotate-0 group-hover:rotate-12 transition-transform duration-300" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="lg:hidden mt-4 rounded-2xl overflow-hidden backdrop-blur-xl border border-amber-200/30"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(251,191,36,0.1) 50%, rgba(236,72,153,0.1) 100%)",
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <div className="flex flex-col p-4 space-y-2 ">
              {navLinks.map((link, index) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex items-center space-x-3 font-semibold py-4 px-4 rounded-xl transition-all duration-300 relative overflow-hidden"
                  onClick={() => setIsMenuOpen(false)}
                  data-aos="fade-up"
                  data-aos-delay={50 * index}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-pink-100/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>

                  <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                    {link.icon}
                  </span>
                  <span className="text-amber-900 group-hover:text-amber-600 transition-colors duration-300 relative z-10">
                    {link.label}
                  </span>

                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FaChevronDown className="h-3 w-3 text-amber-500 -rotate-90" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
