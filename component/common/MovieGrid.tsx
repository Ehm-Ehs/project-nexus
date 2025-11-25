import React from 'react';
import MovieCard from './MovieCard';
import { Movie } from '../../types';

interface MovieGridProps {
  movies: Movie[];
  activeTab: string;
  favorites: Movie[];
  onToggleFavorite: (movie: Movie) => void;
}

const MovieGrid: React.FC<MovieGridProps> = ({ movies, activeTab, favorites, onToggleFavorite }) => {
  const getTitle = () => {
    if (activeTab === 'trending') return 'Trending Now';
    if (activeTab === 'recommended') return 'Recommended For You';
    return 'Your Favorites';
  };

  return (
    <div data-name="movie-grid" className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">{getTitle()}</h2>
        <span className="text-[var(--text-secondary)]">{movies.length} movies</span>
      </div>

      {movies.length === 0 ? (
        <div className="py-20 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-4 inline-block text-[var(--text-secondary)]"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <p className="text-xl text-[var(--text-secondary)]">
            No favorites yet. Start adding movies you love!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {movies.map((movie) => (
            <MovieCard
              key={movie.imdbID}
              movie={movie}
              isFavorite={favorites.some((fav) => fav.imdbID === movie.imdbID)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieGrid;