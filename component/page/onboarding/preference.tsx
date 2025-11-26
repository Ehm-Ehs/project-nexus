import { Shield, Globe, Languages } from 'lucide-react';

type PreferencesSelectionProps = {
  languages: string[];
  countries: string[];
  contentRestrictions: string[];
  onLanguagesChange: (languages: string[]) => void;
  onCountriesChange: (countries: string[]) => void;
  onContentRestrictionsChange: (restrictions: string[]) => void;
};

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Korean', 'Mandarin', 'Hindi', 'Arabic', 'Russian'
];

const COUNTRIES = [
  'USA', 'UK', 'France', 'Germany', 'Spain', 'Italy',
  'Japan', 'South Korea', 'India', 'Brazil', 'Mexico', 'Canada'
];

const CONTENT_FLAGS = [
  { id: 'family-friendly', label: 'Family Friendly Only' },
  { id: 'no-violence', label: 'No Violence' },
  { id: 'no-horror', label: 'No Horror' },
  { id: 'no-sexual-content', label: 'No Sexual Content' },
  { id: 'no-slow-movies', label: 'No Slow-Paced Movies' },
];

export function PreferencesSelection({
  languages,
  countries,
  contentRestrictions,
  onLanguagesChange,
  onCountriesChange,
  onContentRestrictionsChange,
}: PreferencesSelectionProps) {
  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      onLanguagesChange(languages.filter((l) => l !== lang));
    } else {
      onLanguagesChange([...languages, lang]);
    }
  };

  const toggleCountry = (country: string) => {
    if (countries.includes(country)) {
      onCountriesChange(countries.filter((c) => c !== country));
    } else {
      onCountriesChange([...countries, country]);
    }
  };

  const toggleRestriction = (restriction: string) => {
    if (contentRestrictions.includes(restriction)) {
      onContentRestrictionsChange(contentRestrictions.filter((r) => r !== restriction));
    } else {
      onContentRestrictionsChange([...contentRestrictions, restriction]);
    }
  };

  return (
    <div>
      <h2 className="text-neutral-900 mb-2">Your preferences</h2>
      <p className="text-neutral-600 mb-8">
        Help us tailor recommendations to your needs.
      </p>

      {/* Languages */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Languages className="w-5 h-5 text-purple-600" />
          <h3 className="text-neutral-800">Languages</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => toggleLanguage(lang)}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                languages.includes(lang)
                  ? 'bg-purple-100 border-purple-500 text-purple-700'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Countries */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-purple-600" />
          <h3 className="text-neutral-800">Regions of Interest</h3>
          <span className="text-neutral-500">(Optional)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((country) => (
            <button
              key={country}
              onClick={() => toggleCountry(country)}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                countries.includes(country)
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      {/* Content Restrictions */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-purple-600" />
          <h3 className="text-neutral-800">Content Filters</h3>
          <span className="text-neutral-500">(Optional)</span>
        </div>
        <div className="space-y-2">
          {CONTENT_FLAGS.map((flag) => (
            <label
              key={flag.id}
              className="flex items-center gap-3 p-3 bg-white border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-neutral-300 transition-colors"
            >
              <input
                type="checkbox"
                checked={contentRestrictions.includes(flag.id)}
                onChange={() => toggleRestriction(flag.id)}
                className="w-5 h-5 text-purple-600 border-neutral-300 rounded focus:ring-purple-500"
              />
              <span className="text-neutral-700">{flag.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-neutral-700">
          ✨ <strong>You're all set!</strong> Click "Get Started" to see your personalized recommendations.
        </p>
      </div>
    </div>
  );
}
