import React, { useEffect, useState, useRef } from "react";
import { Mail, Phone } from "lucide-react";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";

const FooterAdmin = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const numberRefs = useRef([]);
  const timeRef = useRef(null);
  const phoneIconRef = useRef(null);
  const mailIconRef = useRef(null);
  const bearRef = useRef(null);
  const planeRef = useRef(null);
  const systemHeaderRef = useRef(null);
  const contactRef = useRef(null);
  const modalRef = useRef(null);
  const hourHandRef = useRef(null);
  const minuteHandRef = useRef(null);
  const secondHandRef = useRef(null);

  useEffect(() => {
    // Initialize AOS
    AOS.init({ duration: 1000, easing: "ease-out", once: true });

    // Update time
    const updateTime = () => {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, "0");
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const year = now.getFullYear();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      const formattedTime = `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
      setCurrentTime(formattedTime);

      // Update clock hands
      if (
        hourHandRef.current &&
        minuteHandRef.current &&
        secondHandRef.current
      ) {
        const h = now.getHours() % 12;
        const m = now.getMinutes();
        const s = now.getSeconds();
        gsap.set(hourHandRef.current, { rotation: h * 30 + m / 2 });
        gsap.set(minuteHandRef.current, { rotation: m * 6 });
        gsap.to(secondHandRef.current, {
          rotation: s * 6,
          duration: 1,
          ease: "linear",
        });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // RGB color animation for numbers
    numberRefs.current.forEach((el) => {
      if (el) {
        gsap.to(el, {
          color: "#7C3AED",
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          onRepeat: () => {
            const colors = ["#7C3AED", "#EC4899", "#3B82F6"];
            const currentColor = gsap.getProperty(el, "color");
            const nextColor =
              colors[(colors.indexOf(currentColor) + 1) % colors.length];
            gsap.set(el, {
              color: nextColor,
              textShadow: `0 0 8px ${nextColor}`,
            });
          },
        });
      }
    });

    // RGB color animation for time
    if (timeRef.current) {
      gsap.to(timeRef.current, {
        color: "#FBBF24",
        fontFamily: "monospace",
        fontWeight: "bold",
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        onRepeat: () => {
          const colors = ["#FBBF24", "#34D399", "#60A5FA"]; // Warm yellow, green, and blue
          const currentColor = gsap.getProperty(timeRef.current, "color");
          const nextColor =
            colors[(colors.indexOf(currentColor) + 1) % colors.length];
          gsap.set(timeRef.current, {
            color: nextColor,
            textShadow: `0 0 12px ${nextColor}`,
          });
        },
      });
    }

    // Bear GIF entrance
    gsap.fromTo(
      bearRef.current,
      { y: 50 },
      { y: 0, duration: 1, ease: "bounce.out", delay: 0.5 }
    );

    // Plane GIF entrance
    gsap.fromTo(
      planeRef.current,
      { y: 50 },
      { y: 0, duration: 1, ease: "bounce.out", delay: 0.9 }
    );

    // Text entrance animations
    gsap.fromTo(
      systemHeaderRef.current,
      { y: 20 },
      { y: 0, duration: 0.8, ease: "power2.out", delay: 0.3 }
    );
    gsap.fromTo(
      contactRef.current,
      { y: 20 },
      { y: 0, duration: 0.8, ease: "power2.out", delay: 0.4 }
    );

    // Modal animation
    if (isModalOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8 },
        { scale: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    }

    // Icon hover animations
    const animateIcon = (ref, scale, rotate) => {
      gsap.to(ref.current, {
        scale,
        rotate,
        duration: 0.3,
        ease: "power2.out",
      });
    };
    const resetIcon = (ref) => {
      gsap.to(ref.current, {
        scale: 1,
        rotate: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const phoneEl = phoneIconRef.current;
    const mailEl = mailIconRef.current;

    phoneEl?.addEventListener("mouseenter", () =>
      animateIcon(phoneIconRef, 1.2, 10)
    );
    phoneEl?.addEventListener("mouseleave", () => resetIcon(phoneIconRef));
    mailEl?.addEventListener("mouseenter", () =>
      animateIcon(mailIconRef, 1.2, -10)
    );
    mailEl?.addEventListener("mouseleave", () => resetIcon(mailIconRef));

    return () => {
      phoneEl?.removeEventListener("mouseenter", () =>
        animateIcon(phoneIconRef, 1.2, 10)
      );
      phoneEl?.removeEventListener("mouseleave", () => resetIcon(phoneIconRef));
      mailEl?.removeEventListener("mouseenter", () =>
        animateIcon(mailIconRef, 1.2, -10)
      );
      mailEl?.removeEventListener("mouseleave", () => resetIcon(mailIconRef));
    };
  }, [isModalOpen]);

  // Split text to apply RGB effect to numbers only
  const formatWithNumbers = (text) => {
    return text.split(/(\d+)/).map((part, index) =>
      /\d+/.test(part) ? (
        <span
          key={index}
          ref={(el) => (numberRefs.current[index] = el)}
          className="rgb-number"
          data-number
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <footer className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-indigo-100 px-6 py-8 mt-auto border-t border-purple-500">
      <style>{`
        .rgb-number, .rgb-time {
          transition: color 0.5s ease, text-shadow 0.5s ease;
        }
        .animated-icon {
          transition: transform 0.3s ease;
        }
        .animated-icon:hover {
          animation: pulse 0.5s infinite alternate;
        }
        .hover-text:hover {
          text-decoration: underline;
          color: #F472B6;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .footer-bg {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 10px 10px;
        }
        .clock {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #4B0082, #1E1E2F);
          border-radius: 50%;
          position: relative;
          border: 4px solid #EC4899;
          box-shadow: 0 0 20px rgba(236, 72, 153, 0.5);
        }
        .clock-hand {
          position: absolute;
          bottom: 50%;
          left: 50%;
          transform-origin: bottom;
          background: #F472B6;
        }
        .hour-hand {
          width: 4px;
          height: 60px;
          border-radius: 2px;
        }
        .minute-hand {
          width: 3px;
          height: 80px;
          border-radius: 1.5px;
        }
        .second-hand {
          width: 2px;
          height: 90px;
          background: #3B82F6;
          border-radius: 1px;
        }
        .clock-center {
          width: 10px;
          height: 10px;
          background: #EC4899;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .clock-marker {
          position: absolute;
          color: #FDBA74;
          font-size: 14px;
          font-weight: 600;
          text-shadow: 0 0 4px rgba(236, 72, 153, 0.7);
          transform: translate(-50%, -50%);
        }
        .marker-12 { top: 10px; left: 50%; }
        .marker-1 { top: 22px; left: 75%; }
        .marker-2 { top: 47px; left: 88%; }
        .marker-3 { top: 80px; left: 95%; }
        .marker-4 { top: 113px; left: 88%; }
        .marker-5 { top: 138px; left: 75%; }
        .marker-6 { top: 150px; left: 50%; }
        .marker-7 { top: 138px; left: 25%; }
        .marker-8 { top: 113px; left: 12%; }
        .marker-9 { top: 80px; left: 5%; }
        .marker-10 { top: 47px; left: 12%; }
        .marker-11 { top: 22px; left: 25%; }
      `}</style>
      <div className="container mx-auto max-w-7xl relative footer-bg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* System Info with Bear GIF */}
          <div
            className="flex items-center gap-4"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <img
              ref={bearRef}
              src="https://toigingiuvedep.vn/wp-content/uploads/2022/04/hinh-anh-dong-de-thuong-chu-gau-xanh-nam-luoi.gif"
              alt="Cute Bear"
              className="h-12 w-12 md:h-16 md:w-16 rounded-full shadow-sm border-2 border-purple-400 hover:ring-2 hover:ring-purple-500 transition-all"
            />
            <div className="text-sm">
              <h3
                ref={systemHeaderRef}
                className="font-semibold text-orange-300 text-lg hover-text transition-all"
              >
                Beauty Salon - Admin Dashboard
              </h3>
              <p className="text-indigo-200 hover-text transition-all">
                Hệ thống quản trị salon
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div
            ref={contactRef}
            className="flex flex-col md:flex-row items-center gap-4 text-sm"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="flex items-center gap-2">
              <img
                src="http://hrsoftbd.com/assets/servicePhoto/imageprocessingmlead_20221108144006.gif"
                alt="Cute Animation"
                className="h-10 w-10 rounded-full shadow-sm border-2 border-purple-400 hover:ring-2 hover:ring-purple-500 transition-all"
              />
              <Phone
                ref={phoneIconRef}
                size={18}
                className="text-orange-300 animated-icon"
              />
              <span className="hover-text transition-all">
                {formatWithNumbers("0379263053")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <img
                ref={planeRef}
                src="https://media.tenor.com/mL7suP22MNwAAAAd/plane-flying.gif"
                alt="Flying Plane"
                className="h-10 w-10 rounded-full shadow-sm border-2 border-purple-400 hover:ring-2 hover:ring-purple-500 transition-all"
              />
              <Mail
                ref={mailIconRef}
                size={18}
                className="text-orange-300 animated-icon"
              />
              <span className="hover-text transition-all">
                {formatWithNumbers("admin@beautysalon.com")}
              </span>
            </div>
          </div>
        </div>

        {/* Current Time */}
        <div className="flex justify-center mt-8">
          <div
            className="text-center text-4xl md:text-5xl text-orange-200 font-medium relative z-30 cursor-pointer font-serif"
            data-aos="zoom-in"
            data-aos-delay="300"
            onClick={toggleModal}
          >
            Thời gian hiện tại:{" "}
            <span ref={timeRef} className="rgb-time">
              {currentTime}
            </span>
          </div>
        </div>

        <div className="mt-6 border-t border-purple-400 pt-4 text-xs text-center text-indigo-200 hover-text transition-all"></div>

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black flex items-center justify-center z-50"
            onClick={toggleModal}
          >
            <div
              ref={modalRef}
              className="bg-gradient-to-r from-indigo-900 to-purple-900 p-6 rounded-lg shadow-xl max-w-sm w-full"
              data-aos="zoom-in"
              data-aos-duration="800"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl text-orange-200 font-semibold mb-4 text-center">
                Đồng Hồ
              </h2>
              <div className="clock mx-auto">
                <div className="clock-hand hour-hand" ref={hourHandRef}></div>
                <div
                  className="clock-hand minute-hand"
                  ref={minuteHandRef}
                ></div>
                <div
                  className="clock-hand second-hand"
                  ref={secondHandRef}
                ></div>
                <div className="clock-center"></div>
                <div className="clock-marker marker-12">12</div>
                <div className="clock-marker marker-1">1</div>
                <div className="clock-marker marker-2">2</div>
                <div className="clock-marker marker-3">3</div>
                <div className="clock-marker marker-4">4</div>
                <div className="clock-marker marker-5">5</div>
                <div className="clock-marker marker-6">6</div>
                <div className="clock-marker marker-7">7</div>
                <div className="clock-marker marker-8">8</div>
                <div className="clock-marker marker-9">9</div>
                <div className="clock-marker marker-10">10</div>
                <div className="clock-marker marker-11">11</div>
              </div>
              <button
                className="mt-6 w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition-all"
                onClick={toggleModal}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default FooterAdmin;
