import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";

const SalonLoadingScreen = ({ serviceImages, salonName }) => {
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const scissorsRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const percentRef = useRef(null);
  const imageRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-out", once: true });

    const tl = gsap.timeline();

    tl.from(logoRef.current, {
      scale: 0,
      rotate: 360,
      duration: 1.5,
      ease: "elastic.out(1, 0.5)",
    });

    const letters = textRef.current.querySelectorAll(".letter");
    tl.from(
      letters,
      {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power4.out",
      },
      "-=1"
    );

    gsap.to(scissorsRef.current, {
      rotate: 15,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });

    tl.fromTo(
      progressBarRef.current,
      { width: "0%" },
      {
        width: "100%",
        duration: 1.5,
        ease: "power3.inOut",
        onUpdate: function () {
          const progress = Math.round(this.progress() * 100);
          if (percentRef.current) {
            percentRef.current.textContent = `${progress}%`;
          }
        },
      }
    );

    if (serviceImages.length > 0) {
      const imageInterval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % serviceImages.length);
      }, 2000);
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.9, y: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          repeat: -1,
          repeatDelay: 1,
        }
      );
      return () => clearInterval(imageInterval);
    }

    return () => {};
  }, [serviceImages]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-black p-8 relative overflow-hidden"
      data-aos="zoom-in"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-40 h-40 rounded-full bg-blue-600 blur-2xl -top-8 -left-8"></div>
        <div className="absolute w-40 h-40 rounded-full bg-purple-600 blur-2xl top-1/3 right-10"></div>
      </div>

      {serviceImages.length > 0 && (
        <img
          ref={imageRef}
          src={serviceImages[currentImageIndex]}
          alt="Service"
          className="w-36 h-36 rounded-xl mb-6 object-cover shadow-lg"
          loading="lazy"
        />
      )}

      <div
        ref={logoRef}
        className="w-48 h-48 mb-8 bg-gradient-to-r from-white to-gray-100 rounded-full flex items-center justify-center shadow-xl"
      >
        <div className="relative">
          <div ref={scissorsRef} className="text-6xl transform origin-center">
            ✂️
          </div>
        </div>
      </div>

      <div ref={textRef} className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-white tracking-tight">
          {salonName
            ? salonName.split("").map((letter, index) => (
                <span key={index} className="letter inline-block">
                  {letter}
                </span>
              ))
            : ["L", "U", "X", "U", "R", "Y"].map((letter, index) => (
                <span key={index} className="letter inline-block">
                  {letter}
                </span>
              ))}
          <span className="text-white ml-3">SALON</span>
        </h1>
        <p className="text-gray-200 italic text-lg mt-2">
          Đẳng cấp làm đẹp của bạn
        </p>
      </div>

      <div className="w-72 h-3 bg-gray-800 rounded-full overflow-hidden mb-4 shadow-inner relative">
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-full relative"
        >
          <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-semibold drop-shadow">
            Chờ một chút
          </span>
        </div>
      </div>

      <div ref={percentRef} className="text-white text-lg font-semibold">
        0%
      </div>

      <div className="mt-8 flex gap-1.5 items-center text-gray-300 text-lg">
        <span>Đang chuẩn bị trải nghiệm tuyệt vời</span>
        <span className="animate-bounce">.</span>
        <span className="animate-bounce delay-100">.</span>
        <span className="animate-bounce delay-200">.</span>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-150%);
          }
          100% {
            transform: translateX(1500%);
          }
        }
        .animate-shine {
          animation: shine 2.5s infinite;
        }
        .delay-100 {
          animation-delay: 150ms;
        }
        .delay-200 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
};

export default SalonLoadingScreen;
