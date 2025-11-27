import { useEffect, useRef } from "react";

export function AuroraCanvas({ theme = "dark" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const beams = Array.from({ length: 8 }).map((_, idx) => ({
      x: Math.random(),
      width: 0.06 + Math.random() * 0.12,
      offset: Math.random() * Math.PI * 2,
      speed: 0.0006 + Math.random() * 0.001,
      colorIndex: idx % auroraPalettes.length,
    }));

    const waves = Array.from({ length: 4 }).map((_, idx) => ({
      amplitude: 0.08 + Math.random() * 0.08,
      frequency: 1.2 + Math.random() * 0.8,
      offset: Math.random() * Math.PI * 2,
      speed: 0.0003 + Math.random() * 0.0005,
      colorIndex: (idx + 1) % auroraPalettes.length,
    }));

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    let animationId;

    function draw(timestamp = 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      beams.forEach((beam) => {
        const palette = auroraPalettes[beam.colorIndex % auroraPalettes.length];
        const gradient = ctx.createLinearGradient(
          beam.x * canvas.width,
          canvas.height,
          beam.x * canvas.width,
          0
        );
        gradient.addColorStop(0, palette[0]);
        gradient.addColorStop(0.5, palette[1]);
        gradient.addColorStop(1, palette[2]);

        const amplitude = 0.25 + Math.sin(timestamp * beam.speed + beam.offset) * 0.25;
        const widthPx = beam.width * canvas.width;

        ctx.beginPath();
        ctx.moveTo((beam.x - beam.width / 2) * canvas.width, canvas.height);
        const controlX = beam.x * canvas.width + Math.sin(timestamp * beam.speed + beam.offset) * widthPx;
        const controlY = canvas.height * (0.35 - amplitude);
        ctx.quadraticCurveTo(controlX, controlY, (beam.x + beam.width / 2) * canvas.width, canvas.height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = theme === "light" ? 0.65 : 0.85;
        ctx.filter = "blur(12px)";
        ctx.fill();
      });

      ctx.globalAlpha = theme === "light" ? 0.35 : 0.55;
      ctx.filter = "blur(18px)";

      waves.forEach((wave) => {
        const palette = auroraPalettes[wave.colorIndex % auroraPalettes.length];
        const gradient = ctx.createLinearGradient(0, canvas.height * 0.6, canvas.width, canvas.height * 0.2);
        gradient.addColorStop(0, palette[0]);
        gradient.addColorStop(0.5, palette[1]);
        gradient.addColorStop(1, palette[2]);

        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.75);
        for (let x = 0; x <= canvas.width; x += 10) {
          const progress = x / canvas.width;
          const y =
            canvas.height * (0.55 - wave.amplitude * Math.sin(progress * Math.PI * wave.frequency + wave.offset + timestamp * wave.speed));
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.filter = "none";

      animationId = requestAnimationFrame(draw);
    }

    animationId = requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 mix-blend-screen opacity-95"
    />
  );
}

const auroraPalettes = [
  ["rgba(59,130,246,0.25)", "rgba(14,165,233,0.55)", "rgba(236,72,153,0.4)"],
  ["rgba(34,197,94,0.3)", "rgba(16,185,129,0.55)", "rgba(59,130,246,0.35)"],
  ["rgba(161,98,255,0.3)", "rgba(45,212,191,0.45)", "rgba(14,165,233,0.35)"],
];

