import { Link } from "react-router-dom";
import { Star, Play } from "lucide-react";
import { formatYear, cn } from "@/lib/utils";
import { PosterImage } from "./PosterImage";
import type { Movie } from "@/lib/types";

interface Props {
  movie: Movie;
  size?: "sm" | "md" | "lg";
}

export function MovieCard({ movie, size = "md" }: Props) {
  const title = movie.title || movie.name || "Untitled";
  const year = formatYear(movie.release_date || movie.first_air_date);

  return (
    <Link
      to={`/movie/${movie.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-lg bg-card border border-border/40 transition-all hover:border-brand/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        size === "sm" && "w-32 sm:w-36",
        size === "md" && "w-36 sm:w-44 md:w-48",
        size === "lg" && "w-full"
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <PosterImage
          path={movie.poster_path}
          alt={title}
          size="w500"
          className="size-full transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="grid place-items-center h-12 w-12 rounded-full bg-brand text-white shadow-xl shadow-brand/40">
            <Play className="size-5 fill-current ml-0.5" />
          </span>
        </div>
        {movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[11px] font-semibold backdrop-blur-sm">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            {movie.vote_average.toFixed(1)}
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-3">
        <p className="line-clamp-1 text-[14px] sm:text-sm font-semibold leading-tight group-hover:text-brand transition-colors">{title}</p>
        {year && <p className="text-[12px] sm:text-xs text-muted-foreground mt-1">{year}</p>}
      </div>
    </Link>
  );
}
