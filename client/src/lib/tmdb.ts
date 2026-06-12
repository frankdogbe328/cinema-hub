import { api } from "./api";
import type { MovieDetail, TmdbList, Genre } from "./types";

export const tmdb = {
  trending: async (window: "day" | "week" = "week") => {
    const { data } = await api.get<TmdbList>(`/tmdb/trending/${window}`);
    return data;
  },
  movie: async (id: number | string) => {
    const { data } = await api.get<MovieDetail>(`/tmdb/movie/${id}`);
    return data;
  },
  search: async (q: string, page = 1) => {
    const { data } = await api.get<TmdbList>(`/tmdb/search`, { params: { q, page } });
    return data;
  },
  discover: async (params: {
    with_genres?: string;
    sort_by?: string;
    year?: number;
    page?: number;
  } = {}) => {
    const { data } = await api.get<TmdbList>(`/tmdb/discover`, { params });
    return data;
  },
  topRated: async (page = 1) => {
    const { data } = await api.get<TmdbList>(`/tmdb/top-rated`, { params: { page } });
    return data;
  },
  popular: async (page = 1) => {
    const { data } = await api.get<TmdbList>(`/tmdb/popular`, { params: { page } });
    return data;
  },
  genres: async () => {
    const { data } = await api.get<{ genres: Genre[] }>(`/tmdb/genres`);
    return data.genres;
  },
};
