import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import Navigation from '../components/navigation/Navigation';
import { SyncStatusIndicator } from '../components/SyncStatusIndicator';
import { OnboardingModal } from '../components/onboarding';
import { pageTransition } from '../router';

const ONBOARDING_COMPLETED_KEY = 'haunted-rss-onboarding-completed';

export default function HauntedLayout() {
  const location = useLocation();
  const { scrollY } = useScroll();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Dynamic header effects based on scroll
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);

  useEffect(() => {
    // Check if onboarding has been completed
    const onboardingCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    console.log('🎃 Onboarding check:', {
      onboardingCompleted,
      showOnboarding: !onboardingCompleted,
    });
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-haunted-black via-graveyard/50 to-haunted-black text-ghost relative">
      {/* Sync Status Indicator */}
      <SyncStatusIndicator />

      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-pumpkin/10 via-transparent to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-witch-purple/10 via-transparent to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-poison-green/5 via-transparent to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Dynamic Header - Compact */}
      <motion.header
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-haunted-black/60 border-b border-pumpkin/10"
      >
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-pumpkin to-blood-red rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-pumpkin/30">
                  👻
                </div>
                <motion.div
                  className="absolute inset-0 bg-pumpkin/30 rounded-2xl blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pumpkin via-blood-red to-witch-purple">
                  Haunted RSS
                </h1>
                <p className="text-xs text-fog/60">AI-Powered Reader</p>
              </div>
            </motion.div>

            {/* Navigation */}
            <Navigation />
          </div>
        </div>
      </motion.header>

      {/* Main Content - Optimized spacing */}
      <main id="main-content" className="relative z-10 pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="relative z-10 mt-auto border-t border-pumpkin/10 bg-haunted-black/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-fog/60">
              <span>Built with</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-blood-red"
              >
                ❤️
              </motion.span>
              <span>and dark magic</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-fog/40">
              <span>© 2024 Haunted RSS</span>
              <span>•</span>
              <span>Powered by AI</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Onboarding Modal */}
      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
    </div>
  );
}
