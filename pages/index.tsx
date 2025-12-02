import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Geist, Geist_Mono } from "next/font/google";
import Header from '../component/layout/Header';
import Hero from '../component/layout/Hero';
import MovieGrid from '../component/common/MovieGrid';
import { Onboarding } from '../component/page/onboarding';
import { Lists } from '../component/page/list';
import { TasteProfile } from '../component/page/profile';
import { Movie } from '../types';
import useFirebaseAuth from '../component/hooks/useAuth';
import { useFavorites } from '../component/hooks/useFavorites';
import toast from 'react-hot-toast';
import { useHomeInitialization } from '../component/hooks/useHomeInitialization';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [activeTab, setActiveTab] = useState('trending');
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [recMovies, setRecMovies] = useState<Movie[]>([]);
  const [trendingMoviesList, setTrendingMoviesList] = useState<Movie[]>([]);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New effect to handle auth state changes and returning users
  const { user, initializing, ensureAnonymous } = useFirebaseAuth();
  const { favorites, toggleFavorite } = useFavorites();

  useHomeInitialization({
    user,
    initializing,
    ensureAnonymous,
    setMounted,
    setShowOnboarding,
    setRecMovies,
    setTrendingMoviesList,
    setUserPreferences,
    setCheckingProfile,
    setLoading,
  });

  const handleOnboardingComplete = async (preferences: any) => {
    // ... (existing handler)
    // ... (existing handler)
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    setUserPreferences(preferences);
    setShowOnboarding(false);
    
    // Immediately fetch personalized movies
    try {
        const { getPersonalizedMovies, getPersonalizedTrending } = await import('../utils/tmdbClient');
        const [recData, trendData] = await Promise.all([
            getPersonalizedMovies(preferences),
            getPersonalizedTrending(preferences)
        ]);

        if (recData && recData.results) {
            setRecMovies(recData.results);
        }
        if (trendData && trendData.results) {
            setTrendingMoviesList(trendData.results);
        }
    } catch (e) {
        console.error("Failed to fetch personalized movies after onboarding", e);
    }
  };

  const getDisplayedMovies = () => {
    switch (activeTab) {
      case 'trending':
        return trendingMoviesList;
      case 'recommended':
        return recMovies;
      case 'favorites':
        return favorites;
      default:
        return trendingMoviesList;
    }
  };

 

  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen bg-black text-white font-sans`}>
      <Head>
        <title>MovieRec - Discover Your Next Favorite Movie</title>
        <meta name="description" content="Find trending and recommended movies tailored for you." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        favoritesCount={favorites.length}
      />

      <main>
        {activeTab === 'trending' && <Hero />}
        
        {activeTab === 'lists' ? (
            <Lists />
        ) : activeTab === 'profile' && userPreferences ? (
            <TasteProfile preferences={userPreferences} />
        ) : (
            <MovieGrid 
              movies={getDisplayedMovies()} 
              activeTab={activeTab}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              loading={loading}
            />
        )}
      </main>

      <footer className="bg-zinc-900 py-8 text-center text-zinc-500">
        <p>© {new Date().getFullYear()} MovieRec. All rights reserved.</p>
      </footer>

      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <Onboarding 
                onComplete={handleOnboardingComplete} 
                isCheckingProfile={checkingProfile}
                onClose={() => setShowOnboarding(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
