import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Calendar,
  Sparkles,
  X,
  Play,
  Star,
  Heart,
  Eye,
} from "lucide-react";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";

// Nhập hình ảnh từ thư mục assets
import toc1 from "../../assets/imagehairtrend/toc1.jpg";
import toc2 from "../../assets/imagehairtrend/toc2.jpg";
import toc3 from "../../assets/imagehairtrend/toc3.jpg";
import toc4 from "../../assets/imagehairtrend/toc4.jpeg";
import toc5 from "../../assets/imagehairtrend/toc5.webp";
import toc6 from "../../assets/imagehairtrend/toc6.png";
import toc7 from "../../assets/imagehairtrend/toc7.jpg";
import toc8 from "../../assets/imagehairtrend/toc8.jpg";
import toc9 from "../../assets/imagehairtrend/toc9.jpg";
import toc10 from "../../assets/imagehairtrend/toc10.jpg";

const Hairtrend = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const trendsRef = useRef(null);
  const predictionsRef = useRef(null);
  const adviceRef = useRef(null);
  const titleRef = useRef(null);
  const modalTitleRef = useRef(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [activeTab, setActiveTab] = useState("hot");
  const navigate = useNavigate();

  // Dữ liệu xu hướng kiểu tóc với hình ảnh
  const hotTrends = [
    {
      id: 1,
      name: "Tóc Tầng Rối",
      popularity: 95,
      image: toc1,
      description:
        "Sự kết hợp hoàn hảo giữa kiểu shag và mullet, tạo lớp tóc nhiều tầng tự nhiên, đầy phong cách.",
      stats: { likes: 2340, views: 15600, saves: 890 },
      tags: ["Thời thượng", "Đa năng", "Dễ chăm sóc"],
    },
    {
      id: 2,
      name: "Mái Rèm",
      popularity: 88,
      image: toc2,
      description:
        "Mái rèm mềm mại, phù hợp với mọi khuôn mặt, mang lại vẻ đẹp thanh thoát.",
      stats: { likes: 1890, views: 12300, saves: 670 },
      tags: ["Cổ điển", "Tôn khuôn mặt", "Tinh tế"],
    },
    {
      id: 3,
      name: "Tóc Bướm",
      popularity: 82,
      image: toc3,
      description:
        "Lớp cắt tạo độ phồng tự nhiên, giống như đôi cánh bướm, đầy cuốn hút.",
      stats: { likes: 1560, views: 9800, saves: 520 },
      tags: ["Bồng bềnh", "Vui tươi", "Hiện đại"],
    },
    {
      id: 4,
      name: "Tóc Highlight Mặt",
      popularity: 76,
      image: toc4,
      description:
        "Highlight hai lọn tóc phía trước, tạo điểm nhấn mạnh mẽ và nổi bật.",
      stats: { likes: 1340, views: 8900, saves: 450 },
      tags: ["Nhuộm sáng", "Táo bạo", "Điểm nhấn"],
    },
    {
      id: 5,
      name: "Bob Rối",
      popularity: 80,
      image: toc5,
      description:
        "Kiểu bob ngắn với các lớp tóc lộn xộn, trẻ trung và năng động.",
      stats: { likes: 1450, views: 9200, saves: 480 },
      tags: ["Ngắn", "Thoải mái", "Tự nhiên"],
    },
    {
      id: 6,
      name: "Pixie Gọn Gàng",
      popularity: 85,
      image: toc6,
      description:
        "Tóc pixie mượt mà, gọn gàng, tôn lên đường nét khuôn mặt sắc sảo.",
      stats: { likes: 1780, views: 11000, saves: 600 },
      tags: ["Thanh lịch", "Táo bạo", "Tối giản"],
    },
    {
      id: 7,
      name: "Crop Kết Cấu",
      popularity: 79,
      image: toc7,
      description:
        "Tóc nam ngắn với kết cấu rối tự nhiên, mạnh mẽ và đầy phong cách.",
      stats: { likes: 1280, views: 8500, saves: 420 },
      tags: ["Nam tính", "Kết cấu", "Hiện đại"],
    },
    {
      id: 8,
      name: "Tóc Dài Tầng",
      popularity: 83,
      image: toc8,
      description:
        "Tóc dài với các lớp cắt tỉa, tạo độ bồng bềnh và chuyển động uyển chuyển.",
      stats: { likes: 1620, views: 10500, saves: 550 },
      tags: ["Tinh tế", "Mềm mại", "Nữ tính"],
    },
    {
      id: 9,
      name: "Balayage Rực Rỡ",
      popularity: 77,
      image: toc9,
      description:
        "Kỹ thuật nhuộm balayage với màu sắc rực rỡ, tạo chiều sâu và sức sống cho tóc.",
      stats: { likes: 1390, views: 8700, saves: 460 },
      tags: ["Sặc sỡ", "Nghệ thuật", "Thời thượng"],
    },
    {
      id: 10,
      name: "Mullet Hiện Đại",
      popularity: 81,
      image: toc10,
      description:
        "Phiên bản mullet hiện đại, cân bằng giữa cá tính và sự tinh tế.",
      stats: { likes: 1510, views: 9400, saves: 500 },
      tags: ["Cá tính", "Hoài cổ", "Táo bạo"],
    },
  ];

  // Dự đoán xu hướng tương lai
  const predictions = [
    {
      id: 1,
      trend: "Tóc Tầng Siêu Mỏng",
      probability: 92,
      timeline: "Quý 2 2025",
      description:
        "Những lớp cắt siêu mỏng tạo chuyển động tự nhiên, nhẹ nhàng.",
      icon: "✂️",
    },
    {
      id: 2,
      trend: "Màu Tóc Ánh Kim",
      probability: 85,
      timeline: "Quý 3 2025",
      description: "Màu tóc ánh cầu vồng với hiệu ứng kim loại bắt mắt.",
      icon: "🌈",
    },
    {
      id: 3,
      trend: "Tóc Cổ Điển Hồi Sinh",
      probability: 78,
      timeline: "Quý 4 2025",
      description: "Sự trở lại của các kiểu tóc cổ điển từ thập niên 70-80.",
      icon: "📻",
    },
    {
      id: 4,
      trend: "Công Nghệ Tóc Thông Minh",
      probability: 71,
      timeline: "2026",
      description:
        "Tích hợp công nghệ thông minh vào chăm sóc và tạo kiểu tóc.",
      icon: "🤖",
    },
  ];

  // Lời khuyên từ stylist
  const stylistAdvice = [
    {
      id: 1,
      stylist: "Minh Châu",
      position: "Nhà Tạo Mẫu Tóc Cao Cấp",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
      advice:
        "Xu hướng 2025 tập trung vào sự tự nhiên và cá nhân hóa. Hãy chọn kiểu tóc phù hợp với phong cách sống của bạn.",
      specialty: "Chuyên gia màu sắc",
    },
    {
      id: 2,
      stylist: "Đức Anh",
      position: "Giám Đốc Sáng Tạo",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
      advice:
        "Đừng chạy theo xu hướng một cách mù quáng. Quan trọng là kiểu tóc phải tôn lên vẻ đẹp tự nhiên của bạn.",
      specialty: "Tạo kiểu sáng tạo",
    },
    {
      id: 3,
      stylist: "Thu Hương",
      position: "Chuyên Gia Phân Tích Xu Hướng",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
      advice:
        "Năm 2025 sẽ ưu tiên sự bền vững. Hãy chọn kiểu tóc dễ chăm sóc, tiết kiệm thời gian.",
      specialty: "Tạo kiểu bền vững",
    },
  ];

  // Khởi tạo GSAP và AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });

    // GSAP cho tiêu đề chính
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" }
    );

    // GSAP cho các tiêu đề section
    [trendsRef, predictionsRef, adviceRef].forEach((ref) => {
      if (ref.current) {
        gsap.fromTo(
          ref.current.querySelector("h2"),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 80%",
            },
          }
        );
      }
    });
  }, []);

  // GSAP karaoke cho tiêu đề modal
  useEffect(() => {
    if (selectedStyle && modalTitleRef.current) {
      const text = modalTitleRef.current;
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
  }, [selectedStyle]);

  const openModal = (style) => {
    setSelectedStyle(style);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedStyle(null);
    document.body.style.overflow = "unset";
  };

  const handleBookingNavigation = () => {
    setSelectedStyle(null); // Đóng modal trước khi điều hướng
    document.body.style.overflow = "unset"; // Reset overflow
    navigate("/booking");
    window.scrollTo(0, 0); // Cuộn lên đầu trang sau khi điều hướng
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden"
    >
      {/* Hiệu ứng nền động */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-40 h-40 bg-pink-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-purple-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-indigo-300 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Phần tiêu đề */}
      <section ref={heroRef} className="relative z-10 pt-20 pb-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8" data-aos="fade-up">
            <span className="inline-flex items-center bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4 mr-2" />
              Xu Hướng Mới Nhất 2025
            </span>
          </div>

          <h1
            ref={titleRef}
            className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6"
          >
            Xu Hướng Tóc 2025
          </h1>

          <p
            className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Khám phá những xu hướng tóc đình đám nhất năm 2025, từ các kiểu cắt
            đang thịnh hành đến dự đoán tương lai ngành làm đẹp
          </p>

          <div
            className="flex flex-wrap justify-center gap-4"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <button
              onClick={() => setActiveTab("hot")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "hot"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "bg-white/70 text-gray-700 hover:bg-white"
              }`}
            >
              🔥 Đang Hot
            </button>
            <button
              onClick={() => setActiveTab("predictions")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "predictions"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "bg-white/70 text-gray-700 hover:bg-white"
              }`}
            >
              🔮 Dự Đoán
            </button>
            <button
              onClick={() => setActiveTab("advice")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "advice"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "bg-white/70 text-gray-700 hover:bg-white"
              }`}
            >
              💡 Phong Cách
            </button>
          </div>
        </div>
      </section>

      {/* Phần Xu Hướng Nổi Bật */}
      {activeTab === "hot" && (
        <section ref={trendsRef} className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Những Mẫu Tóc Đang Hot 🔥
              </h2>
              <p className="text-lg text-gray-600">
                Các kiểu tóc thịnh hành được yêu thích nhất hiện nay
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {hotTrends.map((style, index) => (
                <div
                  key={style.id}
                  className="group cursor-pointer"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  onClick={() => openModal(style)}
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={style.image}
                        alt={style.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <Heart className="w-3 h-3 mr-1" />
                                {style.stats.likes}
                              </span>
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {style.stats.views}
                              </span>
                            </div>
                            <Play className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {style.popularity}% Thịnh Hành
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {style.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {style.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {style.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Mức Độ Phổ Biến
                        </div>
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-1000"
                              style={{ width: `${style.popularity}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {style.popularity}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Phần Dự Đoán Xu Hướng */}
      {activeTab === "predictions" && (
        <section ref={predictionsRef} className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Dự Đoán Xu Hướng 2025 🔮
              </h2>
              <p className="text-lg text-gray-600">
                Những xu hướng sắp bùng nổ trong tương lai gần
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {predictions.map((prediction, index) => (
                <div
                  key={prediction.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  data-aos="fade-up"
                  data-aos-delay={index * 150}
                >
                  <div className="flex items-start space-x-6">
                    <div className="text-4xl">{prediction.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-2xl font-bold text-gray-800">
                          {prediction.trend}
                        </h3>
                        <div className="flex items-center space-x-3">
                          <span className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {prediction.probability}% Khả Năng
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {prediction.timeline}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {prediction.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">Độ Tin Cậy</div>
                        <div className="flex items-center">
                          <div className="w-32 h-3 bg-gray-200 rounded-full mr-3">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-1000"
                              style={{ width: `${prediction.probability}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {prediction.probability}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Phần Lời Khuyên Từ Chuyên Gia */}
      {activeTab === "advice" && (
        <section ref={adviceRef} className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Lời Khuyên Từ Chuyên Gia 💡
              </h2>
              <p className="text-lg text-gray-600">
                Chia sẻ từ những nhà tạo mẫu hàng đầu về xu hướng phong cách
                2025
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stylistAdvice.map((expert, index) => (
                <div
                  key={expert.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-md transition-all duration-300"
                  data-aos="fade-up"
                  data-aos-delay={index * 200}
                >
                  <div className="text-center mb-6">
                    <img
                      src={expert.avatar}
                      alt={expert.stylist}
                      className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-gradient-to-r from-pink-400 to-purple-500"
                    />
                    <h3 className="text-xl font-bold text-gray-800">
                      {expert.stylist}
                    </h3>
                    <p className="text-purple-600 font-medium">
                      {expert.position}
                    </p>
                    <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs mt-2">
                      {expert.specialty}
                    </span>
                  </div>

                  <blockquote className="text-gray-700 italic text-center leading-relaxed">
                    "{expert.advice}"
                  </blockquote>

                  <div className="flex justify-center mt-6">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modal Chi Tiết Kiểu Tóc */}
      {selectedStyle && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          data-aos="zoom-in"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedStyle.image}
                alt={selectedStyle.name}
                className="w-full h-64 object-cover rounded-t-3xl"
              />
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
              >
                <X className="w-6 h-6 text-gray-800" />
              </button>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h2
                  ref={modalTitleRef}
                  className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent modal-title"
                >
                  {selectedStyle.name}
                </h2>
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {selectedStyle.popularity}% Thịnh Hành
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {selectedStyle.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedStyle.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">
                    {selectedStyle.stats.likes}
                  </div>
                  <div className="text-sm text-gray-600">Lượt Thích</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">
                    {selectedStyle.stats.views}
                  </div>
                  <div className="text-sm text-gray-600">Lượt Xem</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Sparkles className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">
                    {selectedStyle.stats.saves}
                  </div>
                  <div className="text-sm text-gray-600">Lượt Lưu</div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleBookingNavigation}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  Đặt Lịch Ngay
                </button>
                <button className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:border-purple-500 hover:text-purple-600 transition-colors">
                  Lưu Yêu Thích
                </button>
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

        [data-aos="zoom-in"] {
          transform: scale(0.8);
        }

        [data-aos="zoom-in"].aos-animate {
          transform: scale(1);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .char {
          display: inline-block;
          margin-right: 0.05em; /* Khoảng cách nhỏ giữa các ký tự */
        }

        .modal-title {
          letter-spacing: 0.02em; /* Tăng khoảng cách chữ cho dễ đọc */
        }
      `}</style>
    </div>
  );
};

export default Hairtrend;
