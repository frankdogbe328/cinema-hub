import { Link } from "react-router-dom";
import { Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/30">
      <div className="container py-10 grid gap-6 md:grid-cols-[1fr_auto] items-start">
        <div>
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="grid place-items-center h-8 w-8 rounded-md bg-brand text-white">
              <Film className="size-4" />
            </span>
            <span className="font-semibold">CinemaHub</span>
          </Link>
          <p className="mt-3 max-w-md text-[14px] sm:text-sm text-muted-foreground leading-relaxed">
            Discover, stream and download movies. Catalog powered by TMDB.
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
        <div className="flex gap-6 sm:gap-8 text-[13px] sm:text-sm text-muted-foreground">
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Browse</p>
            <Link to="/" className="block hover:text-foreground py-0.5">Home</Link>
            <Link to="/search" className="block hover:text-foreground py-0.5">Search</Link>
            <Link to="/watchlist" className="block hover:text-foreground py-0.5">My List</Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Account</p>
            <Link to="/login" className="block hover:text-foreground py-0.5">Sign in</Link>
            <Link to="/register" className="block hover:text-foreground py-0.5">Create account</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-[12px] sm:text-xs text-muted-foreground px-4">
        © {new Date().getFullYear()} CinemaHub by Frank Dogbe. All rights reserved.
      </div>
    </footer>
  );
}
