import {
    tmdbClient,
    isTmdbConfigured,
    getPopularMovies,
    searchMovies,
    getMovieDetails,
    getPopularTVShows,
    getTrendingMovies,
    getTmdbImageUrl
} from './utils/tmdbClient';

async function testConnection() {
    if (!isTmdbConfigured()) {
        console.error('TMDB_READ_ACCESS_TOKEN is not configured!');
        return;
    }

    try {
        console.log('--- Testing TMDB Integration ---');

        // 1. Popular Movies
        console.log('\n1. Fetching Popular Movies...');
        const popularMovies = await getPopularMovies();
        console.log(`   Success! Found ${popularMovies.results.length} movies.`);
        console.log(`   Top movie: ${popularMovies.results[0].title}`);

        // 2. Search Movies (Batman)
        console.log('\n2. Searching for "Batman"...');
        const searchResults = await searchMovies('Batman');
        console.log(`   Success! Found ${searchResults.results.length} results.`);
        console.log(`   First result: ${searchResults.results[0].title}`);

        // 3. Movie Details (ID 11 - Star Wars)
        console.log('\n3. Fetching Details for Movie ID 11...');
        const movieDetails = await getMovieDetails('11');
        console.log(`   Success! Title: ${movieDetails.title}`);

        // 4. Popular TV Shows
        console.log('\n4. Fetching Popular TV Shows...');
        const popularTV = await getPopularTVShows();
        console.log(`   Success! Found ${popularTV.results.length} shows.`);
        console.log(`   Top show: ${popularTV.results[0].name}`);

        // 5. Trending Movies (Week)
        console.log('\n5. Fetching Trending Movies (Week)...');
        const trending = await getTrendingMovies('week');
        console.log(`   Success! Found ${trending.results.length} trending items.`);
        console.log(`   Top trending: ${trending.results[0].title}`);

        // 6. Image URL Helper
        console.log('\n6. Testing Image URL Helper...');
        const posterPath = popularMovies.results[0].poster_path;
        const imageUrl = getTmdbImageUrl(posterPath, 'w500');
        console.log(`   Generated URL: ${imageUrl}`);

        console.log('\n--- All Tests Passed! ---');

    } catch (error) {
        console.error('Error connecting to TMDB:', error);
    }
}

testConnection();
