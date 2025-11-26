import { motion } from 'framer-motion';

interface FeaturesStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function FeaturesStep({ onNext, onBack }: FeaturesStepProps) {
  const features = [
    {
      icon: '🎃',
      title: 'Spooky Interface',
      description:
        'Navigate through a hauntingly beautiful Halloween-themed UI with floating ghosts, cobwebs, and mystical effects',
      gradient: 'from-pumpkin to-pumpkin/50',
    },
    {
      icon: '🤖',
      title: 'AI Summaries',
      description:
        'Get instant, intelligent summaries of articles powered by advanced AI. Save time and read more efficiently',
      gradient: 'from-poison-green to-poison-green/50',
    },
    {
      icon: '🔊',
      title: 'Audio Playback',
      description:
        'Listen to article summaries with text-to-speech. Perfect for multitasking or when your eyes need a rest',
      gradient: 'from-witch-purple to-witch-purple/50',
    },
    {
      icon: '🎯',
      title: 'Smart Personalization',
      description:
        'Content tailored to your interests. The more you read, the smarter it gets at finding what you love',
      gradient: 'from-blood-red to-blood-red/50',
    },
    {
      icon: '🔗',
      title: 'Related Articles',
      description:
        'Discover connections between articles with semantic analysis. See the bigger picture across your feeds',
      gradient: 'from-pumpkin to-witch-purple',
    },
    {
      icon: '📱',
      title: 'Offline Reading',
      description:
        'Cache articles for offline access. Read anywhere, anytime, even without an internet connection',
      gradient: 'from-poison-green to-blood-red',
    },
  ];

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
          ✨
        </motion.div>
        <h2 className="text-4xl font-bold text-ghost">Mystical Features Await</h2>
        <p className="text-fog/70 text-lg">Discover what makes this RSS reader truly magical</p>
      </div>

      {/* Features grid */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="group relative"
          >
            <div className="relative bg-graveyard/40 backdrop-blur-sm border border-pumpkin/20 rounded-2xl p-6 hover:border-pumpkin/40 transition-all duration-300 overflow-hidden">
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity`}
              />

              <div className="relative space-y-3">
                <div className="text-4xl">{feature.icon}</div>
                <h3 className="text-xl font-bold text-ghost">{feature.title}</h3>
                <p className="text-fog/70 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-pumpkin to-blood-red text-ghost font-bold rounded-xl shadow-lg shadow-pumpkin/30 hover:shadow-pumpkin/50 transition-all duration-300 flex items-center gap-2"
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
