import { useState, useEffect, useCallback } from 'react';
import { Movie } from '../../types';
import { getFavorites, saveFavorites } from '../lib/movieService';
import useFirebaseAuth from './useAuth';

export function useFavorites() {
    const [favorites, setFavorites] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useFirebaseAuth();

    const fetchFavorites = useCallback(async () => {
        try {
            setLoading(true);
            const favs = await getFavorites();
            setFavorites(favs);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    }, [user]); // Re-fetch when user changes (e.g. sign in/out)

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const toggleFavorite = useCallback(async (movie: Movie) => {
        setFavorites((prev) => {
            const isFavorite = prev.some((fav) => fav.imdbID === movie.imdbID);
            let newFavorites;
            if (isFavorite) {
                newFavorites = prev.filter((fav) => fav.imdbID !== movie.imdbID);
            } else {
                newFavorites = [...prev, movie];
            }

            // Persist changes
            saveFavorites(newFavorites);
            return newFavorites;
        });
    }, []);

    const isFavorite = useCallback((movieId: string) => {
        return favorites.some((fav) => fav.imdbID === movieId);
    }, [favorites]);

    return {
        favorites,
        loading,
        toggleFavorite,
        isFavorite,
        refreshFavorites: fetchFavorites
    };
}
