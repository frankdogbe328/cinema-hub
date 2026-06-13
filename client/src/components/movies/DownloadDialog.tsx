import { useEffect } from "react";
import { X, Download, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  year?: string | null;
}

interface Source {
  id: string;
  name: string;
  tagline: string;
  url: (q: string) => string;
  accent: string;
}

const SOURCES: Source[] = [
  {
    id: "netnaija",
    name: "NetNaija",
    tagline: "Nollywood + Hollywood",
    url: (q) => `https://www.netnaija.com/search?t=${encodeURIComponent(q)}`,
    accent: "from-green-500/20 to-green-500/0 border-green-500/30",
  },
  {
    id: "fzmovies",
    name: "FzMovies",
    tagline: "Direct mobile downloads",
    url: (q) => `https://fzmovies.net/csearch.php?searchname=${encodeURIComponent(q)}`,
    accent: "from-blue-500/20 to-blue-500/0 border-blue-500/30",
  },
  {
    id: "yts",
    name: "YTS",
    tagline: "1080p / 4K small-size",
    url: (q) => `https://yts.mx/browse-movies/${encodeURIComponent(q)}`,
    accent: "from-yellow-500/20 to-yellow-500/0 border-yellow-500/30",
  },
  {
    id: "o2tv",
    name: "O2TVSeries",
    tagline: "TV shows & series",
    url: (q) => `https://o2tvseries.com/search/${encodeURIComponent(q)}.html`,
    accent: "from-purple-500/20 to-purple-500/0 border-purple-500/30",
  },
];

export function DownloadDialog({ open, onClose, title, year }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const q = year ? `${title} ${year}` : title;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border sm:rounded-2xl rounded-t-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-border">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-brand font-bold">
              Save offline
            </p>
            <h2 className="font-display text-xl font-bold mt-1 leading-tight line-clamp-1">
              {title}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </Button>
        </div>

        {/* Tip card — the easiest download path */}
        <div className="m-5 mb-3 rounded-xl border border-brand/30 bg-gradient-to-br from-brand/10 to-transparent p-4">
          <div className="flex items-start gap-3">
            <div className="grid place-items-center size-8 rounded-full bg-brand/20 text-brand shrink-0">
              <Sparkles className="size-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Easiest: download from the player</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Hit <span className="font-semibold text-foreground">Watch now</span>, then look for
                the <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-foreground/10 text-foreground font-semibold">
                  <Download className="size-3" /> Download
                </span>{" "}
                icon inside the player's controls (Servers 1, 2, 5 have it).
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 font-bold">
            Or grab it from
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-5 pt-2">
          {SOURCES.map((s) => (
            <a
              key={s.id}
              href={s.url(q)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setTimeout(onClose, 300)}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-all hover:scale-[1.02] hover:shadow-lg",
                s.accent
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <p className="font-display font-bold text-sm">{s.name}</p>
                  <p className="text-[12px] text-muted-foreground leading-snug">{s.tagline}</p>
                </div>
                <ExternalLink className="size-3.5 text-muted-foreground/60 group-hover:text-foreground transition-colors shrink-0" />
              </div>
            </a>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground/60 leading-snug px-5 pb-5 text-center">
          Downloads come from third-party providers. CinemaHub doesn't host any files.
        </p>
      </div>
    </div>
  );
}
