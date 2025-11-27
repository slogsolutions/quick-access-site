import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Switch } from "./ui/switch";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm transition hover:text-foreground"
    >
      <div className="relative flex items-center gap-2">
        <Sun className={`h-4 w-4 transition ${isDark ? "opacity-40" : "opacity-100 text-yellow-500"}`} />
        <Switch
          checked={isDark}
          onCheckedChange={toggleTheme}
          className="data-[state=checked]:bg-primary"
        />
        <Moon className={`h-4 w-4 transition ${isDark ? "opacity-100 text-blue-200" : "opacity-40"}`} />
      </div>
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}

