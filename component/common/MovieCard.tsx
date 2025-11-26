import React, { useState } from 'react';
import Image from 'next/image';
import { Movie } from '../../types';
import { Lightbulb, Clock, Meh, X, ThumbsUp, ThumbsDown } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  isFavorite?: boolean;
  onToggleFavorite?: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, isFavorite = false, onToggleFavorite }) => {
  const [feedback, setFeedback] = useState<'neutral' | 'more' | 'hide' | null>(null);

  const handleFeedback = (type: 'neutral' | 'more' | 'hide') => {
    setFeedback(type);
    // In a real app, this would call an API
    setTimeout(() => setFeedback(null), 2000);
  };

  const getRecommendationReason = () => {
    if (movie.isHiddenGem) return "Hidden Gem";
    if (movie.moods?.includes('thought-provoking')) return "Matches your mood";
    return "Recommended for you";
  };

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
            {isFavorite ? <ThumbsUp className="w-5 h-5 text-green-500" /> : <ThumbsUp className="w-5 h-5 text-white" />}
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="truncate text-lg font-semibold text-white" title={movie.Title}>
          {movie.Title}
        </h3>
        
        {/* Recommendation Reason */}
        <div className="flex items-start gap-2 mb-3 text-purple-400 bg-purple-500/10 px-3 py-2 rounded-lg">
          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{getRecommendationReason()}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>{movie.Year}</span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span>{movie.imdbRating}</span>
          </div>
        </div>

        {/* Moods */}
        {movie.moods && movie.moods.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {movie.moods.slice(0, 3).map((mood) => (
              <span
                key={mood}
                className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded capitalize"
              >
                {mood}
              </span>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="flex flex-wrap gap-4 mb-3 text-gray-400 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{movie.length ? `${movie.length} min` : movie.Runtime}</span>
            {movie.pacing && <span> · {movie.pacing}</span>}
          </div>
        </div>

        {/* Content Flags */}
        {movie.contentFlags && movie.contentFlags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.contentFlags.slice(0, 2).map((flag) => (
              <span
                key={flag}
                className="text-gray-500 text-xs capitalize"
              >
                {flag.replace('-', ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Streaming */}
        {movie.streaming && movie.streaming.length > 0 && (
          <div className="mb-4">
            <p className="text-gray-500 text-xs mb-2">
              Available on:
            </p>
            <div className="flex flex-wrap gap-2">
              {movie.streaming.map((service) => (
                <span
                  key={service}
                  className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-lg"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => handleFeedback('neutral')}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              feedback === 'neutral'
                ? 'bg-yellow-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-500'
            }`}
            title="Not my vibe"
          >
            <Meh className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleFeedback('more')}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              feedback === 'more'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-blue-500/20 hover:text-blue-500'
            }`}
            title="More like this"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleFeedback('hide')}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              feedback === 'hide'
                ? 'bg-red-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-500'
            }`}
            title="Hide movies like this"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedback && (
          <div className="mt-2 text-xs text-green-400 text-center animate-fade-in">
            Feedback received!
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;