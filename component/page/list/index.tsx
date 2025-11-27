import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaPlus, FaLock, FaGlobe, FaUsers, FaCalendar, FaUser } from 'react-icons/fa';
import { useLists } from '../../hooks/useLists';
import { useFavorites } from '../../hooks/useFavorites';
import { Movie } from '../../../types';
import { getMovieDetails } from '../../../utils/tmdbClient';

export function Lists() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { lists, createList, loading } = useLists();
  const { favorites } = useFavorites(); // Use favorites for selection
  
  // Create List State
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [newListPublic, setNewListPublic] = useState(false);
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  
  // We need to fetch movie details for the lists to display images
  // For now, we'll try to use favorites if available, or fetch on demand.
  // To keep it simple, let's assume we can fetch details for the preview.
  const [listPreviews, setListPreviews] = useState<Record<string, Movie[]>>({});

  useEffect(() => {
    const fetchPreviews = async () => {
        const previews: Record<string, Movie[]> = {};
        for (const list of lists) {
            // Get first 3 movies
            const ids = list.movieIds.slice(0, 3);
            const movies: Movie[] = [];
            for (const id of ids) {
                // Check if in favorites first to save API calls
                const fav = favorites.find(f => f.imdbID === id);
                if (fav) {
                    movies.push(fav);
                } else {
                    try {
                        const movie = await getMovieDetails(id);
                        movies.push(movie);
                    } catch (e) {
                        console.error(`Failed to load movie ${id}`, e);
                    }
                }
            }
            previews[list.id] = movies;
        }
        setListPreviews(previews);
    };
    
    if (lists.length > 0) {
        fetchPreviews();
    }
  }, [lists, favorites]);

  const handleCreateList = async () => {
      if (!newListName) return;
      await createList(newListName, newListDesc, newListPublic, selectedMovies);
      setShowCreateModal(false);
      setNewListName('');
      setNewListDesc('');
      setNewListPublic(false);
      setSelectedMovies([]);
  };

  const toggleMovieSelection = (movieId: string) => {
      if (selectedMovies.includes(movieId)) {
          setSelectedMovies(prev => prev.filter(id => id !== movieId));
      } else {
          setSelectedMovies(prev => [...prev, movieId]);
      }
  };

  const [communityLists, setCommunityLists] = useState([
    {
      name: 'Cozy Autumn Vibes',
      author: 'cinephile_jane',
      followers: 1243,
      movies: 28,
    },
    {
      name: 'Hidden International Gems',
      author: 'world_cinema',
      followers: 892,
      movies: 45,
    },
    {
      name: 'Best of 2024',
      author: 'movie_critic',
      followers: 2156,
      movies: 32,
    },
  ]);

  useEffect(() => {
    const savedCommunity = localStorage.getItem('community-lists');
    
    if (savedCommunity) {
      setCommunityLists(JSON.parse(savedCommunity));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('community-lists', JSON.stringify(communityLists));
  }, [communityLists]);

  const [activeTab, setActiveTab] = useState<'my-lists' | 'community'>('my-lists');

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-neutral-900 mb-2">Your Lists</h1>
            <p className="text-neutral-600">
              Organize and share your favorite movies
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <FaPlus className="w-5 h-5" />
            Create List
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-8 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('my-lists')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'my-lists'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            My Lists
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'community'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Community
          </button>
        </div>

        {/* My Lists */}
        {activeTab === 'my-lists' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => {
              const movies = listPreviews[list.id] || [];
              return (
                <div
                  key={list.id}
                  className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {/* Preview Grid */}
                  <div className="grid grid-cols-3 gap-1 aspect-[3/2] bg-neutral-100">
                    {movies.slice(0, 3).map((movie) => {
                      return (
                        <div key={movie.imdbID} className="relative w-full h-full">
                          <Image
                            src={movie.Poster && movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/150"}
                            alt={movie.Title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      );
                    })}
                    {movies.length < 3 &&
                      Array.from({ length: 3 - movies.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-neutral-200" />
                      ))}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-neutral-900">{list.name}</h3>
                      {list.isPublic ? (
                        <FaGlobe className="w-4 h-4 text-green-500" />
                      ) : (
                        <FaLock className="w-4 h-4 text-neutral-400" />
                      )}
                    </div>
                    <p className="text-neutral-600 mb-3 text-sm line-clamp-2">{list.description}</p>
                    
                    <div className="flex items-center justify-between text-neutral-500 text-sm">
                      <div className="flex items-center gap-4">
                        <span>{list.movieIds.length} movies</span>
                        {list.collaborators && list.collaborators > 1 && (
                          <div className="flex items-center gap-1">
                            <FaUsers className="w-4 h-4" />
                            <span>{list.collaborators}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <FaCalendar className="w-4 h-4" />
                        <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {lists.length === 0 && !loading && (
                <div className="col-span-full text-center py-12 text-neutral-500">
                    <p>You haven't created any lists yet.</p>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 text-purple-600 hover:underline"
                    >
                        Create your first list
                    </button>
                </div>
            )}
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div>
            <h3 className="text-neutral-900 mb-4">Popular Community Lists</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityLists.map((communityList, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <h3 className="text-neutral-900 mb-2">{communityList.name}</h3>
                  <p className="text-neutral-600 mb-4">by @{communityList.author}</p>
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>{communityList.movies} movies</span>
                    <span>{communityList.followers} followers</span>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors">
                    Follow List
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create List Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-neutral-900 mb-4 text-xl font-bold">Create New List</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-neutral-700 mb-2 font-medium">List Name</label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g., Weekend Picks"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-neutral-700 mb-2 font-medium">Description</label>
                  <textarea
                    value={newListDesc}
                    onChange={(e) => setNewListDesc(e.target.value)}
                    placeholder="What's this list about?"
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="public"
                    checked={newListPublic}
                    onChange={(e) => setNewListPublic(e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-neutral-300 rounded"
                  />
                  <label htmlFor="public" className="text-neutral-700">
                    Make this list public
                  </label>
                </div>

                {/* Movie Selection from Favorites */}
                <div>
                    <label className="block text-neutral-700 mb-2 font-medium">Select Movies (from Favorites)</label>
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-neutral-200 rounded-lg p-2">
                        {favorites.map(movie => (
                            <div 
                                key={movie.imdbID} 
                                onClick={() => toggleMovieSelection(movie.imdbID)}
                                className={`relative aspect-[2/3] cursor-pointer rounded overflow-hidden border-2 ${selectedMovies.includes(movie.imdbID) ? 'border-purple-500' : 'border-transparent'}`}
                            >
                                <Image src={movie.Poster} alt={movie.Title} fill className="object-cover" />
                                {selectedMovies.includes(movie.imdbID) && (
                                    <div className="absolute inset-0 bg-purple-500/40 flex items-center justify-center">
                                        <FaPlus className="text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {favorites.length === 0 && (
                            <p className="col-span-3 text-sm text-neutral-500 text-center py-4">No favorites to select.</p>
                        )}
                    </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateList}
                  disabled={!newListName}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
