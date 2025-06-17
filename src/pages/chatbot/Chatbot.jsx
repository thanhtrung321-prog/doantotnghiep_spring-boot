import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Scissors, Sparkles, MapPin, X } from "lucide-react";
import {
  sendMessageToGemini,
  fetchSalons,
  fetchSalonServices,
  fetchSalonCategories,
  fetchServicesByCategory,
} from "../../api/chatbot";
import { getImageUrl } from "../../api/serviceoffering";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const navLinks = [
  { to: "/", label: "Trang Chủ", icon: "🏠" },
  { to: "/services", label: "Dịch Vụ", icon: "✨" },
  { to: "/collection", label: "Mẫu Tóc", icon: "💇‍♀️" },
  { to: "/tableprice", label: "Bảng Giá", icon: "💰" },
  { to: "/about", label: "Về Chúng Tôi", icon: "👥" },
  { to: "/contact", label: "Liên Hệ", icon: "📞" },
];

const TypingInput = ({ value, onChange, onKeyDown, placeholder, onSend }) => {
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const input = inputRef.current;
    const wrapper = wrapperRef.current;

    if (input && wrapper) {
      input.focus();
      const handleClick = () => input.focus();
      wrapper.addEventListener("click", handleClick);

      return () => {
        wrapper.removeEventListener("click", handleClick);
      };
    }
  }, []);

  return (
    <div className="input-wrapper" ref={wrapperRef}>
      <input
        ref={inputRef}
        type="text"
        className="typing-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <button
        onClick={onSend}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!value.trim()}
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "💇‍♀️ Xin chào! Tôi là AI tư vấn viên của salon. Hỏi tôi về dịch vụ, đặt lịch, hoặc chọn salon nhé!",
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedSalonId, setSelectedSalonId] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [displayMode, setDisplayMode] = useState("slider");
  const messagesEndRef = useRef(null);
  const headerTextRef = useRef(null);
  const chatContainerRef = useRef(null);
  const messageRefs = useRef([]);
  const serviceNameRefs = useRef([]);
  const navigate = useNavigate();

  const quickSuggestions = [
    "Gợi ý salon",
    "Liệt kê dịch vụ",
    "Đặt lịch",
    "Xem bảng giá",
  ];

  const normalizeText = (text) => {
    return text
      .replace(/\s+/g, " ")
      .replace(
        /([^\s])([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ])/g,
        "$1 $2"
      )
      .trim();
  };

  const parseSteps = (service) => {
    const names = service.name.split("|").filter((name) => name.trim());
    const descriptions = service.description
      .split("|")
      .filter((desc) => desc.trim());
    const images = service.image?.split("|").filter((img) => img.trim()) || [];

    const cover = {
      name: names[0] || "Dịch vụ không xác định",
      description: descriptions[0] || "Không có mô tả",
      image: images[0] ? getImageUrl(images[0]) : "/api/placeholder/300/200",
    };

    const steps = images.slice(1).map((img, index) => ({
      name: names[index + 1] || `Bước ${index + 1}`,
      description: descriptions[index + 1] || "Không có mô tả",
      image: img ? getImageUrl(img) : "/api/placeholder/300/200",
    }));

    console.log(
      "Service:",
      service.name,
      "Cover Image:",
      cover.image,
      "Step Images:",
      steps.map((s) => s.image)
    );

    return { cover, steps };
  };

  const selectServiceAndRedirect = async (service, salonId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        toast.error("Vui lòng đăng nhập để đặt lịch.");
        return;
      }

      const serviceId = service.originalId || service.id;
      const selectedServices = [serviceId.toString()];
      Cookies.set("selectedServices", JSON.stringify(selectedServices), {
        expires: 1,
      });

      navigate("/booking", {
        state: {
          userId: user.id,
          salonId,
          services: [service],
        },
      });
    } catch (error) {
      toast.error("Lỗi khi chọn dịch vụ: " + error.message);
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 10000,
    afterChange: (index) => {
      setShowDetails((prev) => ({ ...prev, activeIndex: index }));
    },
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (headerTextRef.current) {
      const text = headerTextRef.current;
      const chars = text.textContent.split("");
      text.innerHTML = chars
        .map((char) => `<span class="char inline-block">${char}</span>`)
        .join("");

      const charElements = text.querySelectorAll(".char");
      gsap.fromTo(
        charElements,
        {
          opacity: 0,
          scale: 0.8,
          color: "#8B5FBF",
        },
        {
          opacity: 1,
          scale: 1,
          color: "#FFFFFF",
          duration: 0.8,
          stagger: 0.1,
          ease: "elastic.out(1, 0.5)",
          repeat: -1,
          repeatDelay: 2,
          yoyo: true,
        }
      );
    }
  }, []);

  useEffect(() => {
    messageRefs.current.forEach((ref, index) => {
      if (ref) {
        const words = ref.textContent.split(" ").filter((word) => word);
        ref.innerHTML = words
          .map(
            (word) =>
              `<span class="word inline-block opacity-50">${word}</span>`
          )
          .join(" ");

        const wordElements = ref.querySelectorAll(".word");
        gsap.to(wordElements, {
          opacity: 1,
          color: messages[index].from === "user" ? "#ffffff" : "#1f2937",
          duration: 0.05,
          stagger: 0.05,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    });

    serviceNameRefs.current.forEach((ref) => {
      if (ref) {
        const words = ref.textContent.split(" ").filter((word) => word);
        ref.innerHTML = words
          .map(
            (word) =>
              `<span class="word inline-block opacity-50">${word}</span>`
          )
          .join(" ");

        const wordElements = ref.querySelectorAll(".word");
        gsap.to(wordElements, {
          opacity: 1,
          color: "#92400e",
          duration: 0.05,
          stagger: 0.05,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    });

    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { from: "user", text: input, type: "text" },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setShowSuggestions(false);

    try {
      const lowerInput = input.toLowerCase();
      let botMessage = { from: "bot", type: "text" };
      let action = "show_message";

      if (
        lowerInput.includes("gợi ý salon") ||
        lowerInput.includes("chọn salon")
      ) {
        const salons = await fetchSalons();
        if (salons.length === 0) {
          botMessage.text = normalizeText(
            "Không tìm thấy salon nào. Vui lòng thử lại sau."
          );
        } else {
          botMessage.text = normalizeText(
            "Dưới đây là các salon bạn có thể chọn:"
          );
          botMessage.salons = salons;
          action = "show_salons";
        }
      } else if (
        lowerInput.includes("liệt kê dịch vụ") ||
        lowerInput.includes("danh sách dịch vụ")
      ) {
        if (!selectedSalonId) {
          botMessage.text = normalizeText(
            "Vui lòng chọn salon trước khi liệt kê dịch vụ. Bạn muốn tôi gợi ý salon không?"
          );
          action = "prompt_salon";
        } else {
          const categories = await fetchSalonCategories(selectedSalonId);
          if (categories.length === 0) {
            botMessage.text = normalizeText(
              "Không tìm thấy danh mục dịch vụ nào cho salon này."
            );
          } else {
            botMessage.text = normalizeText(
              "Dưới đây là các danh mục dịch vụ của salon:"
            );
            botMessage.categories = categories;
            action = "show_categories_with_services";
          }
        }
      } else if (lowerInput.includes("xem dịch vụ")) {
        if (!selectedSalonId) {
          botMessage.text = normalizeText(
            "Vui lòng chọn salon trước khi xem dịch vụ. Bạn muốn tôi gợi ý salon không?"
          );
          action = "prompt_salon";
        } else {
          const services = await fetchSalonServices(selectedSalonId);
          if (services.length === 0) {
            botMessage.text = normalizeText(
              "Không tìm thấy dịch vụ nào cho salon này."
            );
          } else {
            botMessage.text = normalizeText(
              "Dưới đây là các dịch vụ của salon:"
            );
            botMessage.services = services;
            action = "show_services";
          }
        }
      } else if (
        lowerInput.includes("đặt lịch") ||
        lowerInput.includes("book")
      ) {
        botMessage.text = normalizeText(
          "Tuyệt vời! Tôi sẽ chuyển bạn đến trang đặt lịch ngay:"
        );
        action = "redirect_booking";
        setMessages([...newMessages, botMessage]);
        setTimeout(() => navigate("/booking"), 1500);
        setLoading(false);
        return;
      } else {
        const matchedNav = navLinks.find((link) => {
          const regex = new RegExp(
            `\\b(đi đến|mở|chuyển đến) (${link.label.toLowerCase()}|${link.to.slice(
              1
            )})\\b`,
            "i"
          );
          return regex.test(lowerInput);
        });
        if (matchedNav) {
          botMessage.text = normalizeText(
            `Đang chuyển bạn đến ${matchedNav.label}...`
          );
          action = "navigate";
          setMessages([...newMessages, botMessage]);
          setTimeout(() => navigate(matchedNav.to), 1500);
          setLoading(false);
          return;
        }
        const responseText = await sendMessageToGemini(input);
        botMessage.text = normalizeText(responseText);
        action = "show_message";
      }

      setMessages([...newMessages, { ...botMessage, action }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          from: "bot",
          text: normalizeText("❌ Có lỗi xảy ra. Vui lòng thử lại sau."),
          type: "text",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  const handleSalonSelect = (salonId) => {
    setSelectedSalonId(salonId);
    setMessages([
      ...messages,
      {
        from: "user",
        text: normalizeText(`Đã chọn salon ID ${salonId}. Xem dịch vụ ngay!`),
        type: "text",
      },
      {
        from: "bot",
        text: normalizeText("Đang tải dịch vụ của salon này..."),
        type: "text",
      },
    ]);
    setInput("xem dịch vụ");
    handleSend();
  };

  const handleCardClick = (e, service) => {
    e.stopPropagation();
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.className = "absolute bg-amber-300 opacity-50 rounded-full";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.transform = "translate(-50%, -50%) scale(0)";
    ripple.style.animation = "ripple 0.6s ease-out";
    card.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const handleDetailsClick = (e, service) => {
    e.stopPropagation();
    setShowDetails({ id: service.id, activeIndex: 0 });
    setDisplayMode("slider");
  };

  const handleCategoryServicesClick = async (e, categoryId) => {
    e.stopPropagation();
    if (!selectedSalonId) {
      toast.error("Vui lòng chọn salon trước.");
      return;
    }

    setLoading(true);
    try {
      const services = await fetchServicesByCategory(
        selectedSalonId,
        categoryId
      );
      if (services.length === 0) {
        setMessages([
          ...messages,
          {
            from: "bot",
            text: normalizeText(
              `Không tìm thấy dịch vụ nào trong danh mục này.`
            ),
            type: "text",
          },
        ]);
      } else {
        setMessages([
          ...messages,
          {
            from: "bot",
            text: normalizeText(`Dưới đây là các dịch vụ trong danh mục này:`),
            type: "text",
            services,
            action: "show_services",
          },
        ]);
      }
    } catch (error) {
      setMessages([
        ...messages,
        {
          from: "bot",
          text: normalizeText(
            "❌ Có lỗi xảy ra khi tải dịch vụ. Vui lòng thử lại sau."
          ),
          type: "text",
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleStepNavigation = (currentIndex, direction) => {
    const service = messages
      .flatMap((msg) => msg.services || [])
      .find((s) => s.id === showDetails.id);
    const { steps } = parseSteps(service);
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < steps.length) {
      setShowDetails((prev) => ({ ...prev, activeIndex: newIndex }));
    }
  };

  const SalonCard = ({ salon }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-2 hover:shadow-md">
      <img
        src={`http://localhost:8084/salon-images/${salon.images[0]}`}
        alt={salon.name}
        className="w-full h-32 object-cover rounded-md mb-2"
        onError={(e) => (e.target.src = "/api/placeholder/300/200")}
      />
      <h4 className="font-semibold text-gray-800 text-sm">{salon.name}</h4>
      <p className="text-xs text-gray-600">{salon.address}</p>
      <p className="text-xs text-gray-600">
        Giờ mở: {salon.openingTime} - {salon.closingTime}
      </p>
      <button
        onClick={() => handleSalonSelect(salon.id)}
        className="w-full mt-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-1 px-3 rounded-md text-xs hover:from-pink-600 hover:to-purple-700"
      >
        Chọn Salon
      </button>
    </div>
  );

  const ServiceCard = ({ service, salonId }) => {
    const { cover } = parseSteps(service);
    return (
      <div
        onClick={(e) => handleCardClick(e, service)}
        className="relative bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden group"
      >
        <img
          src={cover.image}
          alt={cover.name}
          className="w-full h-32 object-cover rounded-md mb-3 transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            console.error("Image load error:", cover.image);
            toast.error("Không thể tải hình ảnh dịch vụ.");
            e.target.src = "/api/placeholder/300/200";
          }}
        />
        <h4
          ref={(el) => (serviceNameRefs.current[service.id] = el)}
          className="font-semibold text-amber-800 text-sm mb-2"
        >
          {cover.name}
        </h4>
        <p className="text-xs text-gray-600 mb-2">{cover.description}</p>
        <p className="text-amber-600 font-medium text-xs mb-2">
          {(service.price || 0).toLocaleString("vi-VN")} VND
        </p>
        <p className="text-gray-600 text-xs mb-3">{service.duration} phút</p>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              selectServiceAndRedirect(service, salonId);
            }}
            className="flex-1 py-1 px-3 bg-amber-600 text-white rounded-md text-xs hover:bg-amber-700 transition-all duration-300 flex items-center justify-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Đặt Lịch Ngay
          </button>
          <button
            onClick={(e) => handleDetailsClick(e, service)}
            className="flex-1 py-1 px-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md text-xs hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
          >
            Xem Chi Tiết
          </button>
        </div>
      </div>
    );
  };

  const CategoryCard = ({ category }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-2 hover:shadow-md">
      <img
        src={`http://localhost:8086/category-images/${category.image}`}
        alt={category.name}
        className="w-full h-32 object-cover rounded-md mb-2"
        onError={(e) => (e.target.src = "/api/placeholder/300/200")}
      />
      <h4 className="font-semibold text-gray-800 text-sm mb-2">
        {category.name}
      </h4>
      <button
        onClick={(e) => handleCategoryServicesClick(e, category.id)}
        className="w-full mt-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-1 px-3 rounded-md text-xs hover:from-pink-600 hover:to-purple-700"
      >
        Xem Dịch Vụ
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <ToastContainer />
      <div
        ref={chatContainerRef}
        className="w-[80%] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh] max-h-[600px]"
        data-aos="fade-down"
        data-aos-duration="800"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-2 rounded-full">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <h3
                  ref={headerTextRef}
                  className="font-bold text-2xl tracking-widest"
                  style={{ letterSpacing: "0.1em" }}
                >
                  Beauty Salon
                </h3>
                <p className="text-pink-100 text-sm">Tư vấn viên thông minh</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-green-400 w-3 h-3 rounded-full"></div>
              <button
                onClick={() => navigate("/")}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                aria-label="Quay về trang chủ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-pink-50 to-purple-50">
          {messages.map((msg, index) => (
            <div key={index}>
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.from === "user"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-auto rounded-br-md"
                    : "bg-gray-100 text-gray-800 rounded-bl-md"
                }`}
              >
                <span
                  ref={(el) => (messageRefs.current[index] = el)}
                  className="inline-block"
                >
                  {msg.text}
                </span>
              </div>

              {msg.salons && msg.from === "bot" && (
                <div className="mt-3 max-w-[85%]">
                  {msg.salons.map((salon) => (
                    <SalonCard key={salon.id} salon={salon} />
                  ))}
                </div>
              )}

              {msg.services && msg.from === "bot" && (
                <div className="mt-3 max-w-[85%] grid grid-cols-1 gap-4">
                  {msg.services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      salonId={selectedSalonId}
                    />
                  ))}
                </div>
              )}

              {msg.categories && msg.from === "bot" && (
                <div className="mt-3 max-w-[85%]">
                  {msg.categories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="max-w-[85%] bg-gray-100 rounded-2xl rounded-bl-md p-3">
              <span className="text-gray-500 text-xs">AI đang suy nghĩ...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {showSuggestions && (
          <div className="px-4 pb-2 flex-shrink-0">
            <p className="text-xs text-gray-500 mb-2 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Gợi ý nhanh:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="bg-gradient-to-r from-pink-100 to-purple-100 text-gray-700 px-3 py-1 rounded-full text-xs hover:from-pink-200 hover:to-purple-200 border border-pink-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 px-4 py-3 bg-white flex-shrink-0">
          <TypingInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Hỏi về dịch vụ salon..."
            onSend={handleSend}
          />
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-2 text-center flex-shrink-0">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <MapPin className="w-3 h-3 mr-1" />
            Beauty Salon - Powered by AI
          </p>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60]"
          data-aos="zoom-in"
        >
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-10 w-full max-w-[80%] max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-cyan-400 relative">
            <button
              className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-300 text-4xl font-bold transition-colors duration-200"
              onClick={() => setShowDetails(null)}
            >
              ×
            </button>
            {(() => {
              const service = messages
                .flatMap((msg) => msg.services || [])
                .find((s) => s.id === showDetails.id);
              const { cover, steps } = parseSteps(service);
              return (
                <>
                  <img
                    src={cover.image}
                    alt={cover.name}
                    className="absolute top-4 left-4 w-24 h-24 object-cover rounded-lg border-2 border-cyan-300 shadow-md"
                    onError={(e) => {
                      console.error(
                        "Modal cover image load error:",
                        cover.image
                      );
                      toast.error("Không thể tải hình ảnh dịch vụ.");
                      e.target.src = "/api/placeholder/100/100";
                    }}
                  />
                  <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-cyan-400 to-pink-500 text-transparent bg-clip-text mb-8">
                    {cover.name}
                  </h2>
                </>
              );
            })()}
            <div className="flex justify-between items-center mb-8">
              <div className="flex space-x-4 mt-4">
                <button
                  className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    displayMode === "slider"
                      ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setDisplayMode("slider")}
                >
                  Chế độ Slider
                </button>
                <button
                  className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    displayMode === "steps"
                      ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setDisplayMode("steps")}
                >
                  Chế độ Từng Bước
                </button>
              </div>
              <div className="text-lg font-semibold text-yellow-300">
                <span className="mr-6">
                  Giá:{" "}
                  {(
                    messages
                      .flatMap((msg) => msg.services || [])
                      .find((s) => s.id === showDetails.id).price || 0
                  ).toLocaleString("vi-VN")}{" "}
                  VND
                </span>
                <span>
                  Thời gian:{" "}
                  {
                    messages
                      .flatMap((msg) => msg.services || [])
                      .find((s) => s.id === showDetails.id).duration
                  }{" "}
                  phút
                </span>
              </div>
            </div>
            {(() => {
              const service = messages
                .flatMap((msg) => msg.services || [])
                .find((s) => s.id === showDetails.id);
              const { steps } = parseSteps(service);
              if (steps.length === 0) {
                return (
                  <div className="flex flex-col items-center text-center">
                    <p className="text-lg text-gray-100 italic">
                      Không có bước chi tiết nào cho dịch vụ này.
                    </p>
                  </div>
                );
              } else if (steps.length === 1) {
                const step = steps[0];
                return (
                  <div className="flex flex-col items-center">
                    <img
                      src={step.image}
                      alt={step.name}
                      className="w-[70%] max-h-[300px] object-cover rounded-2xl border-2 border-cyan-300 shadow-md mx-auto mb-6 transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        console.error(
                          "Modal step image load error:",
                          step.image
                        );
                        toast.error("Không thể tải hình ảnh dịch vụ.");
                        e.target.src = "/api/placeholder/300/200";
                      }}
                    />
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-cyan-300 mb-3">
                        Bước 1: {step.name}
                      </h3>
                      <p className="text-lg text-gray-100 italic">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              } else if (displayMode === "slider") {
                return (
                  <div className="flex flex-col items-center">
                    <div className="w-[70%] max-h-[350px]">
                      <Slider {...sliderSettings}>
                        {steps.map((step, index) => (
                          <div key={index}>
                            <img
                              src={step.image}
                              alt={step.name}
                              className="w-full max-h-[300px] object-cover rounded-2xl border-2 border-cyan-300 shadow-md transition-transform duration-300 hover:scale-105"
                              onError={(e) => {
                                console.error(
                                  "Slider step image load error:",
                                  step.image
                                );
                                toast.error("Không thể tải hình ảnh dịch vụ.");
                                e.target.src = "/api/placeholder/300/200";
                              }}
                            />
                          </div>
                        ))}
                      </Slider>
                    </div>
                    <div className="mt-8 text-center">
                      <h3 className="text-2xl font-bold text-cyan-300 mb-3">
                        Bước {showDetails.activeIndex + 1}:{" "}
                        {steps[showDetails.activeIndex].name}
                      </h3>
                      <p className="text-lg text-gray-100 italic">
                        {steps[showDetails.activeIndex].description}
                      </p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div>
                    {steps.map((step, index) => (
                      <div key={index} className="mb-8 flex flex-col">
                        <div className="flex flex-row items-start">
                          <img
                            src={step.image}
                            alt={step.name}
                            className="w-48 h-48 object-cover rounded-lg border-2 border-cyan-300 shadow-md mr-6 transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              console.error(
                                "Step-by-step image load error:",
                                step.image
                              );
                              toast.error("Không thể tải hình ảnh dịch vụ.");
                              e.target.src = "/api/placeholder/100/100";
                            }}
                          />
                          <div className="flex flex-col">
                            <h3 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-500 text-transparent bg-clip-text mb-2">
                              Bước {index + 1}: {step.name}
                            </h3>
                            <p className="text-base text-gray-100 italic mt-2">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between mt-4">
                          {index > 0 && (
                            <button
                              className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg font-semibold transition-all duration-300"
                              onClick={() =>
                                handleStepNavigation(index, "prev")
                              }
                            >
                              Trước
                            </button>
                          )}
                          <div className="flex-1"></div>
                          {index < steps.length - 1 && (
                            <button
                              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-white hover:from-cyan-600 hover:to-pink-600 rounded-lg font-semibold transition-all duration-300"
                              onClick={() =>
                                handleStepNavigation(index, "next")
                              }
                            >
                              Tiếp
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
            })()}
            <button
              className="mt-8 w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                const service = messages
                  .flatMap((msg) => msg.services || [])
                  .find((s) => s.id === showDetails.id);
                selectServiceAndRedirect(service, selectedSalonId);
              }}
            >
              Đặt Lịch
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          .relative {
            position: relative;
          }
          @keyframes ripple {
            to {
              transform: translate(-50%, -50%) scale(3);
              opacity: 0;
            }
          }
          .group:hover img {
            transform: scale(1.1);
          }
          .slick-slide img {
            margin: auto;
            object-fit: cover;
            border-radius: 1rem;
          }

          /* Input styles */
          .input-wrapper {
            position: relative;
            background: #ffffff;
            border-radius: 12px;
            padding: 12px 48px 12px 16px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            width: 100%;
          }

          .input-wrapper:focus-within {
            border-color: #ff69b4;
            box-shadow: 0 4px 16px rgba(255, 105, 180, 0.2);
          }

          .typing-input {
            width: 100%;
            background: transparent;
            border: none;
            outline: none;
            font-size: 16px;
            color: #1f2937;
            padding: 8px 0;
            font-family: 'Arial', sans-serif;
          }

          .typing-input::placeholder {
            color: #94a3b8;
            font-style: italic;
          }
        `}
      </style>
    </div>
  );
};

export default Chatbot;
