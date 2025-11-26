import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { DigestPreferences } from '../../services/digestService';

interface DigestSettingsProps {
  preferences: DigestPreferences;
  onSave: (preferences: Partial<DigestPreferences>) => Promise<void>;
  isSaving?: boolean;
}

export default function DigestSettings({
  preferences,
  onSave,
  isSaving = false,
}: DigestSettingsProps) {
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'off'>(
    preferences.digestFrequency
  );
  const [time, setTime] = useState(preferences.digestTime);
  const [articleCount, setArticleCount] = useState(preferences.digestArticleCount);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed =
      frequency !== preferences.digestFrequency ||
      time !== preferences.digestTime ||
      articleCount !== preferences.digestArticleCount;
    setHasChanges(changed);
  }, [frequency, time, articleCount, preferences]);

  const handleSave = async () => {
    await onSave({
      digestFrequency: frequency,
      digestTime: time,
      digestArticleCount: articleCount,
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setFrequency(preferences.digestFrequency);
    setTime(preferences.digestTime);
    setArticleCount(preferences.digestArticleCount);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-2xl font-creepy text-pumpkin">Digest Settings</h3>
        <p className="text-fog text-sm">
          Configure when and how your mystical digests are generated
        </p>
      </div>

      {/* Settings container */}
      <div className="bg-gradient-to-br from-haunted-black/40 via-graveyard/60 to-haunted-black/40 backdrop-blur-xl border border-pumpkin/20 rounded-2xl p-8 space-y-8">
        {/* Frequency selector */}
        <div className="space-y-4">
          <label className="block text-ghost font-semibold">Digest Frequency</label>
          <div className="grid grid-cols-3 gap-4">
            {(['daily', 'weekly', 'off'] as const).map((freq) => (
              <motion.button
                key={freq}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFrequency(freq)}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  frequency === freq
                    ? 'bg-gradient-to-br from-pumpkin/30 to-pumpkin/10 border-pumpkin shadow-lg shadow-pumpkin/20'
                    : 'bg-graveyard/50 border-pumpkin/20 hover:border-pumpkin/40'
                }`}
              >
                <div className="space-y-2">
                  {/* Icon */}
                  <div className={`text-3xl ${frequency === freq ? 'text-pumpkin' : 'text-fog'}`}>
                    {freq === 'daily' && '📅'}
                    {freq === 'weekly' && '📆'}
                    {freq === 'off' && '🚫'}
                  </div>
                  {/* Label */}
                  <div
                    className={`font-semibold capitalize ${frequency === freq ? 'text-pumpkin' : 'text-ghost'}`}
                  >
                    {freq}
                  </div>
                  {/* Description */}
                  <div className="text-xs text-fog">
                    {freq === 'daily' && 'Every day'}
                    {freq === 'weekly' && 'Once a week'}
                    {freq === 'off' && 'Manual only'}
                  </div>
                </div>
                {/* Selected indicator */}
                {frequency === freq && (
                  <motion.div
                    layoutId="frequency-indicator"
                    className="absolute inset-0 rounded-xl border-2 border-pumpkin"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Time picker */}
        {frequency !== 'off' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <label className="block text-ghost font-semibold">Generation Time</label>
            <div className="relative">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-6 py-4 bg-graveyard/80 border-2 border-witch-purple/40 rounded-xl text-ghost text-lg focus:outline-none focus:border-witch-purple focus:ring-2 focus:ring-witch-purple/20 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-witch-purple pointer-events-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm text-fog">
              Your digest will be generated at this time{' '}
              {frequency === 'daily' ? 'every day' : 'every week'}
            </p>
          </motion.div>
        )}

        {/* Article count slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-ghost font-semibold">Articles per Digest</label>
            <span className="text-2xl font-bold text-pumpkin">{articleCount}</span>
          </div>

          <div className="relative">
            {/* Slider track */}
            <div className="relative h-3 bg-graveyard/80 rounded-full overflow-hidden">
              {/* Progress fill */}
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-witch-purple to-pumpkin rounded-full"
                style={{ width: `${(articleCount / 50) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>

            {/* Slider input */}
            <input
              type="range"
              min="1"
              max="50"
              value={articleCount}
              onChange={(e) => setArticleCount(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
            />

            {/* Slider thumb */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-pumpkin rounded-full border-4 border-haunted-black shadow-lg pointer-events-none"
              style={{ left: `calc(${(articleCount / 50) * 100}% - 12px)` }}
              animate={{
                boxShadow: [
                  '0 0 10px rgba(255, 107, 53, 0.5)',
                  '0 0 20px rgba(255, 107, 53, 0.8)',
                  '0 0 10px rgba(255, 107, 53, 0.5)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          {/* Range labels */}
          <div className="flex items-center justify-between text-xs text-fog">
            <span>1 article</span>
            <span>50 articles</span>
          </div>

          <p className="text-sm text-fog">
            The most relevant articles will be selected for your digest
          </p>
        </div>

        {/* Action buttons */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 pt-6 border-t border-pumpkin/20"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-pumpkin/30 to-pumpkin/20 hover:from-pumpkin/40 hover:to-pumpkin/30 border border-pumpkin/50 rounded-xl text-pumpkin font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pumpkin/20"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.svg
                    className="w-5 h-5"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </motion.svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Changes
                </span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              disabled={isSaving}
              className="px-6 py-4 bg-graveyard/80 hover:bg-graveyard border border-pumpkin/20 hover:border-pumpkin/40 rounded-xl text-fog hover:text-ghost font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </motion.button>
          </motion.div>
        )}

        {/* Info message */}
        {!hasChanges && (
          <div className="flex items-center gap-3 p-4 bg-poison-green/10 border border-poison-green/30 rounded-xl">
            <svg
              className="w-5 h-5 text-poison-green flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-poison-green">Your digest settings are up to date</p>
          </div>
        )}
      </div>
    </div>
  );
}
