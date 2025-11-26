import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';

interface CompleteStepProps {
  onComplete: () => void;
  preferences: string[];
}

export default function CompleteStep({ onComplete, preferences }: CompleteStepProps) {
  const navigate = useNavigate();
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (interests: string[]) => {
      const data = await apiClient.put('/api/preferences', {
        interests,
      });
      return data;
    },
  });

  // Load demo content mutation
  const loadDemoMutation = useMutation({
    mutationFn: async () => {
      const data = await apiClient.post('/api/demo/load');
      return data;
    },
  });

  // Save preferences on mount
  useEffect(() => {
    if (preferences.length > 0) {
      savePreferencesMutation.mutate(preferences);
    }
  }, []);

  const handleGetStarted = async () => {
    setIsLoadingDemo(true);

    try {
      // Load demo content
      await loadDemoMutation.mutateAsync();

      // Complete onboarding
      onComplete();

      // Navigate to articles page
      navigate('/articles');
    } catch (error) {
      console.error('Error loading demo content:', error);
      // Still complete onboarding even if demo loading fails
      onComplete();
      navigate('/feeds');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center space-y-8"
    >
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="inline-block relative"
      >
        <div className="text-9xl">🎉</div>
        <motion.div
          className="absolute inset-0 bg-pumpkin/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </motion.div>

      {/* Completion message */}
      <div className="space-y-4">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-5xl font-bold"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pumpkin via-blood-red to-witch-purple">
            The Ritual is Complete!
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-fog/80 max-w-2xl mx-auto leading-relaxed"
        >
          Your haunted RSS reader is ready. We've prepared some sample feeds to get you started.
        </motion.p>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-2xl mx-auto space-y-4"
      >
        <div className="bg-gradient-to-br from-graveyard/60 to-haunted-black/60 backdrop-blur-xl border border-pumpkin/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-ghost mb-4">Your Preferences</h3>

          {preferences.length > 0 ? (
            <div className="flex flex-wrap gap-2 justify-center">
              {preferences.map((pref) => (
                <span
                  key={pref}
                  className="px-4 py-2 bg-pumpkin/20 border border-pumpkin/40 rounded-lg text-ghost text-sm"
                >
                  {pref}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-fog/70 text-sm">No preferences selected</p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: '📰', label: '5 Sample Feeds', description: 'Ready to explore' },
            { icon: '🤖', label: 'AI Summaries', description: 'Automatically generated' },
            { icon: '🎯', label: 'Personalized', description: 'Based on your interests' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="bg-graveyard/40 backdrop-blur-sm border border-pumpkin/20 rounded-xl p-4"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-bold text-ghost text-sm mb-1">{item.label}</div>
              <div className="text-xs text-fog/70">{item.description}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="space-y-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetStarted}
          disabled={isLoadingDemo}
          className="px-12 py-5 bg-gradient-to-r from-pumpkin to-blood-red text-ghost font-bold text-xl rounded-2xl shadow-2xl shadow-pumpkin/30 hover:shadow-pumpkin/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingDemo ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading Demo Content...
            </span>
          ) : (
            'Start Reading'
          )}
        </motion.button>

        <p className="text-fog/60 text-sm">You can customize everything in Settings later</p>
      </motion.div>
    </motion.div>
  );
}
