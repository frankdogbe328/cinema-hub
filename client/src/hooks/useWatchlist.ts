import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { WatchlistItem } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

export function useWatchlist() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["watchlist"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await api.get<{ items: WatchlistItem[] }>("/watchlist");
      return data.items;
    },
  });
}

export function useWatchlistMutations() {
  const qc = useQueryClient();

  const add = useMutation({
    mutationFn: async (item: Omit<WatchlistItem, "_id" | "addedAt" | "watched">) => {
      const { data } = await api.post<{ item: WatchlistItem }>("/watchlist", item);
      return data.item;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  const remove = useMutation({
    mutationFn: async (tmdbId: number) => {
      await api.delete(`/watchlist/${tmdbId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  const toggleWatched = useMutation({
    mutationFn: async ({ tmdbId, watched }: { tmdbId: number; watched: boolean }) => {
      await api.put(`/watchlist/${tmdbId}`, { watched });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  return { add, remove, toggleWatched };
}
