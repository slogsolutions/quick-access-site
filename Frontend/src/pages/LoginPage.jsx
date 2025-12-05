import { useEffect, useState } from "react";
import api from "@/axios/api";
import { AuroraBackground } from "@/components/aurora-background";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";

const animationModes = ["aurora", "meteors", "weather", "quotes"];

const dedupeBySlug = (list = []) =>
  list.reduce((acc, role) => {
    if (!acc.some((item) => item.slug === role.slug)) {
      acc.push(role);
    }
    return acc;
  }, []);

export default function LoginPage({ setUser }) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [availableRoles, setAvailableRoles] = useState([]);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [animationMode, setAnimationMode] = useState("aurora");

  const backgroundClass = isLight ? "text-slate-900" : "text-white";

  const cycleAnimation = () => {
    setAnimationMode((prev) => {
      const idx = animationModes.indexOf(prev);
      return animationModes[(idx + 1) % animationModes.length];
    });
  };

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/login", formData);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get("/roles");
        const assignable = response.data.filter((role) => role.assignable);
        setAvailableRoles(dedupeBySlug(assignable));
      } catch (error) {
        console.error("Failed to load roles", error);
      }
    };
    fetchRoles();
  }, []);

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-colors duration-700 ${backgroundClass}`}
    >
      <AuroraBackground theme={theme} mode={animationMode} />

      {/* main layout container */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 px-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:py-16">
        {/* Left hero section */}
        <section className="flex-1 w-full space-y-6 text-center lg:text-left">
          <div className="flex justify-center lg:justify-start">
            <Badge
              className={`rounded-full px-4 py-1 text-xs tracking-[0.4em] uppercase ${
                isLight
                  ? "bg-slate-900/10 text-slate-700"
                  : "bg-white/10 text-white"
              }`}
            >
              Slog Solutions
            </Badge>
          </div>

          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.4em] text-gray-400">
              Efficient Browsing your frequent used Websites
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Launch every team&apos;s{" "}
              <span className="text-gradient">Quick Access Portal</span>
            </h1>
          </div>

          <p
            className={`mx-auto max-w-xl text-lg ${
              isLight ? "text-slate-600" : "text-gray-300"
            }`}
          >
            Your team's central hub for quick access to frequently used
            websites. Save, organize, and share essential URLs internally—making
            navigation faster, cleaner, and more consistent.
          </p>

          <div
            className={`flex flex-wrap justify-center gap-4 text-sm lg:justify-start ${
              isLight ? "text-slate-500" : "text-gray-400"
            }`}
          >
            {[
              "Centralized Quick-Access Hub",
              "Role-Based Bookmark Spaces",
              "Internal Sharing Made Easy",
            ].map((item) => (
              <span
                key={item}
                className={`rounded-full border px-4 py-1 ${
                  isLight ? "border-slate-200/80" : "border-white/20"
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* Right login card section */}
        <section className="w-full max-w-md mx-auto">
          <Card
            className={`text-foreground shadow-2xl backdrop-blur ${
              isLight
                ? "border-slate-200/60 bg-white/80"
                : "border-white/10 bg-black/60"
            }`}
          >
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-2xl font-semibold whitespace-nowrap">
                  Sign in
                </CardTitle>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cycleAnimation}
                    className="rounded-full border border-white/20 text-[0.65rem] uppercase tracking-[0.3em]"
                  >
                    Animate · {animationMode}
                  </Button>
                
                  <ThemeToggle />
                </div>
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                Use your workspace credentials to access the curated dashboard.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Username
                  </label>
                  <Input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g. admin"
                    required
                    className={`placeholder:text-gray-500 ${
                      isLight
                        ? "bg-white/70 text-slate-900"
                        : "bg-black/40 text-white"
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Password
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className={`placeholder:text-gray-500 ${
                      isLight
                        ? "bg-white/70 text-slate-900"
                        : "bg-black/40 text-white"
                    }`}
                  />
                </div>

                {error && (
                  <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full rounded-2xl ${
                    isLight
                      ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white"
                      : "bg-gradient-to-r from-white to-gray-300 text-black"
                  } hover:opacity-90`}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
