import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaSave, FaUser, FaCloud } from 'react-icons/fa';
import { MoodSelection } from './moodSelection';
import { MovieSelection } from './movieSelection';
import { PreferencesSelection } from './preference';
import { UserPreferences } from '../../../types';
import useFirebaseAuth from '../../hooks/useAuth';
import { savePreferencesToFirestore, migrateLocalToFirestore } from '../../lib/movieService';
import { useLists } from '../../hooks/useLists';

type OnboardingProps = {
  onComplete: (preferences: any) => void;
};

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [moods, setMoods] = useState<string[]>([]);
  const [likedMovies, setLikedMovies] = useState<string[]>([]);
  const [dislikedMovies, setDislikedMovies] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [countries, setCountries] = useState<string[]>([]);
  const [contentRestrictions, setContentRestrictions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { ensureAnonymous, signInGoogle } = useFirebaseAuth();
  const { createList } = useLists();

  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setShowSavePrompt(true);
    }
  };

  const onSaveAndContinue = async (method: 'local' | 'anon' | 'google') => {
    setSaving(true);
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
        } catch (e) {
            console.error("Anonymous save failed, falling back to local", e);
        }
      } else if (method === "google") {
        try {
            const user = await signInGoogle();
            if (user) {
              await migrateLocalToFirestore();
              await savePreferencesToFirestore(preferences);
            }
        } catch (e) {
             console.error("Google sign-in/save failed", e);
             if ((e as any)?.code === 'auth/popup-closed-by-user') {
                 throw e; 
             }
        }
      }
      
      // Auto-create first list if movies were selected
      if (likedMovies.length > 0) {
          await createList("My First List", "Movies selected during onboarding", false, likedMovies);
      }
      
      onComplete(preferences);
    } catch (error) {
      console.error("Error in onboarding flow:", error);
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
    <div className="p-6">
      {/* Progress Bar */}
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

      {/* Content */}
      <div className="mb-8">
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
    </div>
  );
}
