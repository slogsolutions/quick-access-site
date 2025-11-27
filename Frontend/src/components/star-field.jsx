import { useEffect, useRef } from "react";

export function StarField({
  density = 120,
  className = "",
  enableShootingStars = false,
  theme = "dark",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars = Array.from({ length: density }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 1.5 + 0.2,
      speed: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.4 + 0.2,
    }));

    const shootingStars = Array.from({ length: enableShootingStars ? 5 : 0 }, () => ({
      x: Math.random(),
      y: Math.random(),
      length: Math.random() * 0.2 + 0.1,
      speed: Math.random() * 0.015 + 0.01,
      amplitude: Math.random() * 0.2,
      opacity: Math.random() * 0.4 + 0.4,
    }));

    const resetShootingStar = (star) => {
      star.x = Math.random();
      star.y = Math.random() * 0.5;
      star.length = Math.random() * 0.15 + 0.07;
      star.speed = Math.random() * 0.02 + 0.01;
      star.opacity = Math.random() * 0.4 + 0.4;
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = Math.max(window.innerHeight, document.body.scrollHeight);
    };

    resize();
    window.addEventListener("resize", resize);

    let animationId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.y += star.speed / canvas.height;
        if (star.y > 1) {
          star.y = 0;
          star.x = Math.random();
        }

        const gradient = ctx.createRadialGradient(
          star.x * canvas.width,
          star.y * canvas.height,
          0,
          star.x * canvas.width,
          star.y * canvas.height,
          star.radius * 4
        );
        const starColor =
          theme === "light"
            ? `rgba(15, 23, 42, ${Math.min(star.opacity + 0.3, 0.8)})`
            : `rgba(255, 255, 255, ${star.opacity})`;
        gradient.addColorStop(0, starColor);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
          star.x * canvas.width,
          star.y * canvas.height,
          star.radius,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      if (enableShootingStars) {
        ctx.save();
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        shootingStars.forEach((shootStar) => {
          const startX = shootStar.x * canvas.width;
          const startY = shootStar.y * canvas.height;
          const endX = startX - shootStar.length * canvas.width;
          const endY = startY + shootStar.length * canvas.height;

          const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
          gradient.addColorStop(0, `rgba(255,255,255,${shootStar.opacity})`);
          gradient.addColorStop(1, "rgba(255,255,255,0)");

          ctx.strokeStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          shootStar.x += shootStar.speed;
          shootStar.y -= shootStar.speed * 0.6;
          if (shootStar.x > 1.2 || shootStar.y < -0.2) {
            resetShootingStar(shootStar);
          }
        });
        ctx.restore();
      }

      ctx.restore();
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [density, enableShootingStars, theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 opacity-80 mix-blend-screen ${className}`}
    />
  );
}

