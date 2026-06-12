// Movie/TV streaming embed registry.
// Each provider takes a TMDB id and returns an iframe URL.
// 16 servers across 3 tiers — if a movie isn't on one server it's almost
// certainly on another. Auto-fallback kicks in after an 8s stall.

export type Tier = "primary" | "hd" | "backup";

export interface StreamSource {
  id: string;
  name: string;
  tagline?: string;
  tier: Tier;
  movie: (tmdbId: number | string) => string;
  tv?: (tmdbId: number | string, season: number, episode: number) => string;
}

// Ordered roughly by current reliability + speed. First server = default.
export const STREAM_SOURCES: StreamSource[] = [
  // --- PRIMARY (fastest, lowest ad load, most reliable) ---
  {
    id: "embedsu",
    name: "Server 1",
    tagline: "Embed.su · HD",
    tier: "primary",
    movie: (id) => `https://embed.su/embed/movie/${id}`,
    tv: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidsrc-cc-v3",
    name: "Server 2",
    tagline: "VidSrc · v3",
    tier: "primary",
    movie: (id) => `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=true`,
    tv: (id, s, e) => `https://vidsrc.cc/v3/embed/tv/${id}/${s}/${e}?autoPlay=true`,
  },
  {
    id: "vidlink",
    name: "Server 3",
    tagline: "VidLink · 4K",
    tier: "primary",
    movie: (id) => `https://vidlink.pro/movie/${id}?primaryColor=e50914&secondaryColor=ffffff&autoplay=true`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=e50914&autoplay=true`,
  },
  {
    id: "vidsrc-dev",
    name: "Server 4",
    tagline: "VidSrc.dev",
    tier: "primary",
    movie: (id) => `https://vidsrc.dev/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.dev/embed/tv/${id}/${s}/${e}`,
  },

  // --- HD (good quality, may have a popup or brief ads) ---
  {
    id: "111movies",
    name: "Server 5",
    tagline: "111Movies",
    tier: "hd",
    movie: (id) => `https://111movies.com/movie/${id}`,
    tv: (id, s, e) => `https://111movies.com/tv/${id}/${s}/${e}`,
  },
  {
    id: "autoembed",
    name: "Server 6",
    tagline: "AutoEmbed",
    tier: "hd",
    movie: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    tv: (id, s, e) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidsrc-to",
    name: "Server 7",
    tagline: "VidSrc.to",
    tier: "hd",
    movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidsrc-xyz",
    name: "Server 8",
    tagline: "VidSrc.xyz",
    tier: "hd",
    movie: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: "nontongo",
    name: "Server 9",
    tagline: "Nontongo",
    tier: "hd",
    movie: (id) => `https://www.nontongo.win/embed/movie/${id}`,
    tv: (id, s, e) => `https://www.nontongo.win/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "moviesapi",
    name: "Server 10",
    tagline: "MoviesAPI",
    tier: "hd",
    movie: (id) => `https://moviesapi.club/movie/${id}`,
    tv: (id, s, e) => `https://moviesapi.club/tv/${id}-${s}-${e}`,
  },

  // --- BACKUP (aggregators, mirrors, last-resort) ---
  {
    id: "multiembed",
    name: "Server 11",
    tagline: "MultiEmbed",
    tier: "backup",
    movie: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    id: "superembed",
    name: "Server 12",
    tagline: "SuperEmbed",
    tier: "backup",
    movie: (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
    tv: (id, s, e) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    id: "2embed",
    name: "Server 13",
    tagline: "2Embed",
    tier: "backup",
    movie: (id) => `https://www.2embed.cc/embed/${id}`,
    tv: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    id: "smashystream",
    name: "Server 14",
    tagline: "Smashy",
    tier: "backup",
    movie: (id) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
    tv: (id, s, e) => `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: "frembed",
    name: "Server 15",
    tagline: "Frembed",
    tier: "backup",
    movie: (id) => `https://frembed.xyz/api/film.php?id=${id}`,
    tv: (id, s, e) => `https://frembed.xyz/api/serie.php?id=${id}&sa=${s}&epi=${e}`,
  },
  {
    id: "fsapi",
    name: "Server 16",
    tagline: "FSAPI",
    tier: "backup",
    movie: (id) => `https://fsapi.xyz/movie/${id}`,
    tv: (id, s, e) => `https://fsapi.xyz/tv-tmdb/${id}-${s}-${e}`,
  },
];

export const TIER_LABEL: Record<Tier, string> = {
  primary: "HD · Fastest",
  hd: "HD · Backup",
  backup: "Mirrors",
};
