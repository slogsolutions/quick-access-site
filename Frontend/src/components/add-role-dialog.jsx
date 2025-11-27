import { useState } from "react";
import api from "@/axios/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function AddRoleDialog({ open, onOpenChange, onRoleCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    accent: "#6366f1",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) {
      setError("Role name is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/roles", formData);
      onRoleCreated(response.data);
      setFormData({ name: "", accent: "#6366f1" });
      onOpenChange(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/40 bg-background/95">
        <DialogHeader>
          <DialogTitle>Create a new role</DialogTitle>
          <DialogDescription>
            Add a custom role to share its own quick-access collection. New roles become available for user registration
            and link tabs instantly.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Role name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Operations"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="accent">Accent color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="accent"
                name="accent"
                type="color"
                value={formData.accent}
                onChange={handleChange}
                className="h-12 w-24 cursor-pointer rounded-xl border border-border/60 p-2"
              />
              <Input
                value={formData.accent}
                name="accent"
                onChange={handleChange}
                placeholder="#6366f1"
                className="uppercase"
              />
            </div>
            <p className="text-xs text-muted-foreground">Accent colors tint the tab badge and card gradients.</p>
          </div>
          {error && (
            <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Create role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

