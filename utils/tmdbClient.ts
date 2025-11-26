import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_READ_ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN;

export const tmdbClient = axios.create({
    baseURL: TMDB_BASE_URL,
    headers: {
        Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
    },
});

// Helper to check if token is configured
export const isTmdbConfigured = () => !!TMDB_READ_ACCESS_TOKEN;

export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export type TmdbImageSize = 'w200' | 'w300' | 'w500' | 'original';

export const getTmdbImageUrl = (path: string, size: TmdbImageSize = 'w500') => {
    if (!path) return '';
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getPopularMovies = async () => {
    const response = await tmdbClient.get('/movie/popular');
    return response.data;
};

export const searchMovies = async (query: string) => {
    const response = await tmdbClient.get('/search/movie', {
        params: { query },
    });
    return response.data;
};

export const getMovieDetails = async (movieId: string) => {
    const response = await tmdbClient.get(`/movie/${movieId}`);
    return response.data;
};

export const getPopularTVShows = async () => {
    const response = await tmdbClient.get('/tv/popular');
    return response.data;
};

export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'week') => {
    const response = await tmdbClient.get(`/trending/movie/${timeWindow}`);
    return response.data;
};
