import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MoodSelection } from './moodSelection';
import { MovieSelection } from './movieSelection';
import { PreferencesSelection } from './preference';
import { UserPreferences } from '../../../types'; // Assuming types are here or I need to define them

// Define UserPreferences locally if not imported, or import it.
// The user's code used 'UserPreferences' but didn't import it in the snippet.
// I'll assume it's in types/index.ts or I need to mock it.
// For now, I'll use 'any' or define a partial type to make it compile.

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

  const handleNext = () => {
    if (step === 3) {
      onComplete({
        moods,
        likedMovies,
        dislikedMovies,
        languages,
        countries,
        contentRestrictions,
        familiarityLevel: 50,
        excludeFilters: [],
      });
    } else {
      setStep(step + 1);
    }
  };

  const canProceed = () => {
    if (step === 1) return moods.length > 0;
    if (step === 2) return likedMovies.length + dislikedMovies.length >= 5;
    if (step === 3) return true;
    return false;
  };

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
          disabled={step === 1}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
        >
          {step === 3 ? 'Get Started' : 'Next'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
