import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import LogsDashboardPage from "./pages/LogsDashboardPage";
import { ThemeProvider } from "./components/theme-provider";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // More comprehensive suppression for hydration warnings
    if (typeof window !== 'undefined') {
      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.error = (...args) => {
        // Suppress specific hydration errors
        if (args.length > 0) {
          const argString = String(args[0]);
          if (argString.includes('cannot be a descendant of <button>') ||
              argString.includes('cannot contain a nested <button>') ||
              argString.includes('Did not expect server HTML to contain')) {
            return;
          }
        }
        originalError.apply(console, args);
      };

      console.warn = (...args) => {
        // Optionally suppress React Router future flag warnings
        if (args.length > 0 && String(args[0]).includes('React Router Future Flag')) {
          return;
        }
        originalWarn.apply(console, args);
      };

      return () => {
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user session", error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" replace /> : <LoginPage setUser={setUser} />
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <DashboardPage user={user} setUser={setUser} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>

      <Routes>
  <Route
    path="/"
    element={
      user ? <Navigate to="/dashboard" replace /> : <LoginPage setUser={setUser} />
    }
  />
  <Route
    path="/dashboard"
    element={
      user ? (
        <DashboardPage user={user} setUser={setUser} />
      ) : (
        <Navigate to="/" replace />
      )
    }
  />
  {/* ADD THIS LINE - Logs Dashboard Route */}
  <Route
    path="/logs"
    element={
      user?.role === "admin" ? (
        <LogsDashboardPage user={user} setUser={setUser} />
      ) : (
        <Navigate to="/dashboard" replace />
      )
    }
  />
</Routes>


      </Router>
    </ThemeProvider>
  );
}

export default App;