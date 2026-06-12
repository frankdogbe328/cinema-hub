import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Film, Search as SearchIcon, Bookmark, User as UserIcon, LogOut, LogIn, Menu, X, Home, Compass } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/watchlist", label: "My List", icon: Bookmark },
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);

  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ("");
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          isHome && !scrolled
            ? "bg-gradient-to-b from-black/60 to-transparent border-transparent"
            : "bg-background/80 backdrop-blur-xl border-b border-border/60"
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <span className="grid place-items-center h-9 w-9 rounded-md bg-brand text-white shadow-lg shadow-brand/30 group-hover:scale-105 transition-transform">
                <Film className="size-5" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight">
                Cinema<span className="text-brand">Hub</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((item) => (
                <NavItem key={item.to} to={item.to} label={item.label} />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            {searchOpen ? (
              <form onSubmit={submitSearch} className="hidden md:flex items-center gap-1 animate-fade-in">
                <Input
                  ref={searchRef}
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search movies…"
                  className="h-9 w-64"
                  onBlur={() => !searchQ && setSearchOpen(false)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQ("");
                  }}
                  aria-label="Close search"
                >
                  <X className="size-4" />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="hidden md:flex"
              >
                <SearchIcon className="size-5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/search")}
              aria-label="Search"
              className="md:hidden"
            >
              <SearchIcon className="size-5" />
            </Button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="grid place-items-center h-9 w-9 rounded-full bg-secondary border border-border overflow-hidden hover:ring-2 hover:ring-brand/50 transition"
                  aria-label="Profile menu"
                >
                  {user?.picture || user?.profile?.avatar ? (
                    <img
                      src={user.picture || user.profile?.avatar}
                      alt={user.username}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold uppercase">
                      {(user?.username || user?.email || "U").slice(0, 1)}
                    </span>
                  )}
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-12 z-40 w-60 rounded-lg border border-border bg-card shadow-2xl backdrop-blur-xl animate-fade-in">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold truncate">{user?.username}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <MenuItem to="/profile" icon={<UserIcon className="size-4" />} onClick={() => setMenuOpen(false)}>
                        Profile
                      </MenuItem>
                      <MenuItem to="/watchlist" icon={<Bookmark className="size-4" />} onClick={() => setMenuOpen(false)}>
                        Watchlist
                      </MenuItem>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent text-destructive border-t border-border"
                      >
                        <LogOut className="size-4" /> Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button asChild size="sm" className="gap-2 hidden sm:inline-flex">
                <Link to="/login">
                  <LogIn className="size-4" /> Sign in
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
              className="md:hidden"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-80 max-w-full bg-card border-l border-border shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-display text-lg font-bold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close">
                <X className="size-5" />
              </Button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                        isActive ? "bg-brand text-white" : "text-foreground hover:bg-accent"
                      )
                    }
                  >
                    <Icon className="size-5" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
            <div className="p-4 border-t border-border">
              {isAuthenticated ? (
                <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
                  <LogOut className="size-4" /> Log out
                </Button>
              ) : (
                <Button asChild className="w-full gap-2">
                  <Link to="/login">
                    <LogIn className="size-4" /> Sign in
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "relative px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && (
            <span className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-brand rounded-full" />
          )}
        </>
      )}
    </NavLink>
  );
}

function MenuItem({
  to,
  icon,
  children,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}
