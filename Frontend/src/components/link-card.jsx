import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const categoryVariants = {
  admin: "from-amber-500/20 to-orange-500/10 text-amber-200 border-amber-500/40",
  marketer: "from-purple-500/20 to-pink-500/10 text-purple-100 border-purple-500/40",
  hr: "from-emerald-500/20 to-green-500/10 text-emerald-100 border-emerald-500/40",
  employee: "from-blue-500/20 to-indigo-500/10 text-blue-100 border-blue-500/40",
  other: "from-zinc-500/20 to-slate-500/10 text-zinc-100 border-zinc-500/40",
};

export function LinkCard({ link, onDelete, canDelete }) {
  const initial = link.title?.[0]?.toUpperCase() ?? "S";

  const handleOpen = () => {
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete(link._id);
  };

  const badgeStyle = categoryVariants[link.category] ?? categoryVariants.other;

  return (
    <Card
      onClick={handleOpen}
      className="group relative cursor-pointer overflow-hidden border-border/40 bg-card/70 transition hover:-translate-y-1 hover:border-border hover:shadow-2xl"
    >
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/40 bg-gradient-to-br from-white/10 to-black/40 text-2xl font-semibold text-white shadow-inner">
          {link.logo ? (
            <img
              src={link.logo}
              alt={link.title}
              className="h-full w-full rounded-2xl object-contain p-2"
            />
          ) : (
            initial
          )}
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl text-foreground">{link.title}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {link.description || "No description provided"}
          </CardDescription>
        </div>
        {canDelete && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            className="ml-auto rounded-full text-muted-foreground opacity-0 transition group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-0">
        {/* <Badge
          className={`rounded-full border px-4 py-1 text-xs uppercase tracking-[0.3em] ${badgeStyle}`}
        >
          {link.category}
        </Badge> */}
        <p className="text-xs text-muted-foreground">
          Added by {link.createdBy?.username ?? "you"}
        </p>
      </CardContent>
    </Card>
  );
}

