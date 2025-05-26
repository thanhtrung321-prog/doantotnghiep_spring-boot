import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";

const Footerowner = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const walkingManRef = useRef(null);
  const progressBarRef = useRef(null);
  const percentageRef = useRef(null);
  const containerRef = useRef(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize AOS
  useEffect(() => {
    try {
      AOS.init({
        duration: 1200,
        once: true,
        easing: "ease-in-out",
      });
    } catch (error) {
      console.error("Failed to initialize AOS:", error);
    }
  }, []);

  // GSAP animations for progress bar and walking man (smooth transitions)
  useEffect(() => {
    try {
      // Calculate progress based on current second (0-59 seconds = 0-100%)
      const currentSecond = currentTime.getSeconds();
      const progress = (currentSecond / 59) * 100;

      // Smooth animate progress bar
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          width: `${progress}%`,
          duration: 1,
          ease: "power1.inOut",
        });
      }

      // Smooth update percentage text
      if (percentageRef.current) {
        gsap.to(percentageRef.current, {
          innerHTML: `${Math.round(progress)}%`,
          duration: 1,
          ease: "power1.inOut",
        });
      }

      // Smooth animate walking man position
      if (walkingManRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const manWidth = 64; // w-16 = 64px
        const xPosition = (progress / 100) * (containerWidth - manWidth);

        gsap.to(walkingManRef.current, {
          x: xPosition,
          duration: 1,
          ease: "power1.inOut",
        });
      }
    } catch (error) {
      console.error("GSAP animation error:", error);
    }
  }, [currentTime]);

  // Initial text animations
  useEffect(() => {
    gsap.fromTo(
      ".footer-text",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 2, ease: "power3.out", stagger: 0.15 }
    );
  }, []);

  // Format date and time in Vietnamese
  const formattedDateTime = currentTime.toLocaleString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const currentSecond = currentTime.getSeconds();
  const progress = Math.round((currentSecond / 59) * 100);

  return (
    <footer className="bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 text-white py-8 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse top-10 left-10"></div>
        <div className="absolute w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse top-20 right-20"></div>
        <div className="absolute w-40 h-40 bg-pink-500/20 rounded-full blur-xl animate-pulse bottom-10 left-1/3"></div>
        <div className="absolute w-28 h-28 bg-indigo-500/20 rounded-full blur-xl animate-pulse bottom-20 right-10"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-8">
          {/* Left Side - Digital Clock */}
          <div
            className="flex flex-col items-center space-y-4"
            data-aos="fade-right"
            data-aos-duration="1500"
          >
            <div className="bg-black/60 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <h3 className="footer-text text-lg font-bold text-white">
                    ⏰ Đồng Hồ Thời Gian Thực
                  </h3>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>

                {/* Hour and Minute Display */}
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-lg">
                    <div className="footer-text text-4xl font-bold">
                      {currentTime.getHours().toString().padStart(2, "0")}
                    </div>
                    <div className="text-xs opacity-80">GIỜ</div>
                  </div>

                  <div className="text-3xl font-bold text-white animate-pulse">
                    :
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-lg">
                    <div className="footer-text text-4xl font-bold">
                      {currentTime.getMinutes().toString().padStart(2, "0")}
                    </div>
                    <div className="text-xs opacity-80">PHÚT</div>
                  </div>
                </div>

                {/* Date Display */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <p className="footer-text text-sm text-gray-300">
                    {currentTime.toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Images */}
          <div
            className="flex flex-col space-y-6"
            data-aos="fade-up"
            data-aos-duration="1500"
            data-aos-delay="300"
          >
            <div className="flex justify-center space-x-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                <img
                  src="https://petrooutlet.com/wp-content/uploads/2024/04/Beauty-Salon.gif"
                  alt="Beauty Salon"
                  className="relative w-24 h-24 rounded-full border-4 border-white/30 shadow-2xl transform hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                <img
                  src="https://i.pinimg.com/originals/9a/a1/e8/9aa1e8b584981bdb10bde45dbd25a1cf.gif"
                  alt="Nail Polish"
                  className="relative w-24 h-24 rounded-full border-4 border-white/30 shadow-2xl transform hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>

            <div className="text-center">
              <h2 className="footer-text text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
                ✨ Chào mừng đến với Salon Dashboard
              </h2>
              <p className="footer-text text-gray-300 text-lg leading-relaxed">
                Quản lý salon của bạn với phong cách và sự dễ dàng
              </p>
            </div>
          </div>

          {/* Right Side - Information */}
          <div
            className="space-y-6"
            data-aos="fade-left"
            data-aos-duration="1500"
            data-aos-delay="600"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <h3 className="footer-text text-xl font-semibold mb-4 text-center">
                📞 Thông tin liên hệ
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-pink-400">📧</span>
                  <a
                    href="mailto:contact@salondashboard.com"
                    className="footer-text hover:text-pink-300 transition-colors duration-500 text-sm"
                  >
                    vothanhtrung@gmail.com
                  </a>
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <span className="text-blue-400">📱</span>
                  <a
                    href="tel:+84123456789"
                    className="footer-text hover:text-blue-300 transition-colors duration-500 text-sm"
                  >
                    +84 0379263053
                  </a>
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <span className="text-green-400">🌍</span>
                  <p className="footer-text text-sm text-center">
                    Việt Nam - Múi giờ GMT+7
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Section - Seconds Clock */}
        <div
          className="mb-8"
          data-aos="fade-up"
          data-aos-duration="1500"
          data-aos-delay="900"
        >
          <div className="text-center mb-6">
            <h3 className="footer-text text-xl font-semibold mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              ⏱️ Đồng Hồ Giây - Thời Gian Thực
            </h3>
          </div>

          <div
            ref={containerRef}
            className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-full h-24 border-4 border-white/30 shadow-2xl overflow-hidden"
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30 rounded-full animate-pulse"></div>

            {/* Progress bar background track */}
            <div className="absolute inset-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full"></div>

            {/* Animated progress bar */}
            <div
              ref={progressBarRef}
              className="absolute inset-3 bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 to-green-500 rounded-full shadow-lg"
              style={{ width: "0%" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-full"></div>
            </div>

            {/* Walking man with smooth shadow */}
            <div className="absolute top-1/2 transform -translate-y-1/2 z-10">
              <img
                ref={walkingManRef}
                src="https://cdnl.iconscout.com/lottie/premium/thumb/walking-man-8068170-6451396.gif"
                alt="Walking Man"
                className="w-16 h-16 drop-shadow-2xl filter brightness-110"
                style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.4))" }}
              />
            </div>

            {/* Enhanced percentage display */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-white via-gray-100 to-white text-gray-800 px-4 py-2 rounded-full font-bold text-lg shadow-xl border-2 border-white/50">
              <span
                ref={percentageRef}
                className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
              >
                0%
              </span>
            </div>

            {/* Second indicator */}
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-xl">
              <span className="flex items-center space-x-1">
                <span>⏰</span>
                <span>{currentSecond}s</span>
              </span>
            </div>
          </div>

          <div className="text-center mt-4">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 inline-block border border-white/20">
              <p className="footer-text text-sm text-gray-300">
                <span className="text-yellow-400 font-semibold">
                  Giây hiện tại:
                </span>
                <span className="text-white font-bold mx-2">
                  {currentSecond}/59
                </span>
                <span className="text-blue-400 font-semibold">
                  • Tiến trình:
                </span>
                <span className="text-green-400 font-bold ml-2">
                  {progress}%
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className="border-t border-white/20 pt-6 text-center"
          data-aos="fade-up"
          data-aos-delay="600"
        ></div>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    </footer>
  );
};

export default Footerowner;
