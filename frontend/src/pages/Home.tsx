import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Home() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: 'AI-Powered Summaries',
      description: 'Get instant, intelligent summaries of your articles powered by advanced AI',
      color: 'from-poison-green to-poison-green/50',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      ),
      title: 'Audio Summaries',
      description: 'Listen to your articles on the go with text-to-speech technology',
      color: 'from-witch-purple to-witch-purple/50',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: 'Smart Personalization',
      description: 'Content tailored to your interests with machine learning',
      color: 'from-pumpkin to-pumpkin/50',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
      title: 'Related Content',
      description: 'Discover connections between articles with semantic analysis',
      color: 'from-blood-red to-blood-red/50',
    },
  ];

  const stats = [
    { label: 'Articles Processed', value: '10K+', icon: '📰' },
    { label: 'AI Summaries', value: '5K+', icon: '🤖' },
    { label: 'Active Feeds', value: '100+', icon: '📡' },
    { label: 'Happy Users', value: '500+', icon: '😊' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="inline-block"
        >
          <div className="relative">
            <div className="text-8xl">👻</div>
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
          </div>
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pumpkin via-blood-red to-witch-purple">
              Haunted RSS Reader
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-fog/80 max-w-3xl mx-auto">
            Resurrect your RSS feeds with AI-powered intelligence and spooky features
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/feeds">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-pumpkin to-blood-red text-ghost font-bold rounded-2xl shadow-2xl shadow-pumpkin/30 hover:shadow-pumpkin/50 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Your First Feed
              </span>
            </motion.button>
          </Link>
          <Link to="/articles">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-graveyard/50 backdrop-blur-sm border border-pumpkin/30 text-ghost font-medium rounded-2xl hover:bg-graveyard/70 hover:border-pumpkin/50 transition-all duration-300"
            >
              Explore Articles
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="relative group"
          >
            <div className="bg-gradient-to-br from-graveyard/60 to-haunted-black/60 backdrop-blur-xl border border-pumpkin/20 rounded-2xl p-6 text-center hover:border-pumpkin/40 transition-all duration-300">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pumpkin to-blood-red mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-fog/70">{stat.label}</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-pumpkin/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </motion.div>
        ))}
      </motion.div>

      {/* Features Section */}
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-2"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-ghost">Powerful Features</h2>
          <p className="text-fog/70">Everything you need for a modern RSS experience</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <div className="relative bg-gradient-to-br from-graveyard/60 to-haunted-black/60 backdrop-blur-xl border border-pumpkin/20 rounded-2xl p-8 hover:border-pumpkin/40 transition-all duration-300 overflow-hidden">
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`}
                />

                <div className="relative space-y-4">
                  <div
                    className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-2xl text-ghost shadow-lg`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-ghost">{feature.title}</h3>
                  <p className="text-fog/70 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="relative bg-gradient-to-br from-pumpkin/10 via-blood-red/10 to-witch-purple/10 backdrop-blur-xl border border-pumpkin/30 rounded-3xl p-12 text-center overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-pumpkin/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-witch-purple/20 rounded-full blur-3xl" />

        <div className="relative space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-ghost">Ready to Get Started?</h2>
          <p className="text-xl text-fog/80 max-w-2xl mx-auto">
            Join the spooky revolution and experience RSS feeds like never before
          </p>
          <Link to="/feeds">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-gradient-to-r from-pumpkin to-blood-red text-ghost font-bold text-lg rounded-2xl shadow-2xl shadow-pumpkin/30 hover:shadow-pumpkin/50 transition-all duration-300"
            >
              Start Reading Now
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
