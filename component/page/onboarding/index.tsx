import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaSave, FaUser, FaCloud } from 'react-icons/fa';
import { MoodSelection } from './moodSelection';
import { MovieSelection } from './movieSelection';
import { PreferencesSelection } from './preference';
import { UserPreferences } from '../../../types';
import useFirebaseAuth from '../../hooks/useAuth';
import { savePreferencesToFirestore, migrateLocalToFirestore } from '../../lib/movieService';
import { useLists } from '../../hooks/useLists';
import toast from 'react-hot-toast';

type OnboardingProps = {
  onComplete: (preferences: any) => void;
  isCheckingProfile?: boolean;
  onClose?: () => void;
};

export function Onboarding({ onComplete, isCheckingProfile, onClose }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [moods, setMoods] = useState<string[]>([]);
  const [likedMovies, setLikedMovies] = useState<string[]>([]);
  const [dislikedMovies, setDislikedMovies] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [countries, setCountries] = useState<string[]>([]);
  const [contentRestrictions, setContentRestrictions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { user, ensureAnonymous, signInGoogle } = useFirebaseAuth();
  const { createList } = useLists();

  const [showSavePrompt, setShowSavePrompt] = useState(false);

  // If user logs in (and has no profile, so parent didn't close modal), advance to step 1
  useEffect(() => {
      if (user && !user.isAnonymous && step === 0) {
          setStep(1);
      }
  }, [user, step]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setShowSavePrompt(true);
    }
  };

  const handleLogin = async () => {
      const toastId = toast.loading('Signing in...');
      try {
          await signInGoogle();
          toast.success('Signed in successfully!', { id: toastId });
          // Parent component handles closing if profile exists.
          // If not, the useEffect above will advance to step 1.
      } catch (error: any) {
          console.error("Login failed", error);
          if (error?.code === 'auth/popup-closed-by-user') {
            toast.error('Sign in cancelled', { id: toastId });
          } else {
            toast.error('Failed to sign in. Please try again.', { id: toastId });
          }
      }
  };

  const onSaveAndContinue = async (method: 'local' | 'anon' | 'google') => {
    setSaving(true);
    const toastId = toast.loading(method === 'google' ? 'Signing in and saving...' : 'Saving preferences...');
    
    const preferences = {
      moods,
      likedMovies,
      dislikedMovies,
      languages,
      countries,
      contentRestrictions,
      familiarityLevel: 50,
      excludeFilters: [],
    };

    // Always save to localStorage for immediate app usage
    localStorage.setItem("userPreferences", JSON.stringify(preferences));

    try {
      if (method === "anon") {
        try {
            await ensureAnonymous();
            await savePreferencesToFirestore(preferences);
            toast.success('Preferences saved!', { id: toastId });
        } catch (e) {
            console.error("Anonymous save failed, falling back to local", e);
            toast.success('Saved locally (offline mode)', { id: toastId });
        }
      } else if (method === "google") {
        try {
            const user = await signInGoogle();
            if (user) {
              await migrateLocalToFirestore();
              await savePreferencesToFirestore(preferences);
              toast.success('Account created and preferences saved!', { id: toastId });
            } else {
              // Should be caught by catch block if sign in fails, but just in case
              throw new Error("No user returned");
            }
        } catch (e: any) {
             console.error("Google sign-in/save failed", e);
             if (e?.code === 'auth/popup-closed-by-user') {
                 toast.error('Sign in cancelled', { id: toastId });
                 throw e; 
             } else {
                 toast.error('Failed to save to account. Saved locally.', { id: toastId });
             }
        }
      }
      
      // Auto-create first list if movies were selected
      if (likedMovies.length > 0) {
          try {
            await createList("My First List", "Movies selected during onboarding", false, likedMovies);
          } catch (e) {
            console.error("Failed to create initial list", e);
          }
      }
      
      onComplete(preferences);
    } catch (error) {
      console.error("Error in onboarding flow:", error);
      toast.error('Something went wrong. Please try again.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return moods.length > 0;
    if (step === 2) return likedMovies.length + dislikedMovies.length >= 5;
    if (step === 3) return true;
    return false;
  };

  if (isCheckingProfile) {
      return (
          <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-neutral-600">Checking for existing profile...</p>
          </div>
      );
  }

  if (showSavePrompt) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Save your preferences?</h2>
        <p className="text-neutral-600 mb-8">
          Would you like to save your taste profile for next time?
        </p>
        
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={() => onSaveAndContinue('google')}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
          >
            <FaUser className="w-4 h-4" />
            Yes, Sign In
          </button>
          
          <button
            onClick={() => onSaveAndContinue('anon')}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <FaCloud className="w-4 h-4" />
            No, just start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      {/* Close button for signed in users who might be stuck */}
      {onClose && user && !user.isAnonymous && (
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 p-2 text-neutral-400 hover:text-neutral-600"
            title="Close"
          >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
      )}

      {/* Progress Bar */}
      {step > 0 && (
        <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
                <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                    s <= step ? 'bg-purple-500' : 'bg-neutral-200'
                }`}
                />
            ))}
            </div>
            <p className="text-center text-neutral-600">
            Step {step} of 3
            </p>
        </div>
      )}

      {/* Content */}
      <div className="mb-8">
        {step === 0 && (
            <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">Welcome to MovieRec</h2>
                <p className="text-neutral-600 mb-8 text-lg">
                    Discover your next favorite movie with personalized recommendations.
                </p>
                <div className="flex flex-col gap-4 max-w-xs mx-auto">
                    <button
                        onClick={() => setStep(1)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all"
                    >
                        Start Personalizing
                    </button>
                    <button
                        onClick={handleLogin}
                        className="px-6 py-3 rounded-xl bg-white border-2 border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
                    >
                        I have an account
                    </button>
                </div>
            </div>
        )}
        {step === 1 && (
          <MoodSelection selectedMoods={moods} onMoodsChange={setMoods} />
        )}
        {step === 2 && (
          <MovieSelection
            likedMovies={likedMovies}
            dislikedMovies={dislikedMovies}
            onLikedChange={setLikedMovies}
            onDislikedChange={setDislikedMovies}
          />
        )}
        {step === 3 && (
          <PreferencesSelection
            languages={languages}
            countries={countries}
            contentRestrictions={contentRestrictions}
            onLanguagesChange={setLanguages}
            onCountriesChange={setCountries}
            onContentRestrictionsChange={setContentRestrictions}
          />
        )}
      </div>

      {/* Navigation */}
      {step > 0 && (
        <div className="flex items-center justify-between">
            <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors"
            >
            <FaChevronLeft className="w-5 h-5" />
            Back
            </button>

            <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
            {step === 3 ? 'Finish' : 'Next'}
            <FaChevronRight className="w-5 h-5" />
            </button>
        </div>
      )}
    </div>
  );
}
