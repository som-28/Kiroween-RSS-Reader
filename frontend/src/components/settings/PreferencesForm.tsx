import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesService } from '../../services/preferencesService';
import { feedService } from '../../services/feedService';

export default function PreferencesForm() {
  const queryClient = useQueryClient();

  // Fetch current preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: () => preferencesService.getPreferences(),
  });

  // Fetch feeds for preferred sources selector
  const { data: feeds = [] } = useQuery({
    queryKey: ['feeds'],
    queryFn: () => feedService.getFeeds(),
  });

  // Local state for form inputs
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [excludedTopics, setExcludedTopics] = useState<string[]>([]);
  const [excludedInput, setExcludedInput] = useState('');
  const [preferredSources, setPreferredSources] = useState<string[]>([]);

  // Update local state when preferences load
  useEffect(() => {
    if (preferences) {
      setInterests(preferences.interests);
      setExcludedTopics(preferences.excludedTopics);
      setPreferredSources(preferences.preferredSources);
    }
  }, [preferences]);

  // Mutation for updating preferences
  const updateMutation = useMutation({
    mutationFn: preferencesService.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });

  // Add interest topic
  const addInterest = () => {
    const trimmed = interestInput.trim();
    if (trimmed && !interests.includes(trimmed)) {
      const newInterests = [...interests, trimmed];
      setInterests(newInterests);
      setInterestInput('');
      updateMutation.mutate({ interests: newInterests });
    }
  };

  // Remove interest topic
  const removeInterest = (topic: string) => {
    const newInterests = interests.filter((t) => t !== topic);
    setInterests(newInterests);
    updateMutation.mutate({ interests: newInterests });
  };

  // Add excluded topic
  const addExcluded = () => {
    const trimmed = excludedInput.trim();
    if (trimmed && !excludedTopics.includes(trimmed)) {
      const newExcluded = [...excludedTopics, trimmed];
      setExcludedTopics(newExcluded);
      setExcludedInput('');
      updateMutation.mutate({ excludedTopics: newExcluded });
    }
  };

  // Remove excluded topic
  const removeExcluded = (topic: string) => {
    const newExcluded = excludedTopics.filter((t) => t !== topic);
    setExcludedTopics(newExcluded);
    updateMutation.mutate({ excludedTopics: newExcluded });
  };

  // Toggle preferred source
  const togglePreferredSource = (feedId: string) => {
    const newSources = preferredSources.includes(feedId)
      ? preferredSources.filter((id) => id !== feedId)
      : [...preferredSources, feedId];
    setPreferredSources(newSources);
    updateMutation.mutate({ preferredSources: newSources });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-4xl"
        >
          🎃
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Potion Recipe Header */}
      <div className="relative bg-gradient-to-br from-graveyard/60 to-haunted-black/60 backdrop-blur-xl border border-witch-purple/30 rounded-2xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-witch-purple/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🧪</span>
            <h3 className="text-2xl font-bold text-witch-purple">Witch's Potion Recipe</h3>
          </div>
          <p className="text-fog/70">
            Brew your perfect content experience with these mystical ingredients
          </p>
        </div>
      </div>

      {/* Interest Topics */}
      <div className="bg-gradient-to-br from-graveyard/40 to-haunted-black/40 backdrop-blur-xl border border-poison-green/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">✨</span>
          <h4 className="text-xl font-bold text-poison-green">Interest Topics</h4>
        </div>
        <p className="text-fog/70 text-sm mb-4">
          Add topics you're interested in to personalize your feed
        </p>

        {/* Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addInterest()}
            placeholder="e.g., Technology, Science, Gaming..."
            className="flex-1 px-4 py-3 bg-haunted-black/50 border border-poison-green/30 rounded-xl text-ghost placeholder-fog/50 focus:outline-none focus:border-poison-green/60 transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addInterest}
            className="px-6 py-3 bg-gradient-to-r from-poison-green to-poison-green/80 text-haunted-black font-bold rounded-xl hover:shadow-lg hover:shadow-poison-green/30 transition-all"
          >
            Add
          </motion.button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {interests.map((topic) => (
            <motion.div
              key={topic}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="group relative"
            >
              <div className="px-4 py-2 bg-poison-green/20 border border-poison-green/40 rounded-full text-poison-green flex items-center gap-2">
                <span className="text-sm font-medium">{topic}</span>
                <button
                  onClick={() => removeInterest(topic)}
                  className="text-poison-green/70 hover:text-poison-green transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
          {interests.length === 0 && (
            <p className="text-fog/50 text-sm italic">No interests added yet</p>
          )}
        </div>
      </div>

      {/* Excluded Topics */}
      <div className="bg-gradient-to-br from-graveyard/40 to-haunted-black/40 backdrop-blur-xl border border-blood-red/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🚫</span>
          <h4 className="text-xl font-bold text-blood-red">Excluded Topics</h4>
        </div>
        <p className="text-fog/70 text-sm mb-4">Filter out topics you don't want to see</p>

        {/* Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={excludedInput}
            onChange={(e) => setExcludedInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addExcluded()}
            placeholder="e.g., Politics, Sports..."
            className="flex-1 px-4 py-3 bg-haunted-black/50 border border-blood-red/30 rounded-xl text-ghost placeholder-fog/50 focus:outline-none focus:border-blood-red/60 transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addExcluded}
            className="px-6 py-3 bg-gradient-to-r from-blood-red to-blood-red/80 text-ghost font-bold rounded-xl hover:shadow-lg hover:shadow-blood-red/30 transition-all"
          >
            Add
          </motion.button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {excludedTopics.map((topic) => (
            <motion.div
              key={topic}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="group relative"
            >
              <div className="px-4 py-2 bg-blood-red/20 border border-blood-red/40 rounded-full text-blood-red flex items-center gap-2">
                <span className="text-sm font-medium">{topic}</span>
                <button
                  onClick={() => removeExcluded(topic)}
                  className="text-blood-red/70 hover:text-blood-red transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
          {excludedTopics.length === 0 && (
            <p className="text-fog/50 text-sm italic">No excluded topics</p>
          )}
        </div>
      </div>

      {/* Preferred Sources */}
      <div className="bg-gradient-to-br from-graveyard/40 to-haunted-black/40 backdrop-blur-xl border border-pumpkin/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📡</span>
          <h4 className="text-xl font-bold text-pumpkin">Preferred Sources</h4>
        </div>
        <p className="text-fog/70 text-sm mb-4">
          Select feeds you want to prioritize in your personalized content
        </p>

        {feeds.length === 0 ? (
          <p className="text-fog/50 text-sm italic">No feeds available. Add some feeds first!</p>
        ) : (
          <div className="space-y-2">
            {feeds.map((feed) => (
              <motion.label
                key={feed.id}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-3 bg-haunted-black/30 border border-pumpkin/20 rounded-xl cursor-pointer hover:border-pumpkin/40 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={preferredSources.includes(feed.id)}
                  onChange={() => togglePreferredSource(feed.id)}
                  className="w-5 h-5 rounded border-pumpkin/40 bg-haunted-black/50 text-pumpkin focus:ring-2 focus:ring-pumpkin/50 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-ghost font-medium">{feed.title}</div>
                  {feed.description && (
                    <div className="text-fog/60 text-sm truncate">{feed.description}</div>
                  )}
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs ${
                    feed.status === 'active'
                      ? 'bg-poison-green/20 text-poison-green'
                      : 'bg-blood-red/20 text-blood-red'
                  }`}
                >
                  {feed.status}
                </div>
              </motion.label>
            ))}
          </div>
        )}
      </div>

      {/* Save Status */}
      {updateMutation.isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-fog/70 text-sm"
        >
          <span className="inline-flex items-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              🔮
            </motion.span>
            Brewing your preferences...
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
