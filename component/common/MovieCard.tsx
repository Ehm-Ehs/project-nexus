import React from 'react';
import Image from 'next/image';
import { Movie } from '../../types';

interface MovieCardProps {
  movie: Movie;
  isFavorite?: boolean;
  onToggleFavorite?: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, isFavorite = false, onToggleFavorite }) => {
  return (
    <div className="group relative flex flex-col gap-2 rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md">
        <Image
          src={movie.Poster}
          alt={movie.Title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(movie);
            }}
            className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isFavorite ? "text-red-500" : "text-white"}
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="truncate text-lg font-semibold text-white" title={movie.Title}>
          {movie.Title}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{movie.Year}</span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span>{movie.imdbRating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;