import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const PremiumSalonLoadingScreen = ({ salonName = "Beauty Salon" }) => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const runnerRef = useRef(null);
  const progressTrackRef = useRef(null);
  const progressFillRef = useRef(null);
  const percentRef = useRef(null);
  const particlesRef = useRef(null);
  const glowRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tl = gsap.timeline();

    // Initial setup
    gsap.set(
      [
        titleRef.current,
        subtitleRef.current,
        runnerRef.current,
        progressTrackRef.current,
      ],
      {
        opacity: 0,
        y: 50,
      }
    );

    // Container fade in
    tl.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power2.out" }
    );

    // Title animation with stagger effect
    const titleLetters = titleRef.current.querySelectorAll(".letter");
    tl.fromTo(
      titleLetters,
      { y: 100, opacity: 0, rotationX: 90 },
      {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
      },
      "-=0.3"
    );

    // Subtitle fade in
    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    );

    // Progress track appear
    tl.fromTo(
      progressTrackRef.current,
      { opacity: 0, scaleX: 0 },
      { opacity: 1, scaleX: 1, duration: 0.8, ease: "power3.out" },
      "-=0.2"
    );

    // Runner appear
    tl.fromTo(
      runnerRef.current,
      { opacity: 0, x: -50, scale: 0.5 },
      { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
      "-=0.4"
    );

    // Progress animation
    const progressTl = gsap.timeline({ delay: 1 });
    progressTl.to(
      {},
      {
        duration: 4,
        ease: "power2.inOut",
        onUpdate: function () {
          const currentProgress = Math.round(this.progress() * 100);
          setProgress(currentProgress);

          // Update progress bar
          gsap.set(progressFillRef.current, {
            width: `${currentProgress}%`,
          });

          // Move runner
          gsap.set(runnerRef.current, {
            x: `${currentProgress * 4}px`,
          });

          // Update percentage
          if (percentRef.current) {
            percentRef.current.textContent = `${currentProgress}%`;
          }
        },
      }
    );

    // Floating animation for runner
    gsap.to(runnerRef.current, {
      y: -5,
      duration: 0.6,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });

    // Glow effect
    gsap.to(glowRef.current, {
      scale: 1.2,
      opacity: 0.3,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });

    // Particle animation
    const particles = particlesRef.current.children;
    gsap.to(particles, {
      y: -100,
      opacity: 0,
      duration: 3,
      stagger: 0.2,
      repeat: -1,
      ease: "power2.out",
    });

    return () => {
      tl.kill();
      progressTl.kill();
    };
  }, []);

  const createParticles = () => {
    return Array.from({ length: 20 }, (_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 rounded-full"
        style={{
          background: `rgb(${Math.random() * 100 + 155}, ${
            Math.random() * 100 + 155
          }, ${Math.random() * 100 + 155})`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
        }}
      />
    ));
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 20% 20%, rgb(120, 119, 198) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgb(255, 119, 198) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgb(120, 219, 255) 0%, transparent 50%),
          linear-gradient(135deg, rgb(15, 23, 42) 0%, rgb(30, 41, 59) 100%)
        `,
      }}
    >
      {/* Background particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {createParticles()}
      </div>

      {/* Glow effect */}
      <div
        ref={glowRef}
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgb(147, 197, 253) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Title */}
        <div ref={titleRef} className="mb-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-wider">
            {salonName.split("").map((letter, index) => (
              <span
                key={index}
                className="letter inline-block mx-1"
                style={{
                  background:
                    "linear-gradient(45deg, rgb(147, 197, 253), rgb(196, 181, 253), rgb(251, 207, 232))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "0 0 30px rgba(147, 197, 253, 0.5)",
                }}
              >
                {letter}
              </span>
            ))}
            <span
              className="ml-4"
              style={{
                background:
                  "linear-gradient(45deg, rgb(251, 191, 36), rgb(245, 158, 11))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              SALON
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div ref={subtitleRef} className="mb-12">
          <p
            className="text-xl md:text-2xl font-light tracking-wide"
            style={{ color: "rgb(203, 213, 225)" }}
          >
            Đẳng cấp làm đẹp của bạn
          </p>
          <div
            className="w-32 h-1 mx-auto mt-4 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, rgb(147, 197, 253), rgb(196, 181, 253))",
            }}
          />
        </div>

        {/* Progress section */}
        <div className="w-full max-w-md mx-auto">
          {/* Runner character */}
          <div className="relative mb-8 h-20">
            <div
              ref={runnerRef}
              className="absolute left-0 w-16 h-16 transition-all duration-300"
            >
              <img
                src="https://cdn.dribbble.com/userupload/32768031/file/original-a4e52e6c66a839f7967c349df387620c.gif"
                alt="Running character"
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            </div>
          </div>

          {/* Progress track */}
          <div
            ref={progressTrackRef}
            className="relative w-full h-4 rounded-full overflow-hidden mb-4"
            style={{
              background: "rgba(71, 85, 105, 0.3)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
            }}
          >
            <div
              ref={progressFillRef}
              className="h-full rounded-full transition-all duration-300 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(90deg, rgb(59, 130, 246), rgb(147, 51, 234), rgb(236, 72, 153))",
                width: "0%",
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
              }}
            >
              {/* Shine effect */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  animation: "shine 2s infinite",
                }}
              />
            </div>

            {/* Progress indicators */}
            {[25, 50, 75].map((mark) => (
              <div
                key={mark}
                className="absolute top-0 w-0.5 h-full opacity-30"
                style={{
                  left: `${mark}%`,
                  background: "rgb(148, 163, 184)",
                }}
              />
            ))}
          </div>

          {/* Percentage */}
          <div className="text-center">
            <span
              ref={percentRef}
              className="text-4xl font-bold"
              style={{
                background:
                  "linear-gradient(45deg, rgb(147, 197, 253), rgb(196, 181, 253))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 10px rgba(147, 197, 253, 0.3))",
              }}
            >
              0%
            </span>
          </div>
        </div>

        {/* Loading text */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <span
            className="text-lg font-medium"
            style={{ color: "rgb(148, 163, 184)" }}
          >
            Đang chuẩn bị trải nghiệm tuyệt vời
          </span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  background: "rgb(147, 197, 253)",
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        .animate-bounce {
          animation: bounce 1.4s infinite;
        }
      `}</style>
    </div>
  );
};

export default PremiumSalonLoadingScreen;
