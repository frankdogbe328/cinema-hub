import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Play, Plus, Check, Star, Calendar, Clock, Share2, X, Film } from "lucide-react";
import { tmdb } from "@/lib/tmdb";
import { api, errorMessage } from "@/lib/api";
import { tmdbImage, formatRuntime, formatYear } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MovieRow } from "@/components/movies/MovieRow";
import { StreamPlayer } from "@/components/movies/StreamPlayer";
import { useAuth } from "@/context/AuthContext";
import { useWatchlist, useWatchlistMutations } from "@/hooks/useWatchlist";
import { useToast } from "@/components/ui/toast";
import type { Review } from "@/lib/types";

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [showTrailer, setShowTrailer] = useState(false);
  const [showStream, setShowStream] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(8);
  const [postingReview, setPostingReview] = useState(false);

  const movieQ = useQuery({
    queryKey: ["movie", id],
    queryFn: () => tmdb.movie(id!),
    enabled: !!id,
  });

  const reviewsQ = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const { data } = await api.get<{ reviews: Review[] }>(`/reviews/movie/${id}`);
      return data.reviews;
    },
    enabled: !!id,
  });

  const watchlistQ = useWatchlist();
  const { add: addWl, remove: removeWl } = useWatchlistMutations();
  const inWatchlist = watchlistQ.data?.some((w) => w.tmdbId === Number(id));

  if (movieQ.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[60vh] w-full rounded-none" />
        <div className="container space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (movieQ.isError || !movieQ.data) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Movie not found</h1>
        <p className="mt-2 text-muted-foreground">We couldn't load this title.</p>
      </div>
    );
  }

  const m = movieQ.data;
  const trailer =
    m.videos?.results?.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
    m.videos?.results?.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    m.videos?.results?.find((v) => v.site === "YouTube");
  const cast = m.credits?.cast?.slice(0, 12) ?? [];
  const similar = m.similar?.results ?? [];
  const backdrop = tmdbImage(m.backdrop_path, "original") || tmdbImage(m.poster_path, "w780");
  const poster = tmdbImage(m.poster_path, "w500");
  const title = m.title || m.name || "Untitled";

  const handleWatchlist = () => {
    if (!isAuthenticated) {
      window.location.href = `/login?next=/movie/${m.id}`;
      return;
    }
    if (inWatchlist) {
      removeWl.mutate(m.id, {
        onSuccess: () => toast.success(`Removed "${title}" from your list`),
        onError: (err) => toast.error(errorMessage(err)),
      });
    } else {
      addWl.mutate(
        {
          tmdbId: m.id,
          mediaType: "movie",
          title,
          posterPath: m.poster_path,
        },
        {
          onSuccess: () => toast.success(`Added "${title}" to your list`),
          onError: (err) => toast.error(errorMessage(err)),
        }
      );
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: m.overview, url });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      } catch {
        toast.error("Could not copy link");
      }
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setPostingReview(true);
    try {
      await api.post("/reviews", { movieId: m.id, rating: reviewRating, review: reviewText });
      setReviewText("");
      reviewsQ.refetch();
      toast.success("Review posted");
    } catch (err) {
      toast.error(errorMessage(err, "Could not post review"));
    } finally {
      setPostingReview(false);
    }
  };

  return (
    <div className="pb-32 sm:pb-20">
      <section className="relative h-[55vh] min-h-[440px] w-full overflow-hidden -mt-16">
        {backdrop && <img src={backdrop} alt={title} className="absolute inset-0 size-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
      </section>

      <div className="container -mt-48 sm:-mt-64 relative z-10">
        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          <div className="hidden md:block">
            {poster && (
              <img
                src={poster}
                alt={title}
                className="w-full rounded-xl shadow-2xl border border-border"
              />
            )}
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              {m.tagline && <p className="text-sm uppercase tracking-widest text-brand font-semibold">{m.tagline}</p>}
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance">
                {title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {m.vote_average > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-foreground font-semibold">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    {m.vote_average.toFixed(1)}
                    <span className="text-muted-foreground font-normal">
                      ({m.vote_count.toLocaleString()})
                    </span>
                  </span>
                )}
                {(m.release_date || m.first_air_date) && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-4" /> {formatYear(m.release_date || m.first_air_date)}
                  </span>
                )}
                {m.runtime ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4" /> {formatRuntime(m.runtime)}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {m.genres?.map((g) => (
                  <Badge key={g.id} variant="secondary">{g.name}</Badge>
                ))}
              </div>
            </div>

            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">{m.overview}</p>

            <div className="hidden sm:flex flex-wrap gap-3">
              <Button size="lg" className="gap-2" onClick={() => setShowStream(true)}>
                <Play className="size-4 fill-current" /> Watch now
              </Button>
              {trailer && (
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2"
                  onClick={() => setShowTrailer(true)}
                >
                  <Film className="size-4" /> Trailer
                </Button>
              )}
              <Button
                size="lg"
                variant="secondary"
                className="gap-2"
                onClick={handleWatchlist}
                disabled={addWl.isPending || removeWl.isPending}
              >
                {inWatchlist ? (
                  <>
                    <Check className="size-4" /> In your list
                  </>
                ) : (
                  <>
                    <Plus className="size-4" /> Add to list
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={handleShare}>
                <Share2 className="size-4" /> Share
              </Button>
            </div>

            {cast.length > 0 && (
              <div className="space-y-3 pt-4">
                <h2 className="text-xl font-display font-bold">Cast</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                  {cast.map((c) => (
                    <div key={c.id} className="shrink-0 w-24 text-center">
                      <div className="aspect-square w-full overflow-hidden rounded-full bg-secondary border border-border ring-1 ring-transparent hover:ring-brand/40 transition">
                        {c.profile_path ? (
                          <img
                            src={tmdbImage(c.profile_path, "w185") ?? undefined}
                            alt={c.name}
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-xs text-muted-foreground">
                            {c.name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-xs font-semibold line-clamp-1">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{c.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="mt-16 space-y-4">
          <h2 className="text-2xl font-display font-bold">Reviews</h2>
          {isAuthenticated ? (
            <form onSubmit={submitReview} className="space-y-3 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Your rating: <span className="text-brand">{reviewRating}/10</span></span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="flex-1 max-w-xs accent-brand"
                />
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={`What did ${user?.username || "you"} think?`}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={!reviewText.trim() || postingReview}>
                  {postingReview ? "Posting…" : "Post review"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
              <a href={`/login?next=/movie/${m.id}`} className="text-brand font-semibold hover:underline">
                Sign in
              </a>{" "}
              to leave a review.
            </div>
          )}
          <div className="space-y-3">
            {reviewsQ.isLoading && <Skeleton className="h-24 w-full" />}
            {reviewsQ.data?.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">No reviews yet. Be the first.</p>
            )}
            {reviewsQ.data?.map((r) => (
              <div key={r._id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid place-items-center size-8 rounded-full bg-brand/10 text-brand font-bold text-sm">
                      {r.username.slice(0, 1).toUpperCase()}
                    </div>
                    <p className="font-semibold text-sm">{r.username}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="size-3 fill-yellow-400 text-yellow-400" /> {r.rating}/10
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        {similar.length > 0 && (
          <div className="mt-16 -mx-4 sm:-mx-[max(1rem,calc((100vw-1400px)/2+1rem))]">
            <MovieRow title="You might also like" movies={similar} />
          </div>
        )}
      </div>

      {/* Sticky mobile CTA */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl p-3 flex gap-2">
        <Button size="lg" className="flex-1 gap-2" onClick={() => setShowStream(true)}>
          <Play className="size-4 fill-current" /> Watch
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="flex-1 gap-2"
          onClick={handleWatchlist}
          disabled={addWl.isPending || removeWl.isPending}
        >
          {inWatchlist ? <Check className="size-4" /> : <Plus className="size-4" />}
          {inWatchlist ? "Saved" : "Save"}
        </Button>
        <Button size="lg" variant="outline" className="px-3" onClick={handleShare} aria-label="Share">
          <Share2 className="size-4" />
        </Button>
      </div>

      {showTrailer && trailer && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowTrailer(false)}
        >
          <div className="relative w-full max-w-5xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title={trailer.name}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="size-full rounded-lg"
            />
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 grid place-items-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close trailer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      <StreamPlayer
        open={showStream}
        onClose={() => setShowStream(false)}
        tmdbId={m.id}
        mediaType="movie"
        title={title}
      />
    </div>
  );
}
