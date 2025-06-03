import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Heart, Eye, X } from "lucide-react";

// Import images from assets with correct path
import buzz from "../../assets/imagecolection/buzz.jpg";
import mullet from "../../assets/imagecolection/kieu-toc-mullet-nu-cuc-ca-tinh_110516053.jpg";
import layer from "../../assets/imagecolection/layer.png";
import wavy from "../../assets/imagecolection/Mau-toc-kieu-song-loi-cach-uon-toc-lon-nho.jpg";
import mohican from "../../assets/imagecolection/mohican.jpg";
import sidePart from "../../assets/imagecolection/side_part.jpg";
import layerBay from "../../assets/imagecolection/toc-layer-mai-bay_nu.jpg";
import cupNgan1 from "../../assets/imagecolection/toc-ngan-uon-cup-dep-nhat-cho-nu-1.jpeg";
import cupNgan2 from "../../assets/imagecolection/toc-ngan-uon-cup-dep-nhat-cho-nu-1.jpeg"; // Duplicate image as per provided list
import toclob from "../../assets/imagecolection/toclob.webp";
import undercut from "../../assets/imagecolection/Undercut.png";

const Collection = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState(null);

  // Updated hair style data with provided images and descriptions
  const hairStyles = [
    {
      id: 1,
      title: "Tóc Buzz Cut",
      image: buzz,
      category: "Tóc Nam",
      rating: 4.7,
      likes: 132,
      views: 1100,
      description:
        "Kiểu tóc Buzz Cut cực kỳ ngắn, gọn gàng, mang lại vẻ nam tính và mạnh mẽ. Phù hợp với những ai yêu thích sự tối giản và dễ chăm sóc.",
    },
    {
      id: 2,
      title: "Tóc Mullet Nữ",
      image: mullet,
      category: "Tóc Nữ",
      rating: 4.9,
      likes: 95,
      views: 1020,
      description:
        "Tóc Mullet nữ là sự kết hợp giữa phần tóc ngắn phía trước và dài phía sau, tạo nên vẻ cá tính, phá cách, phù hợp với phong cách nổi loạn.",
    },
    {
      id: 3,
      title: "Tóc Layer Dài",
      image: layer,
      category: "Tóc Dài",
      rating: 4.8,
      likes: 178,
      views: 1350,
      description:
        "Tóc Layer dài với các lớp tóc được cắt tỉa khéo léo, tạo độ bồng bềnh và chuyển động tự nhiên, lý tưởng cho vẻ ngoài thanh lịch.",
    },
    {
      id: 4,
      title: "Tóc Sóng Lơi",
      image: wavy,
      category: "Tóc Xoăn",
      rating: 4.6,
      likes: 210,
      views: 1650,
      description:
        "Tóc Sóng Lơi mang đến vẻ đẹp mềm mại, tự nhiên với những lọn sóng nhẹ, phù hợp cho mọi dịp từ đời thường đến sự kiện.",
    },
    {
      id: 5,
      title: "Tóc Mohican",
      image: mohican,
      category: "Tóc Nam",
      rating: 4.8,
      likes: 143,
      views: 1200,
      description:
        "Tóc Mohican với phần đỉnh tóc dài và hai bên cạo ngắn, tạo điểm nhấn mạnh mẽ và phong cách, phù hợp với những người yêu thích sự nổi bật.",
    },
    {
      id: 6,
      title: "Tóc Side Part",
      image: sidePart,
      category: "Tóc Nam",
      rating: 4.7,
      likes: 88,
      views: 950,
      description:
        "Tóc Side Part là kiểu tóc cổ điển với đường rẽ ngôi lệch, mang lại vẻ ngoài lịch lãm và tinh tế, phù hợp với mọi độ tuổi.",
    },
    {
      id: 7,
      title: "Tóc Layer Mái Bay",
      image: layerBay,
      category: "Tóc Nữ",
      rating: 4.9,
      likes: 165,
      views: 1480,
      description:
        "Tóc Layer Mái Bay với phần mái dài nhẹ nhàng và các lớp tóc bồng bềnh, tạo nên vẻ dịu dàng, nữ tính và hiện đại.",
    },
    {
      id: 8,
      title: "Tóc Ngắn Uốn Cụp",
      image: cupNgan1,
      category: "Tóc Ngắn",
      rating: 4.6,
      likes: 112,
      views: 870,
      description:
        "Tóc Ngắn Uốn Cụp là kiểu tóc ngắn với phần đuôi uốn cụp, mang lại vẻ trẻ trung, năng động và dễ dàng tạo kiểu.",
    },
    {
      id: 9,
      title: "Tóc Ngắn Uốn Cụp (Biến Tấu)",
      image: cupNgan2,
      category: "Tóc Ngắn",
      rating: 4.7,
      likes: 99,
      views: 910,
      description:
        "Biến tấu của tóc ngắn uốn cụp với các lọn uốn nhẹ hơn, tạo cảm giác mềm mại và phong cách, phù hợp với các bạn gái năng động.",
    },
    {
      id: 10,
      title: "Tóc Lob",
      image: toclob,
      category: "Tóc Ngắn",
      rating: 4.8,
      likes: 134,
      views: 1150,
      description:
        "Tóc Lob (Long Bob) là kiểu tóc ngắn ngang vai, mang lại vẻ hiện đại và linh hoạt, dễ dàng biến hóa cho nhiều phong cách.",
    },
    {
      id: 11,
      title: "Tóc Undercut",
      image: undercut,
      category: "Tóc Nam",
      rating: 4.9,
      likes: 187,
      views: 1420,
      description:
        "Tóc Undercut với phần hai bên và sau gáy cạo sát, kết hợp đỉnh tóc dài, tạo nên vẻ mạnh mẽ và thời thượng.",
    },
  ];

  // Initialize animations
  useEffect(() => {
    // GSAP animations (simplified to use inline styles)
    const tl = {
      set: (target, props) => {
        if (target.current) {
          Object.assign(target.current.style, props);
        }
      },
      from: (target, props) => {
        if (target.current) {
          const element = target.current;
          const duration = props.duration || 1;
          const delay = props.delay || 0;

          // Set initial state
          if (props.opacity !== undefined)
            element.style.opacity = props.opacity;
          if (props.y !== undefined)
            element.style.transform = `translateY(${props.y}px)`;
          if (props.x !== undefined)
            element.style.transform = `translateX(${props.x}px)`;
          if (props.scale !== undefined)
            element.style.transform = `scale(${props.scale})`;

          setTimeout(() => {
            element.style.transition = `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`;
            element.style.opacity = 1;
            element.style.transform = "translateY(0) translateX(0) scale(1)";
          }, delay * 1000);
        }
      },
    };

    // Animate title
    tl.from(titleRef, { opacity: 0, y: -50, duration: 1 });

    // Animate slider
    setTimeout(() => {
      tl.from(sliderRef, { opacity: 0, y: 50, duration: 1 });
    }, 300);

    // AOS-like scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("aos-animate");
        }
      });
    }, observerOptions);

    document.querySelectorAll("[data-aos]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(hairStyles.length / 3));
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, hairStyles.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(hairStyles.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? Math.ceil(hairStyles.length / 3) - 1 : prev - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden mt-24"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-amber-300 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-orange-300 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-300 rounded-full blur-lg animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Title Section */}
        <div
          ref={titleRef}
          className="text-center mb-16 opacity-0"
          data-aos="fade-up"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-800 via-orange-700 to-amber-900 bg-clip-text text-transparent mb-4">
            Bộ Sưu Tập Kiểu Tóc Đẹp
          </h1>
          <p className="text-lg text-amber-700 mb-6 max-w-2xl mx-auto">
            Khám phá bộ sưu tập kiểu tóc đa dạng, từ cá tính đến dịu dàng, phù
            hợp với mọi phong cách
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-amber-600 to-orange-600 mx-auto rounded-full">
            <div className="w-full h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Slider Section */}
        <div
          ref={sliderRef}
          className="relative opacity-0"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 group"
            data-aos="fade-right"
          >
            <ChevronLeft className="w-6 h-6 text-amber-800 group-hover:text-amber-900" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 group"
            data-aos="fade-left"
          >
            <ChevronRight className="w-6 h-6 text-amber-800 group-hover:text-amber-900" />
          </button>

          {/* Slider Container */}
          <div className="overflow-hidden rounded-2xl bg-white/20 backdrop-blur-sm p-6">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: Math.ceil(hairStyles.length / 3) }).map(
                (_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {hairStyles
                        .slice(slideIndex * 3, slideIndex * 3 + 3)
                        .map((style, index) => (
                          <div
                            key={style.id}
                            className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                          >
                            {/* Image Container */}
                            <div className="relative h-80 overflow-hidden">
                              <img
                                src={style.image}
                                alt={style.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />

                              {/* Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-4 left-4 right-4">
                                  <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center space-x-2">
                                      <Heart className="w-4 h-4" />
                                      <span className="text-sm">
                                        {style.likes}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Eye className="w-4 h-4" />
                                      <span className="text-sm">
                                        {style.views}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Category Badge */}
                              <div className="absolute top-4 left-4">
                                <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                  {style.category}
                                </span>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                              <h3 className="text-xl font-bold text-amber-900 mb-2 group-hover:text-amber-700 transition-colors">
                                {style.title}
                              </h3>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < Math.floor(style.rating)
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                  <span className="text-sm text-gray-600 ml-2">
                                    {style.rating}
                                  </span>
                                </div>

                                <button
                                  onClick={() => setSelectedStyle(style)}
                                  className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-amber-700 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                                >
                                  Xem Chi Tiết
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(hairStyles.length / 3) }).map(
              (_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-amber-600 w-8"
                      : "bg-amber-300 hover:bg-amber-400"
                  }`}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                />
              )
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div
          className="text-center mt-16"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <button className="group relative bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
            <span className="relative z-10">Khám Phá Thêm</span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-orange-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        </div>
      </div>

      {/* Modal for Hair Style Details */}
      {selectedStyle && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            data-aos="zoom-in"
          >
            <button
              onClick={() => setSelectedStyle(null)}
              className="absolute top-4 right-4 text-amber-800 hover:text-amber-900 text-2xl font-bold transition-colors duration-200"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image */}
              <div className="flex-shrink-0">
                <img
                  src={selectedStyle.image}
                  alt={selectedStyle.title}
                  className="w-full md:w-64 h-80 object-cover rounded-lg"
                />
              </div>
              {/* Details */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-amber-900 mb-4">
                  {selectedStyle.title}
                </h2>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {selectedStyle.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(selectedStyle.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      {selectedStyle.rating}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-6 mb-4 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">
                      {selectedStyle.likes} lượt thích
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">
                      {selectedStyle.views} lượt xem
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-6">
                  {selectedStyle.description}
                </p>
                <button className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:from-amber-700 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
                  Đặt Lịch Ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for AOS-like animations */}
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

        [data-aos].aos-animate {
          transform: translateY(0) translateX(0) scale(1);
        }
      `}</style>
    </div>
  );
};

export default Collection;
