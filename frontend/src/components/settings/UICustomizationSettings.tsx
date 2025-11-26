import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesService } from '../../services/preferencesService';
import { useTheme } from '../../contexts/ThemeContext';

export default function UICustomizationSettings() {
  const queryClient = useQueryClient();
  const { theme: currentTheme, setTheme } = useTheme();

  // Fetch current preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: () => preferencesService.getPreferences(),
  });

  // Local state
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [enableSoundEffects, setEnableSoundEffects] = useState(false);
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [audioVoice, setAudioVoice] = useState('default');
  const [audioSpeed, setAudioSpeed] = useState(1.0);

  // Update local state when preferences load
  useEffect(() => {
    if (preferences) {
      setEnableAnimations(preferences.enableAnimations);
      setEnableSoundEffects(preferences.enableSoundEffects);
      setSummaryLength(preferences.summaryLength);
      setAudioVoice(preferences.audioVoice);
      setAudioSpeed(preferences.audioSpeed);
    }
  }, [preferences]);

  // Mutation for updating preferences
  const updateMutation = useMutation({
    mutationFn: preferencesService.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });

  // Theme options
  const themes = [
    {
      id: 'graveyard' as const,
      name: 'Graveyard',
      icon: '🪦',
      description: 'Classic dark theme with tombstones',
      preview: 'from-pumpkin/40 via-graveyard-gray to-haunted-black',
      bgColor: '#0a0a0a',
      accentColor: '#ff6b35',
    },
    {
      id: 'haunted-mansion' as const,
      name: 'Haunted Mansion',
      icon: '🏚️',
      description: 'Elegant gothic atmosphere',
      preview: 'from-witch-purple/50 via-[#1a0f2e] to-[#0d0515]',
      bgColor: '#0d0515',
      accentColor: '#a52fff',
    },
    {
      id: 'witch-cottage' as const,
      name: 'Witch Cottage',
      icon: '🧙',
      description: 'Mystical and magical vibes',
      preview: 'from-poison-green/50 via-[#152a0f] to-[#0a1505]',
      bgColor: '#0a1505',
      accentColor: '#39ff14',
    },
  ];

  // Handle theme change
  const handleThemeChange = (themeId: 'graveyard' | 'haunted-mansion' | 'witch-cottage') => {
    setTheme(themeId);
    updateMutation.mutate({ theme: themeId });
  };

  // Handle animations toggle
  const handleAnimationsToggle = (enabled: boolean) => {
    setEnableAnimations(enabled);
    updateMutation.mutate({ enableAnimations: enabled });
  };

  // Handle sound effects toggle
  const handleSoundEffectsToggle = (enabled: boolean) => {
    setEnableSoundEffects(enabled);
    updateMutation.mutate({ enableSoundEffects: enabled });
  };

  // Handle summary length change
  const handleSummaryLengthChange = (length: 'short' | 'medium' | 'long') => {
    setSummaryLength(length);
    updateMutation.mutate({ summaryLength: length });
  };

  // Handle audio speed change
  const handleAudioSpeedChange = (speed: number) => {
    setAudioSpeed(speed);
  };

  // Save audio speed on mouse up
  const handleAudioSpeedSave = () => {
    updateMutation.mutate({ audioSpeed });
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
      className="space-y-6"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-br from-graveyard/60 to-haunted-black/60 backdrop-blur-xl border border-witch-purple/30 rounded-2xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-witch-purple/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🎨</span>
            <h3 className="text-2xl font-bold text-witch-purple">UI Customization</h3>
          </div>
          <p className="text-fog/70">Personalize your haunted experience</p>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="bg-gradient-to-br from-graveyard/40 to-haunted-black/40 backdrop-blur-xl border border-pumpkin/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🌙</span>
          <h4 className="text-xl font-bold text-pumpkin">Theme</h4>
        </div>
        <p className="text-fog/70 text-sm mb-6">Choose your preferred spooky atmosphere</p>

        <div className="grid md:grid-cols-3 gap-4">
          {themes.map((themeOption) => (
            <motion.button
              key={themeOption.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleThemeChange(themeOption.id)}
              className={`relative p-6 rounded-2xl border-2 transition-all ${
                currentTheme === themeOption.id
                  ? 'border-pumpkin bg-pumpkin/10'
                  : 'border-fog/20 bg-haunted-black/30 hover:border-fog/40'
              }`}
            >
              {/* Preview gradient */}
              <div
                className={`w-full h-24 rounded-xl bg-gradient-to-br ${themeOption.preview} mb-4 relative overflow-hidden`}
              >
                {/* Color swatches */}
                <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-ghost/30"
                    style={{ backgroundColor: themeOption.bgColor }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-ghost/30"
                    style={{ backgroundColor: themeOption.accentColor }}
                  />
                </div>
              </div>

              {/* Theme info */}
              <div className="text-center space-y-2">
                <div className="text-3xl">{themeOption.icon}</div>
                <div className="text-ghost font-bold">{themeOption.name}</div>
                <div className="text-fog/60 text-xs">{themeOption.description}</div>
              </div>

              {/* Selected indicator */}
              {currentTheme === themeOption.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 bg-pumpkin rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-4 h-4 text-haunted-black"
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
          ))}
        </div>
      </div>

      {/* Animations Toggle */}
      <div className="bg-gradient-to-br from-graveyard/40 to-haunted-black/40 backdrop-blur-xl border border-poison-green/30 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✨</span>
              <h4 className="text-xl font-bold text-poison-green">Animations</h4>
            </div>
            <p className="text-fog/70 text-sm">
              Enable spooky animations and transitions (may affect performance)
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnimationsToggle(!enableAnimations)}
            className={`relative w-16 h-8 rounded-full transition-colors ${
              enableAnimations ? 'bg-poison-green' : 'bg-graveyard-gray'
            }`}
          >
            <motion.div
              animate={{ x: enableAnimations ? 32 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 left-1 w-6 h-6 bg-ghost rounded-full shadow-lg"
            />
          </motion.button>
        </div>
      </div>

      {/* Sound Effects Toggle */}
      <div className="bg-gradient-to-br from-graveyard/40 to-haunted-black/40 backdrop-blur-xl border border-witch-purple/30 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔊</span>
              <h4 className="text-xl font-bold text-witch-purple">Sound Effects</h4>
            </div>
            <p className="text-fog/70 text-sm">Play eerie sound effects on interactions</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSoundEffectsToggle(!enableSoundEffects)}
            className={`relative w-16 h-8 rounded-full transition-colors ${
              enableSoundEffects ? 'bg-witch-purple' : 'bg-graveyard-gray'
            }`}
          >
            <motion.div
              animate={{ x: enableSoundEffects ? 32 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 left-1 w-6 h-6 bg-ghost rounded-full shadow-lg"
            />
          </motion.button>
        </div>
      </div>

      {/* Summary Length */}
      <div className="bg-gradient-to-br from-graveyard/40 to-haunted-black/40 backdrop-blur-xl border border-pumpkin/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📝</span>
          <h4 className="text-xl font-bold text-pumpkin">AI Summary Length</h4>
        </div>
        <p className="text-fog/70 text-sm mb-6">
          Choose how detailed you want AI-generated summaries to be
        </p>

        <div className="grid grid-cols-3 gap-3">
          {(['short', 'medium', 'long'] as const).map((length) => (
            <motion.button
              key={length}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSummaryLengthChange(length)}
              className={`px-6 py-4 rounded-xl font-bold transition-all ${
                summaryLength === length
                  ? 'bg-gradient-to-r from-pumpkin to-blood-red text-ghost shadow-lg shadow-pumpkin/30'
                  : 'bg-haunted-black/50 text-fog border border-fog/20 hover:border-fog/40'
              }`}
            >
              {length.charAt(0).toUpperCase() + length.slice(1)}
            </motion.button>
          ))}
        </div>

        <div className="mt-4 text-fog/60 text-xs">
          {summaryLength === 'short' && '~50-75 words - Quick overview'}
          {summaryLength === 'medium' && '~100-150 words - Balanced detail'}
          {summaryLength === 'long' && '~200-250 words - Comprehensive summary'}
        </div>
      </div>

      {/* Audio Settings */}
      <div className="bg-gradient-to-br from-graveyard/40 to-haunted-black/40 backdrop-blur-xl border border-blood-red/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🔮</span>
          <h4 className="text-xl font-bold text-blood-red">Audio Settings</h4>
        </div>
        <p className="text-fog/70 text-sm mb-6">Customize audio summary playback</p>

        <div className="space-y-6">
          {/* Voice Selector */}
          <div>
            <label className="block text-ghost font-medium mb-3">Voice</label>
            <select
              value={audioVoice}
              onChange={(e) => {
                setAudioVoice(e.target.value);
                updateMutation.mutate({ audioVoice: e.target.value });
              }}
              className="w-full px-4 py-3 bg-haunted-black/50 border border-blood-red/30 rounded-xl text-ghost focus:outline-none focus:border-blood-red/60 transition-colors"
            >
              <option value="default">Default</option>
              <option value="male">Male Voice</option>
              <option value="female">Female Voice</option>
              <option value="neutral">Neutral Voice</option>
            </select>
          </div>

          {/* Speed Slider */}
          <div>
            <label className="block text-ghost font-medium mb-3">Playback Speed</label>
            <div className="space-y-3">
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={audioSpeed}
                onChange={(e) => handleAudioSpeedChange(parseFloat(e.target.value))}
                onMouseUp={handleAudioSpeedSave}
                onTouchEnd={handleAudioSpeedSave}
                className="w-full h-2 bg-graveyard-gray rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(139, 0, 0) 0%, rgb(139, 0, 0) ${((audioSpeed - 0.5) / 1.5) * 100}%, rgb(26, 26, 26) ${((audioSpeed - 0.5) / 1.5) * 100}%, rgb(26, 26, 26) 100%)`,
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-fog/70 text-sm">
                  <span className="text-ghost font-bold">{audioSpeed.toFixed(1)}x</span> speed
                </span>
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => {
                      setAudioSpeed(0.75);
                      updateMutation.mutate({ audioSpeed: 0.75 });
                    }}
                    className="px-3 py-1 bg-graveyard-gray/50 text-fog rounded-lg hover:bg-graveyard-gray transition-colors"
                  >
                    Slow
                  </button>
                  <button
                    onClick={() => {
                      setAudioSpeed(1.0);
                      updateMutation.mutate({ audioSpeed: 1.0 });
                    }}
                    className="px-3 py-1 bg-graveyard-gray/50 text-fog rounded-lg hover:bg-graveyard-gray transition-colors"
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => {
                      setAudioSpeed(1.5);
                      updateMutation.mutate({ audioSpeed: 1.5 });
                    }}
                    className="px-3 py-1 bg-graveyard-gray/50 text-fog rounded-lg hover:bg-graveyard-gray transition-colors"
                  >
                    Fast
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            Saving UI preferences...
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
