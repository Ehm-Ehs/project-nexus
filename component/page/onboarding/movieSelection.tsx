import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Download } from 'lucide-react';
import { getPopularMovies, getTmdbImageUrl } from '../../../utils/tmdbClient';
import Image from 'next/image';

type MovieSelectionProps = {
  likedMovies: string[];
  dislikedMovies: string[];
  onLikedChange: (movies: string[]) => void;
  onDislikedChange: (movies: string[]) => void;
};

type TmdbMovie = {
  id: number;
  title: string;
  poster_path: string;
};

export function MovieSelection({
  likedMovies,
  dislikedMovies,
  onLikedChange,
  onDislikedChange,
}: MovieSelectionProps) {
  const [showImport, setShowImport] = useState(false);
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getPopularMovies();
        setMovies(data.results);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleLike = (movieId: string) => {
    if (likedMovies.includes(movieId)) {
      onLikedChange(likedMovies.filter((id) => id !== movieId));
    } else {
      onLikedChange([...likedMovies, movieId]);
      onDislikedChange(dislikedMovies.filter((id) => id !== movieId));
    }
  };

  const handleDislike = (movieId: string) => {
    if (dislikedMovies.includes(movieId)) {
      onDislikedChange(dislikedMovies.filter((id) => id !== movieId));
    } else {
      onDislikedChange([...dislikedMovies, movieId]);
      onLikedChange(likedMovies.filter((id) => id !== movieId));
    }
  };

  const totalSelected = likedMovies.length + dislikedMovies.length;

  if (loading) {
    return <div className="text-center py-8">Loading movies...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-neutral-900">Tell us your taste</h2>
        <button
          onClick={() => setShowImport(!showImport)}
          className="flex items-center gap-2 px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Import
        </button>
      </div>
      
      <p className="text-neutral-600 mb-2">
        Tap movies you love or hate. We need at least 5 to get started.
      </p>
      
      <div className="mb-6 p-3 bg-neutral-100 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-neutral-700">Selected: {totalSelected} / 5</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-green-600">
              <ThumbsUp className="w-4 h-4" />
              {likedMovies.length}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <ThumbsDown className="w-4 h-4" />
              {dislikedMovies.length}
            </span>
          </div>
        </div>
        <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
            style={{ width: `${Math.min((totalSelected / 5) * 100, 100)}%` }}
          />
        </div>
      </div>

      {showImport && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-neutral-700 mb-3">Import your ratings from:</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:border-purple-300 transition-colors">
              Letterboxd
            </button>
            <button className="px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:border-purple-300 transition-colors">
              IMDb
            </button>
            <button className="px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:border-purple-300 transition-colors">
              Netflix
            </button>
          </div>
          <p className="text-neutral-500 mt-2">
            Note: This is a demo. Import functionality requires API integration.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {movies.map((movie) => {
          const movieIdStr = movie.id.toString();
          const isLiked = likedMovies.includes(movieIdStr);
          const isDisliked = dislikedMovies.includes(movieIdStr);
          const posterUrl = getTmdbImageUrl(movie.poster_path, 'w300');

          return (
            <div key={movie.id} className="group relative">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-200">
                {posterUrl && (
                  <Image
                    src={posterUrl}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-xs text-center mb-2 line-clamp-2">{movie.title}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleLike(movieIdStr)}
                        className={`flex-1 p-1.5 rounded transition-colors ${
                          isLiked
                            ? 'bg-green-500 text-white'
                            : 'bg-white/90 text-neutral-700 hover:bg-green-500 hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3 mx-auto" />
                      </button>
                      <button
                        onClick={() => handleDislike(movieIdStr)}
                        className={`flex-1 p-1.5 rounded transition-colors ${
                          isDisliked
                            ? 'bg-red-500 text-white'
                            : 'bg-white/90 text-neutral-700 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>

                {(isLiked || isDisliked) && (
                  <div
                    className={`absolute top-2 right-2 p-1 rounded-full ${
                      isLiked ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {isLiked ? (
                      <ThumbsUp className="w-3 h-3 text-white" />
                    ) : (
                      <ThumbsDown className="w-3 h-3 text-white" />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
