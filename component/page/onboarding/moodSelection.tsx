import { Smile, Heart, Moon, Zap, Brain, Coffee, Sparkles, TreePine } from 'lucide-react';

type MoodSelectionProps = {
  selectedMoods: string[];
  onMoodsChange: (moods: string[]) => void;
};

const moods = [
  { id: 'happy', label: 'Happy & Uplifting', icon: Smile, color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { id: 'cozy', label: 'Cozy & Comforting', icon: Coffee, color: 'bg-orange-100 border-orange-300 text-orange-700' },
  { id: 'dark', label: 'Dark & Mysterious', icon: Moon, color: 'bg-indigo-100 border-indigo-300 text-indigo-700' },
  { id: 'intense', label: 'Intense & Thrilling', icon: Zap, color: 'bg-red-100 border-red-300 text-red-700' },
  { id: 'heartwarming', label: 'Heartwarming', icon: Heart, color: 'bg-pink-100 border-pink-300 text-pink-700' },
  { id: 'mind-bending', label: 'Mind-Bending', icon: Brain, color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { id: 'whimsical', label: 'Whimsical & Magical', icon: Sparkles, color: 'bg-cyan-100 border-cyan-300 text-cyan-700' },
  { id: 'peaceful', label: 'Peaceful & Calm', icon: TreePine, color: 'bg-green-100 border-green-300 text-green-700' },
];

export function MoodSelection({ selectedMoods, onMoodsChange }: MoodSelectionProps) {
  const toggleMood = (moodId: string) => {
    if (selectedMoods.includes(moodId)) {
      onMoodsChange(selectedMoods.filter((m) => m !== moodId));
    } else {
      onMoodsChange([...selectedMoods, moodId]);
    }
  };

  return (
    <div>
      <h2 className="text-neutral-900 mb-2">What vibes are you into?</h2>
      <p className="text-neutral-600 mb-8">
        Select the moods that resonate with you. This helps us understand your taste.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMoods.includes(mood.id);
          
          return (
            <button
              key={mood.id}
              onClick={() => toggleMood(mood.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? `${mood.color} border-current shadow-md scale-105`
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <Icon className="w-8 h-8 mx-auto mb-2" />
              <div className="text-center">{mood.label}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-purple-50 rounded-lg">
        <p className="text-neutral-600">
          💡 <strong>Tip:</strong> Select at least one mood to continue. You can change this later!
        </p>
      </div>
    </div>
  );
}
