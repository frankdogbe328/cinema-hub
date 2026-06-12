import { useEffect, useMemo, useRef, useState } from "react";
import { X, Server, AlertTriangle, RefreshCw, Maximize2, SkipForward } from "lucide-react";
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

const LOAD_TIMEOUT_MS = 9000;

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
  const stallTimer = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setActiveIdx(0);
      setIframeKey((k) => k + 1);
      setLoaded(false);
      setStalled(false);
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
      if (!loaded) setStalled(true);
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
            variant="ghost"
            size="sm"
            className="gap-1.5 hidden sm:inline-flex"
            onClick={tryNext}
            title="Try next server (Alt + →)"
          >
            <SkipForward className="size-3.5" /> Next server
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
              <p className="text-sm">Connecting to {source.tagline || source.name}…</p>
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
                <Button
                  variant="outline"
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="gap-2"
                >
                  <RefreshCw className="size-4" /> Reload
                </Button>
              </div>
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
      <div className="border-t border-white/10 bg-black/70 backdrop-blur">
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
                    return (
                      <button
                        key={s.id}
                        onClick={() => setActiveIdx(realIdx)}
                        className={cn(
                          "rounded-md px-3 py-2 text-xs font-semibold border transition-all min-w-[6.5rem]",
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
                    );
                  })}
                </div>
              </div>
            );
          })}

          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground/70 leading-snug pt-1">
            <AlertTriangle className="size-3 shrink-0 mt-0.5" />
            Streams come from public providers. Quality and availability vary by title. If a server
            shows pop-up ads, close them and the movie will play underneath.
          </p>
        </div>
      </div>
    </div>
  );
}
