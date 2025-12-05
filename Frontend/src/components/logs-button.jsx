import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LogsButton({ user }) {
  const navigate = useNavigate();

  // Only show logs button for admin users
  if (user?.role !== "admin") {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate("/logs")}
      className="flex items-center gap-2 rounded-full border border-border/60 px-4"
    >
      <Activity className="h-4 w-4" />
      <span>Logs</span>
    </Button>
  );
}