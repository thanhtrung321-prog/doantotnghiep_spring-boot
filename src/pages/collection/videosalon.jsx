import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Award,
  Users,
  Clock,
  Star,
  X,
} from "lucide-react";

const VideoSalon = () => {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  const salonStats = [
    { icon: Users, number: "5000+", label: "Khách hàng hài lòng" },
    { icon: Award, number: "10+", label: "Năm kinh nghiệm" },
    { icon: Star, number: "4.9/5", label: "Đánh giá trung bình" },
    { icon: Clock, number: "30min", label: "Thời gian trung bình" },
  ];

  const features = [
    {
      title: "Chuyên gia tay nghề cao",
      description:
        "Đội ngũ thợ cắt tóc được đào tạo chuyên nghiệp với nhiều năm kinh nghiệm",
    },
    {
      title: "Không gian hiện đại",
      description:
        "Salon được thiết kế sang trọng, thoải mái với đầy đủ tiện nghi cao cấp",
    },
    {
      title: "Sản phẩm chất lượng",
      description:
        "Sử dụng các sản phẩm chăm sóc tóc cao cấp từ những thương hiệu uy tín",
    },
    {
      title: "Dịch vụ đa dạng",
      description:
        "Cắt, gội, nhuộm, uốn, duỗi và các dịch vụ chăm sóc tóc chuyên nghiệp",
    },
  ];

  useEffect(() => {
    // GSAP animations
    if (typeof window !== "undefined" && window.gsap) {
      const { gsap } = window;

      // Hero animation
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1.2, ease: "back.out(1.7)" }
      );

      // Stats animation
      gsap.fromTo(
        ".stat-item",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".stats-section",
            start: "top 80%",
          },
        }
      );

      // Features animation
      gsap.fromTo(
        ".feature-card",
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".features-section",
            start: "top 70%",
          },
        }
      );
    }

    // AOS initialization
    if (typeof window !== "undefined" && window.AOS) {
      window.AOS.init({
        duration: 1000,
        easing: "ease-in-out-cubic",
        once: true,
        mirror: false,
      });
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const openFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-pink-50">
      {/* Hero Section with Video */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/60 via-black/40 to-pink-900/60 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&h=1080&fit=crop"
            alt="Salon Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div
          ref={heroRef}
          className="relative z-20 text-center text-white max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-pink-500 px-6 py-3 rounded-full text-sm font-medium mb-8">
            <Award className="w-4 h-4" />
            Beauty Salon nơi tạo dựng vẻ đẹp hoàn hảo
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Khám Phá Vẻ Đẹp
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent">
              Hoàn Hảo
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Nơi nghệ thuật tạo mẫu tóc gặp gỡ công nghệ hiện đại.
          </p>

          {/* Video Preview Button */}
          <div className="flex flex-col items-center gap-8">
            <button
              onClick={() => setShowVideo(true)}
              className="group relative w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-500 transform hover:scale-110"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <Play className="w-12 h-12 text-white ml-2 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse"></div>
            </button>

            <p className="text-lg font-semibold">Xem Video Giới Thiệu</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12 mb-12">
            <a
              href="http://localhost:5173/booking"
              className="bg-gradient-to-r from-amber-500 to-pink-500 text-white px-10 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 transform hover:scale-105"
            >
              Đặt Lịch Ngay
            </a>
            <a
              href="http://localhost:5173/tableprice"
              className="border-2 border-white text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-amber-900 transition-all duration-300"
            >
              Xem Bảng Giá
            </a>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 bg-gradient-to-r from-amber-500 to-pink-500 text-white p-2 rounded-full hover:bg-amber-600 transition-all duration-300 transform hover:scale-110 z-50"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
              {/* Video Player */}
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=450&fit=crop"
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  <source src="your-video-url.mp4" type="video/mp4" />
                  Video không được hỗ trợ bởi trình duyệt này.
                </video>

                {/* Video Controls */}
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white ml-1" />
                      )}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-6 h-6 text-white" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-white" />
                      )}
                    </button>
                    <button
                      onClick={openFullscreen}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                      <Maximize className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-6 bg-gradient-to-r from-amber-900 to-pink-900 text-white">
                <h3 className="text-2xl font-bold mb-2">
                  Giới Thiệu Salon Tóc Chuyên Nghiệp
                </h3>
                <p className="text-gray-200">
                  Khám phá không gian hiện đại và dịch vụ đẳng cấp của chúng
                  tôi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <section className="stats-section py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl font-bold text-amber-900 mb-4">
              Con Số Ấn Tượng
            </h2>
            <p className="text-xl text-gray-600">
              Niềm tin của khách hàng là động lực của chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {salonStats.map((stat, index) => (
              <div
                key={index}
                className="stat-item text-center p-6 bg-gradient-to-br from-amber-50 to-pink-50 rounded-2xl hover:from-amber-100 hover:to-pink-100 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-pink-500 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-amber-900 mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-20 px-4 bg-gradient-to-br from-amber-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl font-bold text-amber-900 mb-4">
              Tại Sao Chọn Chúng Tôi?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chất lượng dịch vụ hàng đầu cho trải nghiệm làm đẹp tuyệt vời
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VideoSalon;
