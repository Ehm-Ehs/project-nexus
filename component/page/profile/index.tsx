import { useState, useEffect } from 'react';
import { FaHeart, FaFilm, FaGlobe, FaStar, FaChartLine } from 'react-icons/fa';
import type { UserPreferences } from '../../../types';
import { getMovieDetails } from '../../../utils/tmdbClient';

type TasteProfileProps = {
  preferences: UserPreferences;
};

type MovieDetails = {
  id: number;
  title: string;
  genres: { id: number; name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  // TMDB doesn't provide moods directly, we might infer or skip
};

export function TasteProfile({ preferences }: TasteProfileProps) {
  const [movies, setMovies] = useState<MovieDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedMovies = async () => {
      if (!preferences.likedMovies.length) {
        setLoading(false);
        return;
      }

      try {
        const promises = preferences.likedMovies.map(id => getMovieDetails(id));
        const results = await Promise.all(promises);
        setMovies(results);
      } catch (error) {
        console.error('Error fetching profile movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedMovies();
  }, [preferences.likedMovies]);

  // Calculate stats
  const genreCounts = movies.reduce((acc, movie) => {
    movie.genres?.forEach((genre) => {
      acc[genre.name] = (acc[genre.name] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([genre]) => genre);

  const countryCounts = movies.reduce((acc, movie) => {
    movie.production_countries?.forEach((country) => {
      acc[country.name] = (acc[country.name] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([country]) => country);

  // Moods are not available in standard TMDB details, so we'll skip or use preferences.moods directly if available
  const topMoods = preferences.moods || [];

  if (loading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-neutral-900 mb-2">Your Taste Profile</h1>
          <p className="text-neutral-600">
            Your unique cinematic fingerprint, automatically generated from your preferences
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaHeart className="w-5 h-5 text-red-500" />
              <span className="text-neutral-600">Loved</span>
            </div>
            <div className="text-neutral-900">{preferences.likedMovies.length}</div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaFilm className="w-5 h-5 text-purple-500" />
              <span className="text-neutral-600">Genres</span>
            </div>
            <div className="text-neutral-900">{topGenres.length}</div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaGlobe className="w-5 h-5 text-blue-500" />
              <span className="text-neutral-600">Countries</span>
            </div>
            <div className="text-neutral-900">{topCountries.length}</div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaStar className="w-5 h-5 text-yellow-500" />
              <span className="text-neutral-600">Moods</span>
            </div>
            <div className="text-neutral-900">{topMoods.length}</div>
          </div>
        </div>

        {/* Favorite Moods */}
        {topMoods.length > 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FaStar className="w-5 h-5 text-purple-600" />
              <h2 className="text-neutral-900">Favorite Moods</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {topMoods.map((mood, index) => (
                <div
                  key={mood}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg capitalize"
                >
                  #{index + 1} {mood}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Genres */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilm className="w-5 h-5 text-purple-600" />
            <h2 className="text-neutral-900">Top Genres</h2>
          </div>
          <div className="space-y-3">
            {topGenres.map((genre, index) => {
              const count = genreCounts[genre];
              const percentage = (count / movies.length) * 100;
              return (
                <div key={genre}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-neutral-700">{genre}</span>
                    <span className="text-neutral-500">{count} movies</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {topGenres.length === 0 && (
              <p className="text-neutral-500">Rate more movies to discover your favorite genres</p>
            )}
          </div>
        </div>

        {/* Top Directors */}
        {/* Removed as director data is not available from TMDB movie details */}

        {/* Regional Preferences */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaGlobe className="w-5 h-5 text-purple-600" />
            <h2 className="text-neutral-900">Regional Preferences</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {topCountries.map((country) => {
              const count = countryCounts[country];
              return (
                <div
                  key={country}
                  className="p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="text-green-700">{country}</div>
                  <div className="text-green-600">{count} movies</div>
                </div>
              );
            })}
            {topCountries.length === 0 && (
              <p className="text-neutral-500 col-span-full">
                Rate more movies to discover your regional preferences
              </p>
            )}
          </div>
        </div>

        {/* What Makes Your Taste Unique */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
          <h2 className="text-neutral-900 mb-4">What Makes Your Taste Unique</h2>
          <div className="space-y-3">
            {topCountries.length > 3 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                <p className="text-neutral-700">
                  You appreciate international cinema from diverse cultures
                </p>
              </div>
            )}
            {preferences.moods.length > 4 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                <p className="text-neutral-700">
                  You're versatile and enjoy a wide range of moods and vibes
                </p>
              </div>
            )}
            {topCountries.length <= 3 &&
             preferences.moods.length <= 4 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                <p className="text-neutral-700">
                  Keep rating movies to build your unique taste profile
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Preferences Settings */}
        <div className="mt-8 bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-neutral-900 mb-4">Your Settings</h2>
          <div className="space-y-4">
            <div>
              <div className="text-neutral-700 mb-2">Languages</div>
              <div className="flex flex-wrap gap-2">
                {preferences.languages.map((lang: string) => (
                  <span key={lang} className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-lg">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            
            {preferences.contentRestrictions.length > 0 && (
              <div>
                <div className="text-neutral-700 mb-2">Content Filters</div>
                <div className="flex flex-wrap gap-2">
                  {preferences.contentRestrictions.map((restriction: string) => (
                    <span key={restriction} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg capitalize">
                      {restriction.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
