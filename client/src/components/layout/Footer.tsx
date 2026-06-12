import { Link } from "react-router-dom";
import { LogoLockup } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/30">
      <div className="container py-10 grid gap-6 md:grid-cols-[1fr_auto] items-start">
        <div>
          <Link to="/" aria-label="CinemaHub home">
            <LogoLockup size="sm" />
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
      <div className="border-t border-border/60 py-5 px-4 text-center space-y-1.5">
        <p className="text-[12px] sm:text-xs text-muted-foreground">
          © {new Date().getFullYear()} CinemaHub by Frank Dogbe. All rights reserved.
        </p>
        <p className="text-[11px] sm:text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
          Developed &amp; Powered by{" "}
          <span className="font-brand font-bold tracking-tight normal-case text-foreground">
            Softvara<span className="text-brand">.</span>
          </span>
        </p>
      </div>
    </footer>
  );
}
