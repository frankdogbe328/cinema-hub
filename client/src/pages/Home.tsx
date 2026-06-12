import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { tmdb } from "@/lib/tmdb";
import { HeroBanner } from "@/components/movies/HeroBanner";
import { MovieRow } from "@/components/movies/MovieRow";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const trending = useQuery({ queryKey: ["trending", "week"], queryFn: () => tmdb.trending("week") });
  const trendingToday = useQuery({ queryKey: ["trending", "day"], queryFn: () => tmdb.trending("day") });
  const popular = useQuery({ queryKey: ["popular"], queryFn: () => tmdb.popular() });
  const topRated = useQuery({ queryKey: ["topRated"], queryFn: () => tmdb.topRated() });
  const action = useQuery({
    queryKey: ["discover", "action"],
    queryFn: () => tmdb.discover({ with_genres: "28", sort_by: "popularity.desc" }),
  });
  const drama = useQuery({
    queryKey: ["discover", "drama"],
    queryFn: () => tmdb.discover({ with_genres: "18", sort_by: "popularity.desc" }),
  });
  const scifi = useQuery({
    queryKey: ["discover", "scifi"],
    queryFn: () => tmdb.discover({ with_genres: "878", sort_by: "popularity.desc" }),
  });
  const watchlist = useWatchlist();

  return (
    <div className="space-y-12 pb-20">
      <HeroBanner movies={trending.data?.results} isLoading={trending.isLoading} />

      {isAuthenticated && (watchlist.data?.length ?? 0) > 0 && (
        <ContinueWatchingRow />
      )}

      <MovieRow
        title="Trending this week"
        subtitle="What everyone's watching right now"
        movies={trending.data?.results}
        isLoading={trending.isLoading}
        seeAllHref="/discover?sort=popularity.desc"
      />
      <MovieRow
        title="Trending today"
        movies={trendingToday.data?.results}
        isLoading={trendingToday.isLoading}
      />
      <MovieRow
        title="Popular movies"
        movies={popular.data?.results}
        isLoading={popular.isLoading}
        seeAllHref="/discover"
      />
      <MovieRow
        title="Top rated of all time"
        subtitle="The classics that defined cinema"
        movies={topRated.data?.results}
        isLoading={topRated.isLoading}
        seeAllHref="/discover?sort=vote_average.desc"
      />
      <MovieRow title="Action" movies={action.data?.results} isLoading={action.isLoading} seeAllHref="/discover?genre=28" />
      <MovieRow title="Drama" movies={drama.data?.results} isLoading={drama.isLoading} seeAllHref="/discover?genre=18" />
      <MovieRow title="Sci-Fi" movies={scifi.data?.results} isLoading={scifi.isLoading} seeAllHref="/discover?genre=878" />

      {!isAuthenticated && <SignupBanner />}
    </div>
  );
}

function ContinueWatchingRow() {
  const wl = useWatchlist();
  if (!wl.data?.length) return null;
  return (
    <MovieRow
      title="Your watchlist"
      subtitle="Pick up where you left off"
      movies={wl.data.map((item) => ({
        id: item.tmdbId,
        title: item.title,
        overview: "",
        poster_path: item.posterPath,
        backdrop_path: null,
        vote_average: 0,
        vote_count: 0,
      }))}
      seeAllHref="/watchlist"
    />
  );
}

function SignupBanner() {
  return (
    <div className="container">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand/20 via-brand/10 to-transparent border border-brand/30 p-8 sm:p-12">
        <Sparkles className="absolute top-6 right-6 size-32 text-brand/10" />
        <div className="relative max-w-xl space-y-4">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">
            Build your personal cinema
          </h2>
          <p className="text-muted-foreground">
            Save movies, track what you've watched, rate and review — all in one place, from any device.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/register">
                Create free account <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
