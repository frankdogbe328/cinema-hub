import { Link } from "react-router-dom";
import { Trash2, Check, Bookmark } from "lucide-react";
import { useWatchlist, useWatchlistMutations } from "@/hooks/useWatchlist";
import { tmdbImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Watchlist() {
  const wl = useWatchlist();
  const { remove, toggleWatched } = useWatchlistMutations();

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">My List</h1>
          <p className="text-sm text-muted-foreground">
            {wl.data?.length || 0} saved {wl.data?.length === 1 ? "title" : "titles"}
          </p>
        </div>
      </div>

      {wl.isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
          ))}
        </div>
      )}

      {wl.data?.length === 0 && (
        <div className="py-20 text-center space-y-3">
          <Bookmark className="mx-auto size-12 text-muted-foreground" />
          <p className="text-muted-foreground">Your list is empty.</p>
          <Button asChild>
            <Link to="/">Browse movies</Link>
          </Button>
        </div>
      )}

      {wl.data && wl.data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {wl.data.map((item) => (
            <div
              key={item.tmdbId}
              className="group relative overflow-hidden rounded-lg bg-card border border-border/40"
            >
              <Link to={`/movie/${item.tmdbId}`} className="block aspect-[2/3] bg-secondary">
                {item.posterPath ? (
                  <img
                    src={tmdbImage(item.posterPath, "w500") ?? undefined}
                    alt={item.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-muted-foreground">No image</div>
                )}
              </Link>
              <div className="p-2.5 sm:p-3 space-y-2">
                <p className="line-clamp-1 text-[14px] sm:text-sm font-semibold leading-tight">{item.title}</p>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={item.watched ? "default" : "outline"}
                    className="flex-1 h-9 text-[11px] sm:text-xs px-2"
                    onClick={() => toggleWatched.mutate({ tmdbId: item.tmdbId, watched: !item.watched })}
                  >
                    <Check className="size-3" />
                    {item.watched ? "Watched" : "Watched?"}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9"
                    onClick={() => remove.mutate(item.tmdbId)}
                    aria-label="Remove"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
