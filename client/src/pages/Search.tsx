import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { tmdb } from "@/lib/tmdb";
import { Input } from "@/components/ui/input";
import { MovieGrid } from "@/components/movies/MovieGrid";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [debounced, setDebounced] = useState(initialQ);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(q);
      setSearchParams(q ? { q } : {}, { replace: true });
    }, 300);
    return () => clearTimeout(id);
  }, [q, setSearchParams]);

  const results = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => tmdb.search(debounced),
    enabled: debounced.trim().length > 1,
  });

  return (
    <div className="container py-8 space-y-6">
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Search</h1>
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search movies, TV shows…"
            className="pl-9 h-12 text-base"
            autoFocus
          />
        </div>
      </div>

      {debounced.length <= 1 ? (
        <p className="text-sm text-muted-foreground">Start typing to search the catalog.</p>
      ) : (
        <MovieGrid
          movies={results.data?.results.filter((r) => r.poster_path)}
          isLoading={results.isLoading}
          empty={`No results for "${debounced}"`}
        />
      )}
    </div>
  );
}
