import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Award,
  Clock,
  User,
  Scissors,
  X,
} from "lucide-react";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";

// Nhập hình ảnh từ thư mục assets
import before from "../../assets/imagebeforeafter/before.png";
import after from "../../assets/imagebeforeafter/after.png";
import before1 from "../../assets/imagebeforeafter/before1.png";
import after1 from "../../assets/imagebeforeafter/after1.png";
import before2 from "../../assets/imagebeforeafter/before2.png";
import after2 from "../../assets/imagebeforeafter/after2.png";

const BeforeAfterSlider = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const galleryRef = useRef(null);
  const statsRef = useRef(null);
  const mainTitleRef = useRef(null);
  const transformationTitleRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransformation, setSelectedTransformation] = useState(null);

  // Dữ liệu biến đổi kiểu tóc (chỉ 3 mục)
  const transformations = [
    {
      id: 1,
      client: "Nguyễn Minh Anh",
      duration: "3 giờ",
      stylist: "Thợ Tạo Mẫu Chính Alex",
      beforeImage: before,
      afterImage: after,
      transformation: "Bob Cổ Điển thành Tóc Tầng Rối",
      description:
        "Biến đổi hoàn toàn từ kiểu bob truyền thống sang tóc tầng rối thời thượng với highlight tôn khuôn mặt.",
      tags: ["Tóc Tầng Rối", "Tóc Tầng", "Highlight", "Tôn Khuôn Mặt"],
      rating: 4.9,
      likes: 234,
      comments: 45,
      shares: 12,
      difficulty: "Nâng Cao",
    },
    {
      id: 2,
      client: "Trần Ngọc Hân",
      duration: "4 giờ",
      stylist: "Thợ Sáng Tạo Mia",
      beforeImage: before1,
      afterImage: after1,
      transformation: "Pixie Ngắn thành Sóng Dài",
      description:
        "Biến đổi độ dài ấn tượng với tóc nối và sóng bồng bềnh cho dịp đặc biệt.",
      tags: ["Tóc Nối", "Sóng", "Bồng Bềnh", "Dịp Đặc Biệt"],
      rating: 5.0,
      likes: 456,
      comments: 78,
      shares: 23,
      difficulty: "Chuyên Gia",
    },
    {
      id: 3,
      client: "Lê Thảo Linh",
      duration: "2.5 giờ",
      stylist: "Chuyên Gia Màu Jin",
      beforeImage: before2,
      afterImage: after2,
      transformation: "Nâu thành Balayage Vàng",
      description:
        "Biến đổi màu sắc nổi bật với kỹ thuật balayage vẽ tay, tạo hiệu ứng ánh nắng tự nhiên.",
      tags: ["Balayage", "Vàng", "Màu Tóc", "Tự Nhiên"],
      rating: 4.8,
      likes: 189,
      comments: 34,
      shares: 8,
      difficulty: "Trung Cấp",
    },
  ];

  // Dữ liệu thống kê
  const stats = [
    {
      icon: Scissors,
      value: "2,500+",
      label: "Lượt Biến Đổi",
      color: "text-pink-500",
    },
    {
      icon: Star,
      value: "4.9",
      label: "Đánh Giá Trung Bình",
      color: "text-yellow-500",
    },
    {
      icon: User,
      value: "98%",
      label: "Khách Hàng Hài Lòng",
      color: "text-green-500",
    },
    {
      icon: Award,
      value: "15+",
      label: "Giải Thưởng Đạt Được",
      color: "text-purple-500",
    },
  ];

  // Khởi tạo GSAP và AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });

    // GSAP cho tiêu đề chính với hiệu ứng karaoke
    if (mainTitleRef.current) {
      const text = mainTitleRef.current;
      const chars = text.innerText.split("");
      text.innerHTML = chars
        .map(
          (char, index) =>
            `<span class="char" style="margin-right: ${
              char === " " ? "0.3em" : "0"
            }">${char}</span>`
        )
        .join("");

      gsap.fromTo(
        text.querySelectorAll(".char"),
        { opacity: 0, x: 10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.03,
          ease: "power1.out",
        }
      );
    }

    // GSAP cho tiêu đề biến đổi với hiệu ứng karaoke
    if (transformationTitleRef.current) {
      const text = transformationTitleRef.current;
      const chars = text.innerText.split("");
      text.innerHTML = chars
        .map(
          (char, index) =>
            `<span class="char" style="margin-right: ${
              char === " " ? "0.3em" : "0"
            }">${char}</span>`
        )
        .join("");

      gsap.fromTo(
        text.querySelectorAll(".char"),
        { opacity: 0, x: 10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.03,
          ease: "power1.out",
        }
      );
    }

    // GSAP cho các phần
    const animateElement = (ref, delay = 0, direction = "up") => {
      if (!ref.current) return;

      const element = ref.current;
      let transform = "translateY(60px)";

      if (direction === "left") transform = "translateX(-60px)";
      if (direction === "right") transform = "translateX(60px)";
      if (direction === "scale") transform = "scale(0.8)";

      element.style.opacity = "0";
      element.style.transform = transform;

      setTimeout(() => {
        element.style.transition = "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)";
        element.style.opacity = "1";
        element.style.transform = "translateY(0) translateX(0) scale(1)";
      }, delay);
    };

    animateElement(heroRef, 0);
    animateElement(galleryRef, 400);
    animateElement(statsRef, 800);
  }, [currentSlide]);

  // Chức năng tự động chạy
  useEffect(() => {
    if (!isAutoPlaying || isModalOpen) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % transformations.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, transformations.length, isModalOpen]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % transformations.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? transformations.length - 1 : prev - 1
    );
  };

  const openModal = (transformation) => {
    setSelectedTransformation(transformation);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransformation(null);
    document.body.style.overflow = "unset";
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Trung Cấp":
        return "bg-yellow-100 text-yellow-700";
      case "Nâng Cao":
        return "bg-orange-100 text-orange-700";
      case "Chuyên Gia":
        return "bg-red-100 text-red-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden"
    >
      {/* Hiệu ứng nền động */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-32 left-16 w-48 h-48 bg-rose-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-24 right-20 w-36 h-36 bg-pink-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-1/4 w-28 h-28 bg-purple-300 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Phần tiêu đề */}
      <section ref={heroRef} className="relative z-10 pt-20 pb-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8" data-aos="fade-up">
            <span className="inline-flex items-center bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
              <Scissors className="w-4 h-4 mr-2" />
              Bộ Sưu Tập Biến Đổi Kiểu Tóc
            </span>
          </div>

          <h1
            ref={mainTitleRef}
            className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-6"
          >
            Trước & Sau
          </h1>

          <p
            className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Chiêm ngưỡng những biến đổi kiểu tóc tuyệt đẹp, thể hiện tay nghề và
            nghệ thuật của chúng tôi. Mỗi sự thay đổi là một câu chuyện độc đáo
            về vẻ đẹp, sự tự tin và phong cách.
          </p>

          <div
            className="flex flex-wrap justify-center gap-4 mb-8"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                isAutoPlaying
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg"
                  : "bg-white/70 text-gray-700 hover:bg-white"
              }`}
            >
              {isAutoPlaying ? (
                <Pause className="w-4 h-4 mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isAutoPlaying ? "Tạm Dừng Trình Chiếu" : "Phát Trình Chiếu"}
            </button>
          </div>
        </div>
      </section>

      {/* Thanh Trượt Trước/Sau Chính */}
      <section ref={galleryRef} className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Điều hướng */}
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={prevSlide}
                className="bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 group"
                data-aos="fade-right"
              >
                <ChevronLeft className="w-6 h-6 text-rose-600 group-hover:text-rose-700" />
              </button>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Biến Đổi {currentSlide + 1} / {transformations.length}
                </h2>
                <p className="text-gray-600">
                  {transformations[currentSlide].transformation}
                </p>
              </div>

              <button
                onClick={nextSlide}
                className="bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 group"
                data-aos="fade-left"
              >
                <ChevronRight className="w-6 h-6 text-rose-600 group-hover:text-rose-700" />
              </button>
            </div>

            {/* Thanh trượt chính */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {transformations.map((transformation, index) => (
                  <div
                    key={transformation.id}
                    className="w-full flex-shrink-0 cursor-pointer"
                    onClick={() => openModal(transformation)}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                      {/* Hình ảnh Trước/Sau */}
                      <div className="relative">
                        <div className="relative h-full min-h-[400px] lg:min-h-[600px] overflow-hidden">
                          {/* Hình ảnh Trước */}
                          <div
                            className="absolute inset-0 transition-all duration-300"
                            style={{
                              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                            }}
                          >
                            <img
                              src={transformation.beforeImage}
                              alt="Trước khi biến đổi"
                              className="w-full h-full object-cover aspect-[3/4]"
                            />
                            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              TRƯỚC
                            </div>
                          </div>

                          {/* Hình ảnh Sau */}
                          <div
                            className="absolute inset-0 transition-all duration-300"
                            style={{
                              clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                            }}
                          >
                            <img
                              src={transformation.afterImage}
                              alt="Sau khi biến đổi"
                              className="w-full h-full object-cover aspect-[3/4]"
                            />
                            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              SAU
                            </div>
                          </div>

                          {/* Thanh trượt */}
                          <div
                            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-20"
                            style={{
                              left: `${sliderPosition}%`,
                              transform: "translateX(-50%)",
                            }}
                            onMouseDown={(e) => {
                              const rect =
                                e.currentTarget.parentElement.getBoundingClientRect();
                              const handleMouseMove = (e) => {
                                const x = e.clientX - rect.left;
                                const percentage = Math.max(
                                  0,
                                  Math.min(100, (x / rect.width) * 100)
                                );
                                setSliderPosition(percentage);
                              };

                              const handleMouseUp = () => {
                                document.removeEventListener(
                                  "mousemove",
                                  handleMouseMove
                                );
                                document.removeEventListener(
                                  "mouseup",
                                  handleMouseUp
                                );
                              };

                              document.addEventListener(
                                "mousemove",
                                handleMouseMove
                              );
                              document.addEventListener(
                                "mouseup",
                                handleMouseUp
                              );
                            }}
                          >
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                              <div className="w-1 h-4 bg-gray-400 rounded"></div>
                              <div className="w-1 h-4 bg-gray-400 rounded ml-1"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Chi tiết biến đổi */}
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3
                              ref={transformationTitleRef}
                              className="text-3xl font-bold text-gray-800"
                            >
                              {transformation.transformation}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                                transformation.difficulty
                              )}`}
                            >
                              {transformation.difficulty}
                            </span>
                          </div>

                          <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            {transformation.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-6">
                            {transformation.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Thông tin khách hàng và thợ tạo mẫu */}
                        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Khách Hàng
                              </div>
                              <div className="font-semibold text-gray-800">
                                {transformation.client}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Thợ Tạo Mẫu
                              </div>
                              <div className="font-semibold text-gray-800">
                                {transformation.stylist}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              Thời Gian: {transformation.duration}
                            </span>
                          </div>
                        </div>

                        {/* Thống kê tương tác */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span className="font-bold text-gray-800">
                                {transformation.rating}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              Đánh Giá
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Heart className="w-4 h-4 text-red-500 mr-1" />
                              <span className="font-bold text-gray-800">
                                {transformation.likes}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              Lượt Thích
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <MessageCircle className="w-4 h-4 text-blue-500 mr-1" />
                              <span className="font-bold text-gray-800">
                                {transformation.comments}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              Bình Luận
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Share2 className="w-4 h-4 text-green-500 mr-1" />
                              <span className="font-bold text-gray-800">
                                {transformation.shares}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              Lượt Chia Sẻ
                            </div>
                          </div>
                        </div>

                        {/* Nút hành động */}
                        <div className="flex space-x-4">
                          <button className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                            Đặt Kiểu Tương Tự
                          </button>
                          <button className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:border-pink-500 hover:text-pink-600 transition-colors">
                            Lưu Cảm Hứng
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chấm phân trang */}
            <div className="flex justify-center mt-8 space-x-2">
              {transformations.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-rose-600 w-8"
                      : "bg-rose-300 hover:bg-rose-400"
                  }`}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Phần Thống Kê Thành Tựu */}
      <section ref={statsRef} className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Thống Kê Thành Tựu Của Chúng Tôi
            </h2>
            <p className="text-lg text-gray-600">
              Những con số chứng minh tay nghề và sự hài lòng của khách hàng
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 150}
              >
                <div
                  className={`w-16 h-16 ${stat.color} bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal hiển thị hình ảnh trước và sau */}
      {isModalOpen && selectedTransformation && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          data-aos="zoom-in"
        >
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>

            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                {selectedTransformation.transformation}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <img
                    src={selectedTransformation.beforeImage}
                    alt="Trước khi biến đổi"
                    className="w-full h-[400px] object-cover rounded-xl aspect-[3/4]"
                  />
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    TRƯỚC
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={selectedTransformation.afterImage}
                    alt="Sau khi biến đổi"
                    className="w-full h-[400px] object-cover rounded-xl aspect-[3/4]"
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    SAU
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Tùy Chỉnh cho AOS và Karaoke */}
      <style jsx>{`
        [data-aos] {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        [data-aos].aos-animate {
          opacity: 1;
          transform: translateY(0);
        }

        [data-aos="fade-up"] {
          transform: translateY(30px);
        }

        [data-aos="fade-left"] {
          transform: translateX(30px);
        }

        [data-aos="fade-right"] {
          transform: translateX(-30px);
        }

        [data-aos="zoom-in"] {
          transform: scale(0.8);
        }

        [data-aos="zoom-in"].aos-animate {
          transform: scale(1);
        }

        .char {
          display: inline-block;
          margin-right: 0.05em; /* Khoảng cách nhỏ giữa các ký tự */
        }
      `}</style>
    </div>
  );
};

export default BeforeAfterSlider;
