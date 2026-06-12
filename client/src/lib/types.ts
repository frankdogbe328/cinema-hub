export type MediaType = "movie" | "tv";

export interface Movie {
  id: number;
  title: string;
  name?: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  media_type?: MediaType;
  popularity?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface MovieDetail extends Movie {
  runtime: number | null;
  genres: Genre[];
  tagline: string | null;
  status: string;
  budget?: number;
  revenue?: number;
  homepage?: string;
  credits?: { cast: CastMember[] };
  videos?: { results: Video[] };
  similar?: { results: Movie[] };
}

export interface TmdbList<T = Movie> {
  page: number;
  total_pages: number;
  total_results: number;
  results: T[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  isVerified: boolean;
  picture?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
  };
  preferences?: {
    favoriteGenres?: number[];
    language?: string;
    notifications?: boolean;
  };
}

export interface WatchlistItem {
  _id?: string;
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  addedAt: string;
  watched: boolean;
  userRating?: number;
}

export interface Review {
  _id: string;
  userId: string;
  username: string;
  tmdbId: number;
  rating: number;
  text: string;
  likes: number;
  helpful: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
