import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/lib/tmdb";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "popularity.desc", label: "Popular" },
  { value: "vote_average.desc", label: "Top rated" },
  { value: "primary_release_date.desc", label: "Newest" },
  { value: "revenue.desc", label: "Box office" },
];

export default function Discover() {
  const genres = useQuery({ queryKey: ["genres"], queryFn: tmdb.genres });
  const [genre, setGenre] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState("popularity.desc");

  const list = useQuery({
    queryKey: ["discover", genre, sort],
    queryFn: () => tmdb.discover({ with_genres: genre, sort_by: sort }),
  });

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Discover</h1>
        <p className="text-sm text-muted-foreground">Filter the entire TMDB catalog.</p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Chip active={!genre} onClick={() => setGenre(undefined)}>All genres</Chip>
          {genres.data?.map((g) => (
            <Chip key={g.id} active={genre === String(g.id)} onClick={() => setGenre(String(g.id))}>
              {g.name}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <Chip key={s.value} active={sort === s.value} onClick={() => setSort(s.value)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      <MovieGrid movies={list.data?.results} isLoading={list.isLoading} />
    </div>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors",
        active
          ? "bg-brand border-brand text-white"
          : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
      )}
    >
      {children}
    </button>
  );
}
