import { Movie } from '../types';

const OMDB_BASE_URL = process.env.NEXT_PUBLIC_OMDB_BASE_URL
const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY
const FAVORITES_KEY = 'movie_favorites';

const trendingImdbIds = [
    'tt15398776', 'tt5433140', 'tt27489053',
    'tt10648342', 'tt14230458', 'tt9362722'
];

const recommendedImdbIds = [
    'tt1517268', 'tt0816692', 'tt13320622',
    'tt1160419', 'tt0468569', 'tt0133093'
];

export async function fetchMovieById(imdbId: string): Promise<Movie | null> {
    try {
        const response = await fetch(`${OMDB_BASE_URL}?i=${imdbId}&apikey=${OMDB_API_KEY}`);
        const data = await response.json();

        if (data.Response === 'True') {
            return data as Movie;
        }
        return null;
    } catch (error) {
        console.error('Error fetching movie:', error);
        return null;
    }
}

export async function fetchTrendingMovies(): Promise<Movie[]> {
    const promises = trendingImdbIds.map((id) => fetchMovieById(id));
    const results = await Promise.all(promises);
    return results.filter((movie): movie is Movie => movie !== null);
}

export async function fetchRecommendedMovies(): Promise<Movie[]> {
    const promises = recommendedImdbIds.map((id) => fetchMovieById(id));
    const results = await Promise.all(promises);
    return results.filter((movie): movie is Movie => movie !== null);
}

export function saveFavorites(favorites: Movie[]): void {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        }
    } catch (error) {
        console.error('Error saving favorites:', error);
    }
}

export function getFavorites(): Movie[] {
    try {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(FAVORITES_KEY);
            return stored ? JSON.parse(stored) : [];
        }
        return [];
    } catch (error) {
        console.error('Error loading favorites:', error);
        return [];
    }
}

export function clearFavorites(): void {
    try {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(FAVORITES_KEY);
        }
    } catch (error) {
        console.error('Error clearing favorites:', error);
    }
}
