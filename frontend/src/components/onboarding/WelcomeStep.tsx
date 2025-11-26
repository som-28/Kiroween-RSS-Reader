import { motion } from 'framer-motion';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export default function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-8"
    >
      {/* Animated ghost icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="inline-block relative"
      >
        <div className="text-9xl">👻</div>
        <motion.div
          className="absolute inset-0 bg-pumpkin/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />
      </motion.div>

      {/* Welcome text */}
      <div className="space-y-4">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-5xl md:text-6xl font-bold"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pumpkin via-blood-red to-witch-purple">
            Welcome to the Haunted RSS Reader
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-fog/80 max-w-2xl mx-auto leading-relaxed"
        >
          Resurrect your RSS feeds with AI-powered intelligence, spooky features, and a mystical
          reading experience
        </motion.p>
      </div>

      {/* Features preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
      >
        {[
          { icon: '🤖', label: 'AI Summaries' },
          { icon: '🔊', label: 'Audio Playback' },
          { icon: '🎯', label: 'Personalized' },
          { icon: '🔗', label: 'Smart Links' },
        ].map((feature, index) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + index * 0.1 }}
            className="bg-graveyard/40 backdrop-blur-sm border border-pumpkin/20 rounded-xl p-4 hover:border-pumpkin/40 transition-colors"
          >
            <div className="text-3xl mb-2">{feature.icon}</div>
            <div className="text-sm text-fog/70">{feature.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="px-10 py-4 bg-gradient-to-r from-pumpkin to-blood-red text-ghost font-bold text-lg rounded-2xl shadow-2xl shadow-pumpkin/30 hover:shadow-pumpkin/50 transition-all duration-300"
        >
          Begin the Ritual
        </motion.button>

        <button
          onClick={onSkip}
          className="px-6 py-2 text-fog/60 hover:text-ghost transition-colors"
        >
          Skip and explore on my own
        </button>
      </motion.div>
    </motion.div>
  );
}
