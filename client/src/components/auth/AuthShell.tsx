import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/lib/tmdb";
import { tmdbImage } from "@/lib/utils";
import { LogoLockup } from "@/components/brand/Logo";

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: Props) {
  const { data } = useQuery({
    queryKey: ["trending", "week"],
    queryFn: () => tmdb.trending("week"),
    staleTime: 30 * 60 * 1000,
  });

  const backdrops = (data?.results ?? []).filter((m) => m.backdrop_path).slice(0, 5);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (backdrops.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % backdrops.length), 7000);
    return () => clearInterval(t);
  }, [backdrops.length]);

  const current = backdrops[idx];
  const currentBg = tmdbImage(current?.backdrop_path, "original");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Cinematic side */}
      <div className="relative hidden lg:block overflow-hidden">
        {backdrops.map((m, i) => {
          const src = tmdbImage(m.backdrop_path, "original");
          if (!src) return null;
          return (
            <img
              key={m.id}
              src={src}
              alt={m.title || m.name || ""}
              className={`absolute inset-0 size-full object-cover transition-opacity duration-[1500ms] ${i === idx ? "opacity-100 scale-105" : "opacity-0"}`}
            />
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-background/60 to-background/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link to="/" aria-label="CinemaHub home" className="w-fit">
            <LogoLockup size="md" />
          </Link>

          <div className="space-y-4 max-w-md">
            <p className="text-sm uppercase tracking-[0.3em] text-brand font-bold">
              Now trending
            </p>
            {current && (
              <>
                <h2 className="font-display text-4xl font-extrabold tracking-tight text-balance">
                  {current.title || current.name}
                </h2>
                <div className="flex items-center gap-3 text-sm">
                  {current.vote_average > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur px-3 py-1 font-semibold">
                      <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                      {current.vote_average.toFixed(1)}
                    </span>
                  )}
                  {(current.release_date || current.first_air_date) && (
                    <span className="text-muted-foreground">
                      {(current.release_date || current.first_air_date)?.slice(0, 4)}
                    </span>
                  )}
                </div>
                <p className="text-base text-muted-foreground line-clamp-3 leading-relaxed">
                  {current.overview}
                </p>
              </>
            )}
            <div className="flex gap-1.5 pt-3">
              {backdrops.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setIdx(i)}
                  aria-label={`Show ${m.title || m.name}`}
                  className={`h-1 rounded-full transition-all ${i === idx ? "w-8 bg-brand" : "w-4 bg-white/30 hover:bg-white/50"}`}
                />
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground/60">
            Catalog powered by The Movie Database (TMDB)
          </p>
        </div>
      </div>

      {/* Form side */}
      <div
        className="relative flex flex-col justify-center px-5 py-8 sm:px-12 sm:py-10"
        style={
          currentBg
            ? {
                backgroundImage: `linear-gradient(to bottom, hsl(var(--background) / 0.92), hsl(var(--background) / 0.95)), url(${currentBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <Link
          to="/"
          aria-label="CinemaHub home"
          className="lg:hidden mb-7 self-center"
        >
          <LogoLockup size="md" />
        </Link>

        <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-7 animate-fade-in">
          <div className="space-y-2">
            <h1 className="font-display text-[28px] sm:text-4xl font-extrabold tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-[15px] sm:text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-5 sm:p-7 shadow-2xl shadow-black/40">
            {children}
          </div>

          {footer && <div className="text-center text-sm">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
