import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Geist, Geist_Mono } from "next/font/google";
import Header from '../component/layout/Header';
import Hero from '../component/layout/Hero';
import MovieGrid from '../component/common/MovieGrid';
import { Onboarding } from '../component/page/onboarding';
import { Lists } from '../component/page/list';
import { Movie } from '../types';
import useFirebaseAuth from '../component/hooks/useAuth';
import { useFavorites } from '../component/hooks/useFavorites';

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
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    (async () => {
      // Wait for auth to initialize
      // We need to know if there is a logged in user or if we should create an anon one
      // But useAuth handles initialization internally. 
      // Let's check if we have a user from useAuth hook, but we can't access it inside this async IIFE easily without adding it to dependency
      // Actually, we should rely on the `user` object from useFirebaseAuth
    })();
  }, []);

  // New effect to handle auth state changes and returning users
  const { user, initializing, ensureAnonymous } = useFirebaseAuth();
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
      if (initializing) return;

      const init = async () => {
          if (!user) {
              await ensureAnonymous();
              return;
          }

          // If user is logged in (anon or real)
          setMounted(true);

          // Check if we have local preferences
          const localPrefs = localStorage.getItem('userPreferences');
          const onboardingComplete = localStorage.getItem('onboardingComplete');

          if (user.isAnonymous) {
              // Anonymous user: rely on local storage
              if (!onboardingComplete) {
                  setShowOnboarding(true);
              }
          } else {
              // Signed in user: fetch profile from Firestore
              try {
                  const { getUserProfile } = await import('../component/lib/movieService');
                  const profile = await getUserProfile(user.uid);

                  if (profile) {
                      // Returning user with profile!
                      console.log("Found existing profile for user", user.uid);
                      
                      // Sync to local storage
                      localStorage.setItem('onboardingComplete', 'true');
                      localStorage.setItem('userPreferences', JSON.stringify(profile));
                      
                      // Sync favorites if they exist in profile
                      if (profile.favorites) {
                          localStorage.setItem('movieflix.favorites', JSON.stringify(profile.favorites));
                          // We might need to trigger a reload of favorites in useFavorites if it doesn't listen to storage
                          // But useFavorites likely fetches on mount or user change.
                      }

                      setShowOnboarding(false);
                      
                      // Fetch recommendations based on this profile
                      const { getPersonalizedMovies, getPersonalizedTrending } = await import('../utils/tmdbClient');
                      const [recData, trendData] = await Promise.all([
                          getPersonalizedMovies(profile),
                          getPersonalizedTrending(profile)
                      ]);

                      if (recData?.results) setRecMovies(recData.results);
                      if (trendData?.results) setTrendingMoviesList(trendData.results);
                      
                      setLoading(false);
                      return;
                  } else {
                      // Signed in but no profile? (Maybe new user via Google who hasn't done onboarding?)
                      // Or maybe they cleared their data. 
                      // If no local onboarding complete, show it.
                      if (!onboardingComplete) {
                          setShowOnboarding(true);
                      }
                  }
              } catch (e) {
                  console.error("Error fetching user profile", e);
              }
          }

          // Fallback: Load from local if we didn't return early
          if (!onboardingComplete && !localStorage.getItem('onboardingComplete')) {
             setShowOnboarding(true);
          } else if (localPrefs) {
             // Load recommendations from local prefs
             try {
                const prefs = JSON.parse(localPrefs);
                const { getPersonalizedMovies, getPersonalizedTrending } = await import('../utils/tmdbClient');
                const [recData, trendData] = await Promise.all([
                    getPersonalizedMovies(prefs),
                    getPersonalizedTrending(prefs)
                ]);
                if (recData?.results) setRecMovies(recData.results);
                if (trendData?.results) setTrendingMoviesList(trendData.results);
             } catch (e) { console.error(e); }
          }
          
          setLoading(false);
      };

      init();
  }, [user, initializing, ensureAnonymous]);

  const handleOnboardingComplete = async (preferences: any) => {
    console.log('Onboarding preferences:', preferences);
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
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

  // Prevent hydration mismatch for favorites
  if (!mounted) {
    return null;
  }

  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen bg-black text-white font-sans`}>
      <Head>
        <title>MovieRec - Discover Your Next Favorite Movie</title>
        <meta name="description" content="Find trending and recommended movies tailored for you." />
        <link rel="icon" href="/favicon.ico" />
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
        ) : (
            <MovieGrid 
              movies={getDisplayedMovies()} 
              activeTab={activeTab}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
        )}
      </main>

      <footer className="bg-zinc-900 py-8 text-center text-zinc-500">
        <p>© {new Date().getFullYear()} MovieRec. All rights reserved.</p>
      </footer>

      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <Onboarding onComplete={handleOnboardingComplete} />
          </div>
        </div>
      )}
    </div>
  );
}
