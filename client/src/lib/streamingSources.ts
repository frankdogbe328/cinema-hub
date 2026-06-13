// Movie/TV streaming embed registry.
// Each provider takes a TMDB id and returns an iframe URL.
// Ordered by current reliability (Dec 2026). If a provider goes dark we
// just remove it; users fall through to the next.

export type Tier = "primary" | "hd" | "backup";

export interface StreamSource {
  id: string;
  name: string;
  tagline?: string;
  tier: Tier;
  movie: (tmdbId: number | string) => string;
  tv?: (tmdbId: number | string, season: number, episode: number) => string;
}

export const STREAM_SOURCES: StreamSource[] = [
  // --- PRIMARY (newest + most reliable as of late 2026) ---
  {
    id: "vidking",
    name: "Server 1",
    tagline: "VidKing · HD",
    tier: "primary",
    movie: (id) => `https://www.vidking.net/embed/movie/${id}?color=e50914&autoPlay=true`,
    tv: (id, s, e) => `https://www.vidking.net/embed/tv/${id}/${s}/${e}?color=e50914&autoPlay=true`,
  },
  {
    id: "videasy",
    name: "Server 2",
    tagline: "Videasy · Fast",
    tier: "primary",
    movie: (id) => `https://player.videasy.net/movie/${id}?color=e50914`,
    tv: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}?color=e50914`,
  },
  {
    id: "embedsu",
    name: "Server 3",
    tagline: "Embed.su · HD",
    tier: "primary",
    movie: (id) => `https://embed.su/embed/movie/${id}`,
    tv: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidsrc-cc-v3",
    name: "Server 4",
    tagline: "VidSrc · v3",
    tier: "primary",
    movie: (id) => `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=true`,
    tv: (id, s, e) => `https://vidsrc.cc/v3/embed/tv/${id}/${s}/${e}?autoPlay=true`,
  },
  {
    id: "vidlink",
    name: "Server 5",
    tagline: "VidLink · 4K",
    tier: "primary",
    movie: (id) => `https://vidlink.pro/movie/${id}?primaryColor=e50914&secondaryColor=ffffff&autoplay=true`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=e50914&autoplay=true`,
  },

  // --- HD (good quality, may have a popup or ads) ---
  {
    id: "111movies",
    name: "Server 6",
    tagline: "111Movies",
    tier: "hd",
    movie: (id) => `https://111movies.com/movie/${id}`,
    tv: (id, s, e) => `https://111movies.com/tv/${id}/${s}/${e}`,
  },
  {
    id: "autoembed",
    name: "Server 7",
    tagline: "AutoEmbed",
    tier: "hd",
    movie: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    tv: (id, s, e) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidsrc-to",
    name: "Server 8",
    tagline: "VidSrc.to",
    tier: "hd",
    movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidsrc-xyz",
    name: "Server 9",
    tagline: "VidSrc.xyz",
    tier: "hd",
    movie: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: "moviesapi",
    name: "Server 10",
    tagline: "MoviesAPI",
    tier: "hd",
    movie: (id) => `https://moviesapi.club/movie/${id}`,
    tv: (id, s, e) => `https://moviesapi.club/tv/${id}-${s}-${e}`,
  },

  // --- BACKUP (last resort, mirrors) ---
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
    id: "fsapi",
    name: "Server 15",
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
