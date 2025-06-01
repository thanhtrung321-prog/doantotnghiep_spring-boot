import React, { useEffect, useRef } from "react";
import { FaGem, FaStar } from "react-icons/fa";
import { gsap } from "gsap";

const Header = () => {
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const gemRef = useRef(null);
  const starRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Set initial states
    gsap.set([logoRef.current, titleRef.current, subtitleRef.current], {
      opacity: 0,
      y: 20,
    });

    // Logo animation
    tl.to(logoRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "back.out(1.7)",
    })
      // Title animation with stagger
      .to(
        titleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.4"
      )
      // Subtitle animation
      .to(
        subtitleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.3"
      );

    // Continuous animations
    // Gem rotation
    gsap.to(gemRef.current, {
      rotation: 360,
      duration: 8,
      ease: "none",
      repeat: -1,
    });

    // Star pulse and scale
    gsap.to(starRef.current, {
      scale: 1.3,
      opacity: 0.7,
      duration: 1.5,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true,
    });

    // Logo glow effect
    gsap.to(logoRef.current.querySelector(".logo-glow"), {
      boxShadow:
        "0 0 30px rgba(245, 158, 11, 0.8), 0 0 60px rgba(245, 158, 11, 0.4)",
      duration: 2,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true,
    });

    // RGB text animation
    const rgbAnimation = () => {
      const colors = [
        "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)",
        "linear-gradient(45deg, #96ceb4, #ffeaa7, #dda0dd)",
        "linear-gradient(45deg, #74b9ff, #fd79a8, #fdcb6e)",
        "linear-gradient(45deg, #6c5ce7, #a29bfe, #fd79a8)",
        "linear-gradient(45deg, #00b894, #00cec9, #0984e3)",
      ];

      let currentIndex = 0;

      setInterval(() => {
        if (titleRef.current) {
          titleRef.current.style.background = colors[currentIndex];
          titleRef.current.style.webkitBackgroundClip = "text";
          titleRef.current.style.webkitTextFillColor = "transparent";
          titleRef.current.style.backgroundClip = "text";
          currentIndex = (currentIndex + 1) % colors.length;
        }
      }, 2000);
    };

    // Start RGB animation after initial load
    setTimeout(rgbAnimation, 1000);

    // Hover effects
    const handleMouseEnter = () => {
      gsap.to(headerRef.current, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(gemRef.current, {
        scale: 1.2,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(headerRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(gemRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    };

    const headerElement = headerRef.current;
    headerElement.addEventListener("mouseenter", handleMouseEnter);
    headerElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      headerElement.removeEventListener("mouseenter", handleMouseEnter);
      headerElement.removeEventListener("mouseleave", handleMouseLeave);
      tl.kill();
    };
  }, []);

  return (
    <div ref={headerRef} className="flex items-center space-x-3 cursor-pointer">
      {/* Logo Icon */}
      <div ref={logoRef} className="relative">
        <div className="logo-glow bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-3 rounded-full shadow-lg transition-all duration-300">
          <FaGem
            ref={gemRef}
            className="h-6 w-6 text-white filter drop-shadow-lg"
          />
        </div>
        {/* Decorative sparkle */}
        <FaStar
          ref={starRef}
          className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 filter drop-shadow-sm"
        />

        {/* Additional sparkles */}
        <div className="absolute -top-2 -left-1 w-1 h-1 bg-white rounded-full animate-ping"></div>
        <div className="absolute top-1 -right-2 w-1.5 h-1.5 bg-amber-300 rounded-full animate-pulse"></div>
      </div>

      {/* Brand Name */}
      <div className="flex flex-col">
        <h1
          ref={titleRef}
          className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 bg-clip-text text-transparent filter drop-shadow-sm"
          style={{
            fontFamily: "Georgia, serif",
            letterSpacing: "0.5px",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Beauty Salon
        </h1>
        <p
          ref={subtitleRef}
          className="text-xs text-amber-600 font-medium tracking-wide uppercase opacity-80 animate-pulse"
          style={{
            fontFamily: "Helvetica, sans-serif",
            letterSpacing: "2px",
          }}
        >
          ✨ Luxury & Style ✨
        </p>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-0 right-0 w-1 h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-40 animate-ping"></div>
      </div>
    </div>
  );
};

export default Header;
