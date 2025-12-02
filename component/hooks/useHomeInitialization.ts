import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Movie } from '../../types';

interface UseHomeInitializationProps {
    user: any;
    initializing: boolean;
    ensureAnonymous: () => Promise<void>;
    setMounted: (mounted: boolean) => void;
    setShowOnboarding: (show: boolean) => void;
    setRecMovies: (movies: Movie[]) => void;
    setTrendingMoviesList: (movies: Movie[]) => void;
    setUserPreferences: (prefs: any) => void;
    setCheckingProfile: (checking: boolean) => void;
    setLoading: (loading: boolean) => void;
}

export const useHomeInitialization = ({
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
}: UseHomeInitializationProps) => {
    useEffect(() => {
        if (initializing) {
            return;
        }

        const init = async () => {
            if (!user) {
                await ensureAnonymous();
                return;
            }

            setMounted(true);

            const localPrefs = localStorage.getItem('userPreferences');
            const onboardingComplete = localStorage.getItem('onboardingComplete');

            if (user.isAnonymous) {
                if (!onboardingComplete) {
                    setShowOnboarding(true);
                }
            } else {
                setCheckingProfile(true);
                const toastId = toast.loading('Loading your profile...');

                try {
                    const { getUserProfile } = await import('../lib/movieService');
                    const profile = await getUserProfile(user.uid);

                    if (profile) {
                        toast.success('Welcome back!', { id: toastId });

                        localStorage.setItem('onboardingComplete', 'true');
                        localStorage.setItem('userPreferences', JSON.stringify(profile));
                        setUserPreferences(profile);

                        if (profile.favorites) {
                            localStorage.setItem('movieflix.favorites', JSON.stringify(profile.favorites));
                        }

                        setShowOnboarding(false);

                        const { getPersonalizedMovies, getPersonalizedTrending } = await import('../../utils/tmdbClient');
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
                        setShowOnboarding(true);
                        toast.error('Profile not found', { id: toastId });
                    }
                } catch (e: any) {
                    setShowOnboarding(false);
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
                    const { getPersonalizedMovies, getPersonalizedTrending } = await import('../../utils/tmdbClient');
                    const [recData, trendData] = await Promise.all([
                        getPersonalizedMovies(prefs),
                        getPersonalizedTrending(prefs)
                    ]);
                    if (recData?.results) setRecMovies(recData.results);
                    if (trendData?.results) setTrendingMoviesList(trendData.results);
                } catch (e) {
                    // Silent catch
                }
            }

            setLoading(false);
        };

        init();
    }, [user, initializing, ensureAnonymous, setMounted, setShowOnboarding, setRecMovies, setTrendingMoviesList, setUserPreferences, setCheckingProfile, setLoading]);
};
