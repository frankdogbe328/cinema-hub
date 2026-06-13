import { useEffect, useMemo, useRef, useState } from "react";
import { X, Server, AlertTriangle, RefreshCw, Maximize2, SkipForward, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STREAM_SOURCES, TIER_LABEL, type Tier } from "@/lib/streamingSources";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  tmdbId: number | string;
  mediaType?: "movie" | "tv";
  season?: number;
  episode?: number;
  title?: string;
}

const LOAD_TIMEOUT_MS = 8000;
const AUTO_FALLBACK_AFTER = 2;   // after N failed servers, switch to manual prompt

export function StreamPlayer({
  open,
  onClose,
  tmdbId,
  mediaType = "movie",
  season,
  episode,
  title,
}: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [stalled, setStalled] = useState(false);
  const [autoTried, setAutoTried] = useState(0);
  const stallTimer = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setActiveIdx(0);
      setIframeKey((k) => k + 1);
      setLoaded(false);
      setStalled(false);
      setAutoTried(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setLoaded(false);
    setStalled(false);
    if (stallTimer.current) window.clearTimeout(stallTimer.current);
    stallTimer.current = window.setTimeout(() => {
      if (loaded) return;
      // Auto-advance to the next server up to AUTO_FALLBACK_AFTER times before
      // surfacing the manual "try next" prompt. Most movies play on one of the
      // first three servers; this hides the failure from the user.
      if (autoTried < AUTO_FALLBACK_AFTER) {
        setAutoTried((n) => n + 1);
        setActiveIdx((i) => (i + 1) % STREAM_SOURCES.length);
      } else {
        setStalled(true);
      }
    }, LOAD_TIMEOUT_MS);
    return () => {
      if (stallTimer.current) window.clearTimeout(stallTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, iframeKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && e.altKey) tryNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIdx]);

  const tryNext = () => {
    setAutoTried(0);
    setActiveIdx((i) => (i + 1) % STREAM_SOURCES.length);
  };

  const source = STREAM_SOURCES[activeIdx];
  const url = useMemo(() => {
    if (mediaType === "tv" && source.tv && season != null && episode != null) {
      return source.tv(tmdbId, season, episode);
    }
    return source.movie(tmdbId);
  }, [source, mediaType, season, episode, tmdbId]);

  const requestFullscreen = () => {
    const el = document.getElementById("cinemahub-player-iframe");
    if (el?.requestFullscreen) el.requestFullscreen();
  };

  const grouped = useMemo(() => {
    const groups: Record<Tier, typeof STREAM_SOURCES> = {
      primary: [],
      hd: [],
      backup: [],
    };
    STREAM_SOURCES.forEach((s) => groups[s.tier].push(s));
    return groups;
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/10 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-brand font-bold">
            Now playing · {source.tagline || source.name}
          </p>
          <p className="text-sm sm:text-base font-semibold truncate">{title || "Streaming"}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5 hidden sm:inline-flex text-foreground"
            title="Open this server in a new tab — works even when iframe is blocked"
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" /> Open in new tab
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 hidden sm:inline-flex"
            onClick={tryNext}
            title="Try next server (Alt + →)"
          >
            <SkipForward className="size-3.5" /> Next
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIframeKey((k) => k + 1)}
            aria-label="Reload server"
            title="Reload server"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={requestFullscreen}
            aria-label="Fullscreen"
            title="Fullscreen"
            className="hidden sm:inline-flex"
          >
            <Maximize2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close player">
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Player */}
      <div className="relative flex-1 bg-black">
        {!loaded && !stalled && (
          <div className="absolute inset-0 grid place-items-center z-10">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="size-10 rounded-full border-2 border-brand border-t-transparent animate-spin" />
              <p className="text-sm">
                {autoTried > 0 ? "Auto-switching…" : "Connecting to"} {source.tagline || source.name}
                {autoTried > 0 && <span className="opacity-60"> · attempt {autoTried + 1}</span>}
              </p>
            </div>
          </div>
        )}
        {stalled && !loaded && (
          <div className="absolute inset-0 grid place-items-center z-10 p-6">
            <div className="max-w-md text-center space-y-4 bg-card/80 backdrop-blur p-6 rounded-xl border border-border">
              <AlertTriangle className="size-10 text-yellow-500 mx-auto" />
              <div>
                <p className="font-semibold">{source.tagline || source.name} is slow or unavailable</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try a different server — most movies are available on at least one.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={tryNext} className="gap-2">
                  <SkipForward className="size-4" /> Try next server
                </Button>
                <Button asChild variant="secondary" className="gap-2">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" /> Open in new tab
                  </a>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="gap-2"
                >
                  <RefreshCw className="size-4" /> Reload
                </Button>
              </div>
              <p className="text-xs text-muted-foreground/70 leading-snug pt-1">
                "Open in new tab" almost always works — providers can block iframes but not direct visits.
              </p>
            </div>
          </div>
        )}
        <iframe
          id="cinemahub-player-iframe"
          key={iframeKey}
          src={url}
          title={`${title || "Stream"} — ${source.name}`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => {
            setLoaded(true);
            setStalled(false);
          }}
          className="absolute inset-0 size-full"
        />
      </div>

      {/* Server picker */}
      <div className="border-t border-white/10 bg-black/70 backdrop-blur pb-safe">
        <div className="px-4 sm:px-6 py-3 space-y-3 max-h-[34vh] overflow-y-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Server className="size-3.5" />
              <span className="uppercase tracking-widest font-semibold">Servers</span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Switch if playback fails · <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">Alt</kbd> +{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">→</kbd> = next
            </p>
          </div>

          {(Object.keys(grouped) as Tier[]).map((tier) => {
            const list = grouped[tier];
            if (list.length === 0) return null;
            return (
              <div key={tier} className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-bold">
                  {TIER_LABEL[tier]}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((s) => {
                    const realIdx = STREAM_SOURCES.findIndex((x) => x.id === s.id);
                    const active = realIdx === activeIdx;
                    const srcUrl =
                      mediaType === "tv" && s.tv && season != null && episode != null
                        ? s.tv(tmdbId, season, episode)
                        : s.movie(tmdbId);
                    return (
                      <div key={s.id} className="relative group/srv">
                        <button
                          onClick={() => setActiveIdx(realIdx)}
                          className={cn(
                            "rounded-md pl-3 pr-7 py-2 text-xs font-semibold border transition-all min-w-[6.5rem] w-full text-left",
                            active
                              ? "bg-brand border-brand text-white shadow-lg shadow-brand/30"
                              : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                          )}
                        >
                          <div className="flex flex-col items-start leading-tight">
                            <span>{s.name}</span>
                            {s.tagline && (
                              <span className="text-[10px] opacity-70 font-normal">{s.tagline}</span>
                            )}
                          </div>
                        </button>
                        <a
                          href={srcUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open in new tab"
                          aria-label={`Open ${s.name} in new tab`}
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center h-6 w-6 rounded transition-opacity",
                            active
                              ? "text-white/90 hover:bg-white/20"
                              : "text-muted-foreground/70 hover:text-foreground hover:bg-white/10 opacity-60 group-hover/srv:opacity-100"
                          )}
                        >
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground/70 leading-snug pt-1">
            <AlertTriangle className="size-3 shrink-0 mt-0.5" />
            Tap the ↗ next to any server to open it directly in a new tab — works even when the
            embedded player is blocked. Pop-up ads can be closed; the movie plays underneath.
          </p>
        </div>
      </div>
    </div>
  );
}
