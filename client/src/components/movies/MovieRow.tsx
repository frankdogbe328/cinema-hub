import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Movie } from "@/lib/types";

interface Props {
  title: string;
  subtitle?: string;
  movies?: Movie[];
  isLoading?: boolean;
  seeAllHref?: string;
}

export function MovieRow({ title, subtitle, movies, isLoading, seeAllHref }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [movies]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="space-y-3 group/row">
      <div className="container flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {seeAllHref && (
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1">
              <Link to={seeAllHref}>
                See all <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          )}
          <div className="hidden md:flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              disabled={!canLeft}
              className="disabled:opacity-30"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              disabled={!canRight}
              className="disabled:opacity-30"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>

      <div className="container relative !px-0">
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-4 sm:px-5 md:px-6 lg:px-8 scrollbar-hide scroll-smooth snap-x snap-mandatory md:snap-none overscroll-x-contain"
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-36 sm:w-44 md:w-48 shrink-0 rounded-lg" />
              ))
            : movies?.map((m) => (
                <div key={m.id} className="shrink-0 snap-start">
                  <MovieCard movie={m} />
                </div>
              ))}
        </div>
        {canRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-background to-transparent hidden md:block" />
        )}
        {canLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-background to-transparent hidden md:block" />
        )}
      </div>
    </section>
  );
}
