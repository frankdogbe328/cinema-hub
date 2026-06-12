import { MovieCard } from "./MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Movie } from "@/lib/types";

export function MovieGrid({ movies, isLoading, empty }: { movies?: Movie[]; isLoading?: boolean; empty?: React.ReactNode }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
        ))}
      </div>
    );
  }
  if (!movies?.length) {
    return <div className="py-16 text-center text-muted-foreground">{empty || "Nothing here yet."}</div>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {movies.map((m) => (
        <MovieCard key={m.id} movie={m} size="lg" />
      ))}
    </div>
  );
}
