import { useTheme, ThemeType } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

const themes: { value: ThemeType; label: string; emoji: string }[] = [
  { value: 'graveyard', label: 'Graveyard', emoji: '🪦' },
  { value: 'haunted-mansion', label: 'Haunted Mansion', emoji: '🏚️' },
  { value: 'witch-cottage', label: 'Witch Cottage', emoji: '🧙' },
];

export default function ThemeSettings() {
  const {
    theme,
    setTheme,
    enableAnimations,
    setEnableAnimations,
    enableSoundEffects,
    setEnableSoundEffects,
    highContrastMode,
    setHighContrastMode,
  } = useTheme();

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6 bg-haunted-gray rounded-lg border border-witch/30">
      <h3 className="text-xl md:text-2xl font-creepy text-pumpkin">Theme Settings</h3>

      {/* Theme Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-bold text-haunted-white">
          Choose Your Haunted Theme
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {themes.map((t) => (
            <motion.button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === t.value
                  ? 'border-pumpkin bg-pumpkin/20 text-pumpkin'
                  : 'border-witch/30 bg-haunted-black text-haunted-white hover:border-witch'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-3xl mb-2">{t.emoji}</div>
              <div className="font-bold">{t.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Animation Toggle */}
      <div className="flex items-center justify-between p-4 bg-haunted-black rounded-lg">
        <div>
          <div className="font-bold text-haunted-white">Spooky Animations</div>
          <div className="text-sm text-fog">Enable floating ghosts and effects</div>
        </div>
        <button
          onClick={() => setEnableAnimations(!enableAnimations)}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            enableAnimations ? 'bg-pumpkin' : 'bg-witch/30'
          }`}
          aria-label={`Animations ${enableAnimations ? 'enabled' : 'disabled'}`}
          role="switch"
          aria-checked={enableAnimations}
        >
          <motion.div
            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full"
            animate={{ x: enableAnimations ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Sound Effects Toggle */}
      <div className="flex items-center justify-between p-4 bg-haunted-black rounded-lg">
        <div>
          <div className="font-bold text-haunted-white">Sound Effects</div>
          <div className="text-sm text-fog">Enable eerie sounds</div>
        </div>
        <button
          onClick={() => setEnableSoundEffects(!enableSoundEffects)}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            enableSoundEffects ? 'bg-pumpkin' : 'bg-witch/30'
          }`}
          aria-label={`Sound effects ${enableSoundEffects ? 'enabled' : 'disabled'}`}
          role="switch"
          aria-checked={enableSoundEffects}
        >
          <motion.div
            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full"
            animate={{ x: enableSoundEffects ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* High Contrast Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-haunted-black rounded-lg border-2 border-poison-green/30">
        <div>
          <div className="font-bold text-haunted-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-poison-green"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            High Contrast Mode
          </div>
          <div className="text-sm text-fog">WCAG AAA compliant colors for better readability</div>
        </div>
        <button
          onClick={() => setHighContrastMode(!highContrastMode)}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            highContrastMode ? 'bg-poison-green' : 'bg-witch/30'
          }`}
          aria-label={`High contrast mode ${highContrastMode ? 'enabled' : 'disabled'}`}
          role="switch"
          aria-checked={highContrastMode}
        >
          <motion.div
            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full"
            animate={{ x: highContrastMode ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
    </div>
  );
}
