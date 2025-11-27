import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddLinkDialog({ open, onOpenChange, onAdd, userRole, availableRoles = [] }) {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    category: userRole === "admin" ? availableRoles[0]?.slug || "admin" : userRole,
    logo: "",
  });
  const [fetchingLogo, setFetchingLogo] = useState(false);
  const [error, setError] = useState("");

  const assignableRoles = availableRoles.filter((role) => role.assignable);

  let availableCategories =
    userRole === "admin"
      ? [...assignableRoles, { slug: "other", name: "Other (visible to all)" }]
      : [
          ...assignableRoles
            .filter((role) => role.slug === userRole)
            .map((role) => ({ ...role })),
          { slug: "other", name: "Other (visible to all)" },
        ];

  if (
    userRole !== "admin" &&
    !availableCategories.some((cat) => cat.slug === userRole) &&
    userRole !== "other"
  ) {
    availableCategories = [
      { slug: userRole, name: userRole.charAt(0).toUpperCase() + userRole.slice(1) },
      ...availableCategories,
    ];
  }

  useEffect(() => {
    if (userRole === "admin") {
      setFormData((prev) => ({
        ...prev,
        category: assignableRoles[0]?.slug || "admin",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        category: userRole,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, availableRoles.length]);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
    setError("");
  };

  const fetchLogoFromUrl = async (url) => {
    if (!url) return;
    setFetchingLogo(true);
    try {
      const response = await api.post("/logo/fetch", { url });
      if (response.data.logo) {
        setFormData((prev) => ({ ...prev, logo: response.data.logo }));
      }
    } catch (err) {
      console.error("Logo fetch failed", err);
    } finally {
      setFetchingLogo(false);
    }
  };

  useEffect(() => {
    if (!formData.url) return;
    const timeout = setTimeout(() => {
      fetchLogoFromUrl(formData.url);
    }, 600);
    return () => clearTimeout(timeout);
  }, [formData.url]);

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title || !formData.url) {
      setError("Title and URL are required.");
      return;
    }
    try {
      await onAdd(formData);
      setFormData({
        title: "",
        url: "",
        description: "",
        category: userRole === "admin" ? "admin" : userRole,
        logo: "",
      });
      onOpenChange(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border/40 bg-background/95">
        <DialogHeader>
          <DialogTitle>Add a new quick access link</DialogTitle>
          <DialogDescription>
            Provide a title, URL and optional description. Logos are detected automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Marketing Hub"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
              required
            />
            {fetchingLogo && <p className="text-xs text-muted-foreground">Fetching logo...</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="What does this link do?"
            />
          </div>

          <div className="grid gap-2">
            <Label>Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  category: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((option) => (
                  <SelectItem key={option.slug} value={option.slug}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="logo">Logo</Label>
            <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} />
            <div className="mt-3 flex items-center gap-4 rounded-2xl border border-dashed border-border/60 p-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-2xl font-semibold">
                {formData.logo ? (
                  <img
                    src={formData.logo}
                    alt="Logo preview"
                    className="h-full w-full rounded-2xl object-contain"
                  />
                ) : (
                  (formData.title?.[0] || "S").toUpperCase()
                )}
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  {formData.logo
                    ? "Logo detected. Upload another file to replace."
                    : "Enter a URL and we will detect the logo automatically."}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchLogoFromUrl(formData.url)}
                  disabled={!formData.url || fetchingLogo}
                >
                  Refresh logo preview
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save link</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

