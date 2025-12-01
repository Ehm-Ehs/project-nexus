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

  useEffect(() => {
      if (initializing) {
        console.log("Auth initializing...");
        return;
      }

      console.log("Auth state changed:", user ? (user.isAnonymous ? "Anonymous" : "Signed In") : "No User");

      const init = async () => {
          if (!user) {
              console.log("No user, ensuring anonymous...");
              // If we just signed out, we might want to clear local storage or reset state
              // But ensureAnonymous will likely create a new anon user.
              await ensureAnonymous();
              return;
          }

          // If user is logged in (anon or real)
          setMounted(true);

          // Check if we have local preferences
          const localPrefs = localStorage.getItem('userPreferences');
          const onboardingComplete = localStorage.getItem('onboardingComplete');
          if (user.isAnonymous) {
              console.log("User is anonymous. Onboarding complete?", onboardingComplete);
              // Anonymous user: rely on local storage
              if (!onboardingComplete) {
                  setShowOnboarding(true);
              }
          } else {
              // Signed in user: fetch profile from Firestore
              console.log("User is signed in. Fetching profile for:", user.uid);
              setCheckingProfile(true);
              
              // Only show loading toast if we are actually fetching a profile for a signed-in user
              // and we don't have it locally yet.
              const toastId = toast.loading('Loading your profile...');
              try {
                  const { getUserProfile } = await import('../component/lib/movieService');
                  const profile = await getUserProfile(user.uid);

                  if (profile) {
                      // Returning user with profile!
                      console.log("Found existing profile for user", user.uid, profile);
                      toast.success('Welcome back!', { id: toastId });
                      
                      // Sync to local storage
                      localStorage.setItem('onboardingComplete', 'true');
                      localStorage.setItem('userPreferences', JSON.stringify(profile));
                      setUserPreferences(profile);
                      
                      // Sync favorites if they exist in profile
                      if (profile.favorites) {
                          localStorage.setItem('movieflix.favorites', JSON.stringify(profile.favorites));
                      }

                      console.log("Closing onboarding modal...");
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
                      setCheckingProfile(false);
                      return;
                  } else {
                      console.log("No profile found for signed in user.");
                      // User is signed in but has no profile -> Show onboarding
                      setShowOnboarding(true);
                      toast.error('Profile not found', { id: toastId });
                  }
              } catch (e: any) {
                  console.error("Error fetching user profile", e);
                  // Even on error, if user is signed in, we might want to let them in?
                  // For now, let's close it so they aren't stuck, as requested.
                  setShowOnboarding(false);
                  
                  // Handle offline error specifically if possible, or just general error
                  if (e?.message?.includes('offline')) {
                      toast.error('Network error. Please check your connection.', { id: toastId });
                  } else {
                      toast.error('Failed to load profile', { id: toastId });
                  }
              } finally {
                  setCheckingProfile(false);
              }
          }

          if (!onboardingComplete && !localStorage.getItem('onboardingComplete')) {
             setShowOnboarding(true);
          } else if (localPrefs) {
             try {
                const prefs = JSON.parse(localPrefs);
                setUserPreferences(prefs);
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
    // ... (existing handler)
    console.log('Onboarding preferences:', preferences);
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

  // ... (rest of component)

  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen bg-black text-white font-sans`}>
      {/* ... (Head, Header, Main, Footer) ... */}
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
        ) : activeTab === 'profile' && userPreferences ? (
            <TasteProfile preferences={userPreferences} />
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
