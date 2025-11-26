import { motion } from 'framer-motion';
import { useState } from 'react';

interface PreferencesStepProps {
  onNext: () => void;
  onBack: () => void;
  preferences: string[];
  setPreferences: (preferences: string[]) => void;
}

const TOPIC_OPTIONS = [
  {
    id: 'technology',
    label: 'Technology',
    icon: '💻',
    color: 'from-poison-green to-poison-green/50',
  },
  { id: 'science', label: 'Science', icon: '🔬', color: 'from-witch-purple to-witch-purple/50' },
  { id: 'programming', label: 'Programming', icon: '👨‍💻', color: 'from-pumpkin to-pumpkin/50' },
  { id: 'ai', label: 'AI & ML', icon: '🤖', color: 'from-blood-red to-blood-red/50' },
  { id: 'web', label: 'Web Development', icon: '🌐', color: 'from-poison-green to-pumpkin' },
  { id: 'mobile', label: 'Mobile Dev', icon: '📱', color: 'from-witch-purple to-blood-red' },
  { id: 'security', label: 'Security', icon: '🔒', color: 'from-blood-red to-witch-purple' },
  { id: 'design', label: 'Design', icon: '🎨', color: 'from-pumpkin to-witch-purple' },
  { id: 'business', label: 'Business', icon: '💼', color: 'from-poison-green to-blood-red' },
  { id: 'startups', label: 'Startups', icon: '🚀', color: 'from-pumpkin to-poison-green' },
  { id: 'gaming', label: 'Gaming', icon: '🎮', color: 'from-witch-purple to-pumpkin' },
  { id: 'crypto', label: 'Crypto', icon: '₿', color: 'from-poison-green to-witch-purple' },
];

export default function PreferencesStep({
  onNext,
  onBack,
  preferences,
  setPreferences,
}: PreferencesStepProps) {
  const [customTopic, setCustomTopic] = useState('');

  const toggleTopic = (topicId: string) => {
    if (preferences.includes(topicId)) {
      setPreferences(preferences.filter((p) => p !== topicId));
    } else {
      setPreferences([...preferences, topicId]);
    }
  };

  const addCustomTopic = () => {
    if (customTopic.trim() && !preferences.includes(customTopic.trim().toLowerCase())) {
      setPreferences([...preferences, customTopic.trim().toLowerCase()]);
      setCustomTopic('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCustomTopic();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-6xl inline-block"
        >
          🔮
        </motion.div>
        <h2 className="text-4xl font-bold text-ghost">Cast Your Interests</h2>
        <p className="text-fog/70 text-lg">
          Select topics you're interested in to personalize your feed
        </p>
      </div>

      {/* Topic selection */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {TOPIC_OPTIONS.map((topic, index) => {
            const isSelected = preferences.includes(topic.id);
            return (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleTopic(topic.id)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-pumpkin bg-gradient-to-br from-pumpkin/20 to-blood-red/20 shadow-lg shadow-pumpkin/30'
                    : 'border-pumpkin/20 bg-graveyard/40 hover:border-pumpkin/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="text-3xl">{topic.icon}</div>
                  <div className="text-sm font-medium text-ghost">{topic.label}</div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-pumpkin rounded-full flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 text-ghost"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Custom topic input */}
        <div className="space-y-2">
          <label className="text-sm text-fog/70 block">Add custom topics:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., blockchain, devops, ux..."
              className="flex-1 px-4 py-3 bg-graveyard/40 border border-pumpkin/20 rounded-xl text-ghost placeholder-fog/40 focus:outline-none focus:border-pumpkin/60 transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addCustomTopic}
              disabled={!customTopic.trim()}
              className="px-6 py-3 bg-gradient-to-r from-pumpkin/80 to-blood-red/80 text-ghost font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-pumpkin hover:to-blood-red transition-all"
            >
              Add
            </motion.button>
          </div>
        </div>

        {/* Selected count */}
        <div className="text-center">
          <p className="text-fog/60 text-sm">
            {preferences.length === 0 ? (
              'Select at least one topic to continue'
            ) : (
              <>
                <span className="text-pumpkin font-bold">{preferences.length}</span> topic
                {preferences.length !== 1 ? 's' : ''} selected
              </>
            )}
          </p>
        </div>
      </div>

      {/* Navigation buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between pt-4"
      >
        <button
          onClick={onBack}
          className="px-6 py-3 text-fog/70 hover:text-ghost transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <motion.button
          whileHover={{ scale: preferences.length > 0 ? 1.05 : 1 }}
          whileTap={{ scale: preferences.length > 0 ? 0.95 : 1 }}
          onClick={onNext}
          disabled={preferences.length === 0}
          className="px-8 py-3 bg-gradient-to-r from-pumpkin to-blood-red text-ghost font-bold rounded-xl shadow-lg shadow-pumpkin/30 hover:shadow-pumpkin/50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
