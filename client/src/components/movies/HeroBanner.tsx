import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { tmdbImage, formatYear } from "@/lib/utils";
import type { Movie } from "@/lib/types";

interface Props {
  movies?: Movie[];
  isLoading?: boolean;
}

export function HeroBanner({ movies, isLoading }: Props) {
  const slides = (movies ?? []).filter((m) => m.backdrop_path).slice(0, 5);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 8000);
    return () => clearInterval(t);
  }, [slides.length, paused]);

  if (isLoading || slides.length === 0) {
    return <Skeleton className="h-[70vh] min-h-[480px] w-full rounded-none" />;
  }

  const movie = slides[idx];
  const title = movie.title || movie.name || "Untitled";
  const year = formatYear(movie.release_date || movie.first_air_date);

  return (
    <section
      className="relative h-[78vh] min-h-[520px] w-full overflow-hidden -mt-16 pt-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((m, i) => {
        const src = tmdbImage(m.backdrop_path, "original");
        if (!src) return null;
        return (
          <img
            key={m.id}
            src={src}
            alt={m.title || m.name || ""}
            className={`absolute inset-0 size-full object-cover transition-all duration-[1500ms] ease-out ${
              i === idx ? "opacity-100 scale-100" : "opacity-0 scale-110"
            }`}
          />
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />

      <div className="container relative h-full flex items-end pb-16 sm:pb-24">
        <div key={movie.id} className="max-w-2xl space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white tracking-wide shadow-lg shadow-brand/30">
              <Play className="size-3 fill-current" /> #{idx + 1} Trending
            </span>
            {movie.vote_average > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <Star className="size-3 fill-yellow-400 text-yellow-400" />
                {movie.vote_average.toFixed(1)}
              </span>
            )}
            {year && <span className="text-muted-foreground">{year}</span>}
          </div>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance drop-shadow-2xl">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground line-clamp-3 max-w-xl leading-relaxed">
            {movie.overview}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" className="gap-2">
              <Link to={`/movie/${movie.id}`}>
                <Play className="size-4 fill-current" /> Watch trailer
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link to={`/movie/${movie.id}`}>
                <Info className="size-4" /> More info
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Slide controls */}
      <div className="absolute bottom-6 right-6 sm:right-10 hidden sm:flex items-center gap-2 z-10">
        <button
          onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
          className="grid place-items-center h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          onClick={() => setIdx((i) => (i + 1) % slides.length)}
          className="grid place-items-center h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:bottom-8 sm:right-32 flex gap-1.5 z-10">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIdx(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === idx ? "w-8 bg-brand" : "w-4 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
