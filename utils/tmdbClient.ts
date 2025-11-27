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

// Helper to map TMDB movie to our Movie interface
const mapTmdbToMovie = (tmdbMovie: any): any => {
    return {
        Title: tmdbMovie.title,
        Year: tmdbMovie.release_date ? tmdbMovie.release_date.split('-')[0] : 'N/A',
        Poster: tmdbMovie.poster_path ? getTmdbImageUrl(tmdbMovie.poster_path) : null,
        Plot: tmdbMovie.overview,
        imdbRating: tmdbMovie.vote_average ? tmdbMovie.vote_average.toFixed(1) : 'N/A',
        imdbID: tmdbMovie.id.toString(), // Using TMDB ID as ID
        // Default/Missing fields
        Rated: 'N/A',
        Released: tmdbMovie.release_date || 'N/A',
        Runtime: 'N/A',
        Genre: 'N/A', // We could map genre_ids if we had the list
        Director: 'N/A',
        Writer: 'N/A',
        Actors: 'N/A',
        Language: tmdbMovie.original_language || 'en',
        Country: 'N/A',
        Awards: 'N/A',
        Ratings: [],
        Metascore: 'N/A',
        imdbVotes: tmdbMovie.vote_count ? tmdbMovie.vote_count.toString() : '0',
        Type: 'movie',
        DVD: 'N/A',
        BoxOffice: 'N/A',
        Production: 'N/A',
        Website: 'N/A',
        Response: 'True',
        // Extended fields
        moods: [], // To be populated if possible
        contentFlags: tmdbMovie.adult ? ['Adult'] : [],
        isHiddenGem: tmdbMovie.vote_count < 1000 && tmdbMovie.vote_average > 7,
    };
};

export const getPopularMovies = async () => {
    const response = await tmdbClient.get('/movie/popular');
    return { ...response.data, results: response.data.results.map(mapTmdbToMovie) };
};

export const searchMovies = async (query: string) => {
    const response = await tmdbClient.get('/search/movie', {
        params: { query },
    });
    return { ...response.data, results: response.data.results.map(mapTmdbToMovie) };
};

export const getMovieDetails = async (movieId: string) => {
    const response = await tmdbClient.get(`/movie/${movieId}`);
    return mapTmdbToMovie(response.data);
};

export const getPopularTVShows = async () => {
    const response = await tmdbClient.get('/tv/popular');
    // We might need a separate mapper for TV shows or adapt the existing one
    return response.data;
};

export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'week') => {
    const response = await tmdbClient.get(`/trending/movie/${timeWindow}`);
    return { ...response.data, results: response.data.results.map(mapTmdbToMovie) };
};

const MOOD_TO_GENRE: Record<string, number[]> = {
    'happy': [35, 10751, 16], // Comedy, Family, Animation
    'cozy': [10751, 10749],   // Family, Romance
    'dark': [27, 53, 80],     // Horror, Thriller, Crime
    'intense': [28, 53, 10752], // Action, Thriller, War
    'heartwarming': [18, 10749], // Drama, Romance
    'mind-bending': [878, 9648], // Sci-Fi, Mystery
    'whimsical': [14, 16],    // Fantasy, Animation
    'peaceful': [99, 36],     // Documentary, History
};

export const getPersonalizedMovies = async (preferences: any) => {
    const { moods, likedMovies } = preferences;

    // If we have liked movies, try to get recommendations based on the most recent one
    // and filter by mood genres if possible.
    if (likedMovies && likedMovies.length > 0) {
        try {
            // Pick the last liked movie (assuming it's the most recent interest)
            const lastLikedMovie = likedMovies[likedMovies.length - 1];
            // If it's an object with imdbID, we might need to search for it or if we have TMDB ID.
            // Assuming likedMovies stores full movie objects or at least IDs. 
            // If they are OMDb movies, they might not have TMDB IDs directly.
            // But let's assume for now we can use the ID if it's a TMDB ID, or we skip this if it's not compatible.

            // However, the current app seems to use OMDb for some things and TMDB for others.
            // If likedMovies comes from OMDb, we might not have a TMDB ID.
            // Let's fallback to Moods if we can't easily use likedMovies.

            // Actually, let's try to use Moods as the primary filter, but maybe use keywords from liked movies if we could.
            // Given the complexity of mapping OMDb IDs to TMDB, let's stick to a robust Mood-based discovery
            // but we will add a "similar to" feature later if we unify the IDs.

            // User asked for "mood plus selected movies". 
            // Let's try to fetch recommendations for a movie if we have a valid numeric ID (TMDB).
            const tmdbId = typeof lastLikedMovie === 'number' ? lastLikedMovie : (lastLikedMovie.id || lastLikedMovie.tmdbID);

            if (tmdbId && typeof tmdbId === 'number') {
                const response = await tmdbClient.get(`/movie/${tmdbId}/recommendations`);
                // Filter these recommendations by Mood Genres if we want to be strict,
                // or just return them as "Because you liked [Movie]".
                // Let's return them, but maybe filter by the mood genres if they exist.

                const moodGenres = new Set<number>();
                if (moods) {
                    moods.forEach((mood: string) => {
                        const genres = MOOD_TO_GENRE[mood];
                        if (genres) genres.forEach(id => moodGenres.add(id));
                    });
                }

                let results = response.data.results;
                if (moodGenres.size > 0) {
                    const filtered = results.filter((m: any) =>
                        m.genre_ids.some((id: number) => moodGenres.has(id))
                    );
                    if (filtered.length > 0) {
                        results = filtered;
                    }
                }

                return { ...response.data, results: results.map(mapTmdbToMovie) };
            }
        } catch (e) {
            console.error("Error fetching recommendations for liked movie", e);
        }
    }

    if (!moods || moods.length === 0) return getPopularMovies();

    // Collect all genre IDs from selected moods
    const genreIds = new Set<number>();
    moods.forEach((mood: string) => {
        const genres = MOOD_TO_GENRE[mood];
        if (genres) {
            genres.forEach(id => genreIds.add(id));
        }
    });

    if (genreIds.size === 0) return getPopularMovies();

    // Fetch movies with these genres (OR logic: separate by pipe |)
    const genreString = Array.from(genreIds).join('|');

    // Randomize page to get fresh content (1-5)
    const randomPage = Math.floor(Math.random() * 5) + 1;

    try {
        const response = await tmdbClient.get('/discover/movie', {
            params: {
                with_genres: genreString,
                sort_by: 'vote_average.desc', // High rated
                'vote_count.gte': 200, // Significant votes
                include_adult: false,
                page: randomPage,
            }
        });
        return { ...response.data, results: response.data.results.map(mapTmdbToMovie) };
    } catch (error) {
        console.error("Error fetching personalized movies:", error);
        return getPopularMovies(); // Fallback
    }
};

export const getPersonalizedTrending = async (preferences: any) => {
    const { moods } = preferences;
    if (!moods || moods.length === 0) return getTrendingMovies();

    const genreIds = new Set<number>();
    moods.forEach((mood: string) => {
        const genres = MOOD_TO_GENRE[mood];
        if (genres) {
            genres.forEach(id => genreIds.add(id));
        }
    });

    if (genreIds.size === 0) return getTrendingMovies();

    const genreString = Array.from(genreIds).join('|');

    // Get date 1 year ago for "Recent"
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    const dateString = date.toISOString().split('T')[0];

    // Randomize page to get fresh content (1-5)
    const randomPage = Math.floor(Math.random() * 5) + 1;

    try {
        const response = await tmdbClient.get('/discover/movie', {
            params: {
                with_genres: genreString,
                sort_by: 'popularity.desc',
                'primary_release_date.gte': dateString,
                'vote_count.gte': 50,
                include_adult: false,
                page: randomPage,
            }
        });
        return { ...response.data, results: response.data.results.map(mapTmdbToMovie) };
    } catch (error) {
        console.error("Error fetching personalized trending:", error);
        return getTrendingMovies();
    }
};
