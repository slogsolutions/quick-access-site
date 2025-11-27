import { useMemo } from "react";

const baseSlots = [
  { top: 16, left: 12, variant: "wave" },
  { top: 32, left: 68, variant: "laptop" },
  { top: 58, left: 20, variant: "point" },
  { top: 65, left: 70, variant: "chat" },
];

export function OfficeMascots({ theme = "dark" }) {
  const mascots = useMemo(
    () =>
      baseSlots.map((slot, index) => ({
        ...slot,
        id: `${slot.variant}-${index}-${Math.random().toString(36).slice(2, 5)}`,
        offsetX: (Math.random() - 0.5) * 8,
        offsetY: (Math.random() - 0.5) * 6,
        delay: `${index * 1.8}s`,
      })),
    []
  );

  const palette = theme === "light"
    ? {
        skin: "#0f172a",
        suit: "#1d4ed8",
        accent: "#0ea5e9",
      }
    : {
        skin: "#f8fafc",
        suit: "#38bdf8",
        accent: "#c084fc",
      };

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {mascots.map((mascot) => (
        <div
          key={mascot.id}
          className={`mascot mascot-${mascot.variant}`}
          style={{
            top: `calc(${mascot.top}% + ${mascot.offsetY}px)`,
            left: `calc(${mascot.left}% + ${mascot.offsetX}px)`,
            animationDelay: mascot.delay,
          }}
        >
          <div className="mascot-sparkle" />
          <div className="mascot-body" style={{ background: palette.suit }}>
            <div className="mascot-tie" style={{ background: palette.accent }} />
          </div>
          <div className="mascot-head" style={{ background: palette.skin }} />
          <div className="mascot-arm mascot-arm-left" style={{ background: palette.skin }} />
          <div
            className={`mascot-arm mascot-arm-right ${mascot.variant === "wave" ? "mascot-wave" : ""}`}
            style={{ background: palette.skin }}
          />
          {mascot.variant === "laptop" && <div className="mascot-prop laptop" />}
          {mascot.variant === "point" && <div className="mascot-prop pointer" />}
          {mascot.variant === "chat" && (
            <div className="mascot-prop bubble">
              <span>Sync?</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

