import { useEffect, useMemo, useState } from "react";
import { StarField } from "./star-field";
import { AuroraCanvas } from "./aurora-canvas";
// import { OfficeMascots } from "./office-mascots";

const bubblePositions = [
  { left: "10%", size: 200, delay: "0s", duration: "20s" },
  { left: "50%", size: 260, delay: "4s", duration: "24s" },
  { left: "80%", size: 180, delay: "2s", duration: "18s" },
  { left: "30%", size: 220, delay: "6s", duration: "26s" },
];

const lightPalettes = [
  ["#e0f2ff", "#d0e4ff", "#f6fbff"],
  ["#fdf4ff", "#e0f2ff", "#fef9c3"],
  ["#dbeafe", "#ede9fe", "#fef3c7"],
  ["#e7f1ff", "#fff1eb", "#e3fcec"],
];

const darkPalettes = [
  ["#050810", "#0a0f1f", "#111827"],
  ["#050505", "#0a0614", "#141422"],
  ["#050608", "#0f172a", "#0a0f1a"],
  ["#06030d", "#120f24", "#050a11"],
];

const professionalQuotes = [
  "“Craft clarity. Automate energy.”",
  "“Every shortcut deserves a story.”",
  "“People ship faster when context is vivid.”",
  "“Design your daily launchpad like a flagship store.”",
];

const mapWeatherCode = (code) => {
  if (code === undefined || code === null) return "sunny";
  if ([0, 1].includes(code)) return "sunny";
  if ([2, 3].includes(code)) return "cloudy";
  if ([45, 48].includes(code)) return "fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "drizzle";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "storm";
  return "cloudy";
};

export function AuroraBackground({ theme, mode = "aurora" }) {
  const isLight = theme === "light";
  const palettes = isLight ? lightPalettes : darkPalettes;
  const bubbleTone = isLight ? "bubble-light" : "bubble-dark";
  const [gradientIndex, setGradientIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [weather, setWeather] = useState({ condition: "sunny", temperature: null, fetched: false });

  useEffect(() => {
    setGradientIndex(0);
    const gradientInterval = setInterval(() => {
      setGradientIndex((prev) => (prev + 1) % palettes.length);
    }, 12000);
    return () => clearInterval(gradientInterval);
  }, [palettes.length, theme]);

  useEffect(() => {
    if (mode !== "quotes") return undefined;
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % professionalQuotes.length);
    }, 6000);
    return () => clearInterval(quoteInterval);
  }, [mode]);

  useEffect(() => {
    if (mode !== "weather") return undefined;
    let cancelled = false;

    const fallback = () => {
      if (!cancelled) {
        const options = ["sunny", "cloudy", "rain", "snow", "fog"];
        setWeather({
          condition: options[Math.floor(Math.random() * options.length)],
          temperature: null,
          fetched: false,
        });
      }
    };

    navigator.geolocation?.getCurrentPosition(
      async ({ coords }) => {
        if (cancelled) return;
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true`;
          const response = await fetch(url);
          const data = await response.json();
          const code = data.current_weather?.weathercode;
          const temperature = data.current_weather?.temperature;
          setWeather({
            condition: mapWeatherCode(code),
            temperature,
            fetched: true,
          });
        } catch (error) {
          console.error("Weather fetch failed", error);
          fallback();
        }
      },
      () => fallback(),
      { timeout: 4000 }
    );

    return () => {
      cancelled = true;
    };
  }, [mode]);

  const gradientStyle = useMemo(() => {
    const palette = palettes[gradientIndex % palettes.length];
    const [c1, c2, c3] = palette;
    return {
      backgroundImage: `linear-gradient(140deg, ${c1} 0%, ${c2} 45%, ${c3} 100%)`,
      opacity: isLight ? 0.9 : 0.85,
    };
  }, [gradientIndex, palettes, isLight]);

  const bubbles = useMemo(
    () =>
      bubblePositions.map((bubble, index) => (
        <div
          key={index}
          className={`bubble ${bubbleTone}`}
          style={{
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
            animationDelay: bubble.delay,
            animationDuration: bubble.duration,
          }}
        />
      )),
    [bubbleTone]
  );

  const showBubbles = mode === "aurora" || mode === "weather";
  const showQuotes = mode === "quotes" && isLight;
  const showWeather = mode === "weather";

  const renderWeather = () => {
    const condition = weather.condition;
    switch (condition) {
      case "rain":
      case "drizzle":
        return (
          <>
            <div className="weather-overlay weather-cloud" />
            <div className="weather-overlay weather-rain" />
          </>
        );
      case "snow":
        return (
          <>
            <div className="weather-overlay weather-cloud" />
            <div className="weather-overlay weather-snow" />
          </>
        );
      case "fog":
        return <div className="weather-overlay weather-fog" />;
      case "storm":
        return (
          <>
            <div className="weather-overlay weather-cloud storm" />
            <div className="weather-overlay weather-rain thunder" />
          </>
        );
      case "cloudy":
        return <div className="weather-overlay weather-cloud large" />;
      case "sunny":
      default:
        return (
          <>
            <div className="weather-overlay weather-sun" />
            <div className="weather-overlay weather-cloud soft" />
          </>
        );
    }
  };

  return (
    <>
      <StarField
        density={mode === "meteors" ? 200 : isLight ? 140 : 170}
        enableShootingStars={mode === "meteors"}
        theme={theme === "light" ? "light" : "dark"}
        className={isLight ? "opacity-80 mix-blend-multiply" : ""}
      />
      <div className="gradient-overlay" style={gradientStyle} />
      {mode === "aurora" && <AuroraCanvas theme={theme} />}
      {showBubbles && (
        <>
          <div className="polar-beam polar-beam-left" />
          <div className="polar-beam polar-beam-right" />
          {bubbles}
        </>
      )}
      {mode === "meteors" && (
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)] mix-blend-screen" />
          <div className="shooting-star shooting-star-1" />
          <div className="shooting-star shooting-star-2" />
          <div className="shooting-star shooting-star-3" />
        </div>
      )}
      {showQuotes &&
        professionalQuotes.map((quote, idx) => (
          <div
            key={quote}
            className="floating-quote"
            style={{
              top: `${15 + (idx % 3) * 20}%`,
              left: `${20 + (idx * 15) % 50}%`,
              animationDelay: `${idx * 6}s`,
              color: isLight ? "rgba(15,23,42,0.35)" : "rgba(255,255,255,0.3)",
              fontSize: idx === quoteIndex ? "1.3rem" : "1rem",
            }}
          >
            {quote}
          </div>
        ))}
      {showWeather && <div className="pointer-events-none absolute inset-0 z-10">{renderWeather()}</div>}
      {/* {mode === "mascots" 
      <OfficeMascots theme={theme} />
      } */}
    </>
  );
}
