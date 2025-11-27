import { useEffect, useMemo, useState } from "react";
import api from "@/axios/api";
import { AuroraBackground } from "@/components/aurora-background";
import { ThemeToggle } from "@/components/theme-toggle";
import { AddLinkDialog } from "@/components/add-link-dialog";
import { RegisterUserDialog } from "@/components/register-user-dialog";
import { LinkCard } from "@/components/link-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bookmark, Link, PlusCircle } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { AddRoleDialog } from "@/components/add-role-dialog";

const dedupeBySlug = (items = []) =>
  items.reduce((acc, item) => {
    if (!acc.some((existing) => existing.slug === item.slug)) {
      acc.push(item);
    }
    return acc;
  }, []);

const animationModes = ["aurora", "meteors", "weather", "quotes"];

export default function DashboardPage({ user, setUser }) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const backgroundClass = isLight ? "text-slate-900" : "text-white";
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [activeTab, setActiveTab] = useState(user.role === "admin" ? "all" : user.role);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [animationMode, setAnimationMode] = useState("aurora");

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setLoading(true);
        const response = await api.get("/links");
        setLinks(response.data);
      } catch (error) {
        console.error("Failed to fetch links", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await api.get("/roles");
        setRoles(dedupeBySlug(response.data));
      } catch (error) {
        console.error("Failed to fetch roles", error);
      }
    };

    fetchLinks();
    fetchRoles();
  }, []);

  const assignableRoles = useMemo(
    () => dedupeBySlug(roles.filter((role) => role.assignable)),
    [roles]
  );

  const tabs = useMemo(() => {
    const dynamicRoles = user.role === "admin" ? assignableRoles : assignableRoles.filter((role) => role.slug === user.role);
    const baseTabs = [{ id: "all", label: "All", accent: "#94a3b8" }];
    const otherTab = { id: "other", label: "Other", accent: "#9ca3af" };
    return [...baseTabs, ...dynamicRoles.map((role) => ({ id: role.slug, label: role.name, accent: role.accent })), otherTab];
  }, [assignableRoles, user.role]);

  useEffect(() => {
    const allowedTabs = tabs.map((tab) => tab.id);
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(user.role === "admin" ? "all" : user.role);
    }
  }, [tabs, activeTab, user.role]);

  const filteredLinks = useMemo(() => {
    if (activeTab === "all") return links;
    return links.filter((link) => link.category === activeTab);
  }, [links, activeTab]);

  const handleAddLink = async (payload) => {
    const response = await api.post("/links", payload);
    setLinks((prev) => [response.data, ...prev]);
  };

  const handleDeleteLink = async (id) => {
    if (!window.confirm("Delete this link?")) return;
    await api.delete(`/links/${id}`);
    setLinks((prev) => prev.filter((link) => link._id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const cycleAnimation = () => {
    setAnimationMode((prev) => {
      const idx = animationModes.indexOf(prev);
      return animationModes[(idx + 1) % animationModes.length];
    });
  };

  return (
    <main className={`relative min-h-screen overflow-hidden transition-colors duration-700 ${backgroundClass}`}>
      <AuroraBackground theme={theme} mode={animationMode} />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <header
          className={`flex flex-wrap items-center justify-between gap-6 rounded-3xl border px-6 py-5 shadow-2xl backdrop-blur ${
            isLight ? "border-slate-200/80 bg-white/80 text-slate-900" : "border-white/10 bg-black/40 text-white"
          }`}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Slog Solutions</p>
            <h1 className="text-2xl font-semibold">Quick Access Bookmark <Bookmark /></h1>
          </div>
          <div className="flex items-center gap-3"> 
            <Badge
              variant="outline"
              className={`text-xs uppercase tracking-[0.3em] ${
                isLight ? "border-slate-300 text-slate-700" : "border-white/30 text-white"
              }`}
            >
            Logged in as {user.role}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={cycleAnimation}
              className="rounded-full border border-white/10 text-[0.65rem] uppercase tracking-[0.3em]"
            >
              Animate · {animationMode}
            </Button>
            <ThemeToggle />
            <Button variant="ghost" onClick={handleLogout} className="text-red-300 hover:text-red-200">
              Logout
            </Button>
          </div>
        </header>

        <section
          className={`rounded-[32px] border p-6 shadow-2xl backdrop-blur ${
            isLight ? "border-slate-200 bg-white/80 text-slate-900" : "border-white/10 bg-black/30 text-white"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Collections</p>
              <h2 className="text-3xl font-semibold">Pinned Links<Link /></h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setShowAddDialog(true)} className="gap-2 rounded-full bg-white text-black hover:bg-slate-100">
                <PlusCircle className="h-4 w-4" />
                Add link
              </Button>
              {user.role === "admin" && (
                <>
                  <Button
                    variant="outline"
                    className={`rounded-full ${isLight ? "border-slate-200" : "border-white/40"}`}
                    onClick={() => setShowRegisterDialog(true)}
                  >
                    Register user
                  </Button>
                  <Button variant="ghost" className="rounded-full border border-white/30 text-sm" onClick={() => setShowRoleDialog(true)}>
                    Add role
                  </Button>
                </>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList
              className={`flex h-auto flex-wrap gap-3 rounded-2xl p-2 ${
                isLight ? "bg-slate-100/80" : "bg-white/5"
              }`}
            >
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`rounded-2xl border border-transparent px-4 py-2 text-sm uppercase tracking-[0.2em] transition ${
                    isLight
                      ? "data-[state=active]:border-slate-400 data-[state=active]:bg-white"
                      : "data-[state=active]:border-white data-[state=active]:bg-white/10"
                  }`}
                >
                  <span
                    className="mr-2 h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: tab.accent,
                    }}
                  />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <p className="text-center text-muted-foreground">Loading links...</p>
              ) : filteredLinks.length === 0 ? (
                <div
                  className={`rounded-3xl border p-10 text-center text-muted-foreground ${
                    isLight ? "border-slate-200 bg-white/80" : "border-white/10 bg-black/30"
                  }`}
                >
                  No links in this category yet.
                </div>
              ) : (
                <ScrollArea className="max-h-[70vh] pr-4">
                  <div className="grid gap-5 md:grid-cols-2">
                    {filteredLinks.map((link) => {
                      const creatorId = link.createdBy?._id ?? link.createdBy;
                      const canDelete = user.role === "admin" || creatorId?.toString() === user.id;
                      return (
                        <LinkCard
                          key={link._id}
                          link={link}
                          onDelete={handleDeleteLink}
                          canDelete={canDelete}
                        />
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </section>
{/* 
        <section
          className={`rounded-[32px] border p-6 shadow-2xl backdrop-blur ${
            isLight ? "border-slate-200 bg-white/80 text-slate-900" : "border-white/10 bg-black/30 text-white"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Highlights</p>
              <h2 className="text-3xl font-semibold">Logo detection · Animated UI · Role isolation</h2>
            </div>
          </div>
          <Separator className={`my-6 ${isLight ? "border-slate-200/80" : "border-white/10"}`} />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { label: "Auto logos fetched", value: "92%", accent: "from-indigo-500 to-purple-500" },
              {
                label: "Collections curated",
                value: assignableRoles.length + 1,
                accent: "from-emerald-500 to-teal-500",
              },
              { label: "Devices streaming", value: "32 kiosks", accent: "from-amber-400 to-orange-500" },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-3xl bg-gradient-to-br ${item.accent} p-6 text-black shadow-xl`}
              >
                <p className="text-xs uppercase tracking-[0.4em]">{item.label}</p>
                <p className="mt-3 text-3xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </section> */}

      </div>

      <AddLinkDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddLink}
        userRole={user.role}
        availableRoles={assignableRoles}
      />

      {user.role === "admin" && (
        <>
          <RegisterUserDialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog} roles={assignableRoles} />
          <AddRoleDialog
            open={showRoleDialog}
            onOpenChange={setShowRoleDialog}
            onRoleCreated={(role) =>
              setRoles((prev) => dedupeBySlug([...prev, role]).sort((a, b) => a.name.localeCompare(b.name)))
            }
          />
        </>
      )}
    </main>
  );
}

