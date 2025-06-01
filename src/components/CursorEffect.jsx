import React, { useEffect, useRef, useState } from "react";

const CursorEffect = () => {
  const canvasRef = useRef(null);
  const [effectMode, setEffectMode] = useState(0); // 0: sparkle, 1: fire, 2: galaxy
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let trails = [];
    let mouseX = 0;
    let mouseY = 0;
    let lastX = 0;
    let lastY = 0;

    // Color schemes for each effect
    const sparkleColors = [
      "#F472B6",
      "#60A5FA",
      "#FBBF24",
      "#A78BFA",
      "#10B981",
      "#F59E0B",
    ];
    const fireColors = ["#FF6B6B", "#FF8E53", "#FF4757", "#FFA726", "#FF5722"];
    const galaxyColors = [
      "#667EEA",
      "#764BA2",
      "#F093FB",
      "#F5576C",
      "#4FACFE",
      "#00F2FE",
    ];

    class Particle {
      constructor(x, y, mode) {
        this.x = x;
        this.y = y;
        this.mode = mode;

        if (mode === 0) {
          // Sparkle Stars
          this.size = Math.random() * 3 + 1;
          this.speedX = (Math.random() - 0.5) * 3;
          this.speedY = (Math.random() - 0.5) * 3;
          this.color =
            sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
          this.life = 1;
          this.decay = Math.random() * 0.02 + 0.005;
          this.rotation = Math.random() * Math.PI * 2;
          this.rotationSpeed = (Math.random() - 0.5) * 0.3;
          this.gravity = 0.1;
        } else if (mode === 1) {
          // Fire Particles
          this.size = Math.random() * 4 + 2;
          this.speedX = (Math.random() - 0.5) * 2;
          this.speedY = Math.random() * -3 - 1;
          this.color =
            fireColors[Math.floor(Math.random() * fireColors.length)];
          this.life = 1;
          this.decay = Math.random() * 0.02 + 0.01;
          this.flicker = Math.random();
        } else if (mode === 2) {
          // Galaxy Spiral
          this.angle = Math.random() * Math.PI * 2;
          this.radius = Math.random() * 40 + 15;
          this.centerX = x;
          this.centerY = y;
          this.speed = Math.random() * 0.08 + 0.02;
          this.size = Math.random() * 2.5 + 0.5;
          this.color =
            galaxyColors[Math.floor(Math.random() * galaxyColors.length)];
          this.life = 1;
          this.decay = Math.random() * 0.01 + 0.005;
          this.spiralSpeed = Math.random() * 0.02 + 0.01;
        }
      }

      update() {
        if (this.mode === 0) {
          // Sparkle Stars
          this.x += this.speedX;
          this.y += this.speedY;
          this.speedY += this.gravity;
          this.speedX *= 0.99;
          this.speedY *= 0.99;
          this.rotation += this.rotationSpeed;
          this.life -= this.decay;
          this.size *= 0.99;
        } else if (this.mode === 1) {
          // Fire Particles
          this.x += this.speedX;
          this.y += this.speedY;
          this.speedX *= 0.98;
          this.speedY *= 0.95;
          this.life -= this.decay;
          this.size *= 0.97;
          this.flicker += 0.3;
        } else if (this.mode === 2) {
          // Galaxy Spiral
          this.angle += this.speed;
          this.radius -= this.spiralSpeed;
          this.x = this.centerX + Math.cos(this.angle) * this.radius;
          this.y = this.centerY + Math.sin(this.angle) * this.radius;
          this.life -= this.decay;
          if (this.radius <= 0) this.life = 0;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.life;

        if (this.mode === 0) {
          // Sparkle Stars
          ctx.translate(this.x, this.y);
          ctx.rotate(this.rotation);

          // Create gradient for sparkle effect
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
          gradient.addColorStop(0, this.color);
          gradient.addColorStop(0.5, this.color + "AA");
          gradient.addColorStop(1, this.color + "00");

          // Draw star shape
          ctx.fillStyle = gradient;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x1 = Math.cos(angle) * this.size;
            const y1 = Math.sin(angle) * this.size;
            const x2 = Math.cos(angle + Math.PI / 6) * (this.size * 0.5);
            const y2 = Math.sin(angle + Math.PI / 6) * (this.size * 0.5);

            if (i === 0) {
              ctx.moveTo(x1, y1);
            } else {
              ctx.lineTo(x1, y1);
            }
            ctx.lineTo(x2, y2);
          }
          ctx.closePath();
          ctx.fill();
        } else if (this.mode === 1) {
          // Fire Particles
          // Flickering fire effect
          const flickerAlpha = (Math.sin(this.flicker) + 1) / 2;
          ctx.globalAlpha = this.life * (0.7 + flickerAlpha * 0.3);

          const gradient = ctx.createRadialGradient(
            this.x,
            this.y,
            0,
            this.x,
            this.y,
            this.size
          );
          gradient.addColorStop(0, this.color);
          gradient.addColorStop(0.4, this.color + "CC");
          gradient.addColorStop(1, this.color + "00");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.mode === 2) {
          // Galaxy Spiral
          const gradient = ctx.createRadialGradient(
            this.x,
            this.y,
            0,
            this.x,
            this.y,
            this.size
          );
          gradient.addColorStop(0, this.color);
          gradient.addColorStop(0.6, this.color + "80");
          gradient.addColorStop(1, this.color + "00");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();

          // Add connecting lines for galaxy effect
          if (particles.length > 1) {
            ctx.globalAlpha = this.life * 0.1;
            ctx.strokeStyle = this.color + "40";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
          }
        }

        ctx.restore();
      }
    }

    class Trail {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 1;
        this.size = Math.random() * 4 + 2;
        this.color =
          sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
      }

      update() {
        this.life -= 0.08;
        this.size *= 0.95;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.life * 0.4;
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.size
        );
        gradient.addColorStop(0, this.color + "AA");
        gradient.addColorStop(1, this.color + "00");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      // Add trail effect
      if (Math.abs(mouseX - lastX) > 3 || Math.abs(mouseY - lastY) > 3) {
        trails.push(new Trail(mouseX, mouseY));
        lastX = mouseX;
        lastY = mouseY;
      }

      // Create particles based on current mode
      const count = isPressed ? 8 : effectMode === 2 ? 1 : 2; // Less particles for galaxy mode
      for (let i = 0; i < count; i++) {
        const offsetX = (Math.random() - 0.5) * (effectMode === 2 ? 5 : 15);
        const offsetY = (Math.random() - 0.5) * (effectMode === 2 ? 5 : 15);
        particles.push(
          new Particle(mouseX + offsetX, mouseY + offsetY, effectMode)
        );
      }
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);

    const handleClick = () => {
      // Cycle through effects: 0 -> 1 -> 2 -> 0
      setEffectMode((prev) => (prev + 1) % 3);
      // Clear existing particles when switching modes
      particles = [];
      trails = [];
    };

    const animate = () => {
      // Use different blend modes for different effects
      if (effectMode === 1) {
        // Fire mode
        ctx.globalCompositeOperation = "screen";
      } else {
        ctx.globalCompositeOperation = "source-over";
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw trails
      trails = trails.filter((trail) => trail.life > 0);
      trails.forEach((trail) => {
        trail.update();
        trail.draw();
      });

      // Update and draw particles
      particles = particles.filter(
        (particle) => particle.life > 0 && particle.size > 0.1
      );
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      trails = [];
    };

    resizeCanvas();
    animate();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("click", handleClick);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [effectMode, isPressed]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ mixBlendMode: effectMode === 1 ? "multiply" : "normal" }}
      />
    </>
  );
};

export default CursorEffect;
