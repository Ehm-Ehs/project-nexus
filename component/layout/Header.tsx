import React from 'react';
import useFirebaseAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  favoritesCount: number;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, favoritesCount }) => {
  const { signOutUser } = useFirebaseAuth();
  return (
    <div className="sticky top-0 z-50 bg-black shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-3xl text-[var(--primary-color)]"
              aria-hidden="true"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 3v18" />
              <path d="M3 7.5h4" />
              <path d="M3 12h18" />
              <path d="M3 16.5h4" />
              <path d="M17 3v18" />
              <path d="M17 7.5h4" />
              <path d="M17 16.5h4" />
            </svg>
            <h1 className="text-2xl font-bold text-[var(--primary-color)]">
              MovieRec
            </h1>
          </div>

          {/* Navigation */}
          <nav
            className="flex items-center space-x-2 md:space-x-6"
            aria-label="Main navigation"
          >
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-all md:px-4 md:py-2 ${
                activeTab === 'trending'
                  ? 'bg-[var(--primary-color)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-gray-800 hover:text-white'
              }`}
              aria-current={activeTab === 'trending' ? 'page' : undefined}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-xl"
                aria-hidden="true"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              <span className="hidden md:inline">Trending</span>
              <span className="md:hidden">Trending</span>
            </button>

            <button
              onClick={() => setActiveTab('recommended')}
              className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-all md:px-4 md:py-2 ${
                activeTab === 'recommended'
                  ? 'bg-[var(--primary-color)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-gray-800 hover:text-white'
              }`}
              aria-current={activeTab === 'recommended' ? 'page' : undefined}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-xl"
                aria-hidden="true"
              >
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
              <span className="hidden md:inline">For You</span>
              <span className="md:hidden">For You</span>
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`relative flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-all md:px-4 md:py-2 ${
                activeTab === 'favorites'
                  ? 'bg-[var(--primary-color)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-gray-800 hover:text-white'
              }`}
              aria-current={activeTab === 'favorites' ? 'page' : undefined}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-xl"
                aria-hidden="true"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span className="hidden md:inline">Favorites</span>
              <span className="md:hidden">Fav</span>

              {favoritesCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-color)] text-xs font-bold text-black"
                  aria-label={`${favoritesCount} favorite movies`}
                >
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('lists')}
              className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-all md:px-4 md:py-2 ${
                activeTab === 'lists'
                  ? 'bg-[var(--primary-color)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-gray-800 hover:text-white'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-xl"
                aria-hidden="true"
              >
                <path d="M8 6h13" />
                <path d="M8 12h13" />
                <path d="M8 18h13" />
                <path d="M3 6h.01" />
                <path d="M3 12h.01" />
                <path d="M3 18h.01" />
              </svg>
              <span className="hidden md:inline">Lists</span>
              <span className="md:hidden">Lists</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-all md:px-4 md:py-2 ${
                activeTab === 'profile'
                  ? 'bg-[var(--primary-color)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-gray-800 hover:text-white'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-xl"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="hidden md:inline">Profile</span>
              <span className="md:hidden">Profile</span>
            </button>

            <button
              onClick={async () => {
                try {
                  await signOutUser();
                  toast.success('Signed out successfully');
                  // Optional: Redirect or reset state if needed, but the auth listener in index.tsx should handle it
                  window.location.reload(); // Force reload to clear state cleanly for now
                } catch (error) {
                  console.error("Sign out failed", error);
                  toast.error('Failed to sign out');
                }
              }}
              className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-all md:px-4 md:py-2"
              title="Sign Out"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Header;