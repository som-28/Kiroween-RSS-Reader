import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useServiceWorker } from '../hooks/useServiceWorker';

export default function ServiceWorkerStatus() {
  const { isOfflineReady, needsUpdate, update } = useServiceWorker();
  const [showOfflineReady, setShowOfflineReady] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    if (isOfflineReady) {
      setShowOfflineReady(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShowOfflineReady(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOfflineReady]);

  useEffect(() => {
    if (needsUpdate) {
      setShowUpdatePrompt(true);
    }
  }, [needsUpdate]);

  const handleUpdate = async () => {
    await update();
    setShowUpdatePrompt(false);
    window.location.reload();
  };

  return (
    <>
      {/* Offline Ready Notification */}
      <AnimatePresence>
        {showOfflineReady && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm"
          >
            <div className="relative bg-gradient-to-br from-poison-green/20 via-poison-green/10 to-transparent backdrop-blur-xl border border-poison-green/40 rounded-2xl p-6 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-poison-green/10 rounded-full blur-3xl" />
              <div className="relative flex items-start gap-4">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="flex-shrink-0 text-3xl"
                >
                  👻
                </motion.div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-poison-green mb-1">Offline Mode Ready!</h4>
                  <p className="text-sm text-ghost/80">
                    The app is now ready to work offline. Your articles are cached and available
                    anytime.
                  </p>
                </div>
                <button
                  onClick={() => setShowOfflineReady(false)}
                  className="flex-shrink-0 text-ghost/60 hover:text-ghost transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Available Prompt */}
      <AnimatePresence>
        {showUpdatePrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm"
          >
            <div className="relative bg-gradient-to-br from-pumpkin/20 via-pumpkin/10 to-transparent backdrop-blur-xl border border-pumpkin/40 rounded-2xl p-6 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pumpkin/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-start gap-4 mb-4">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="flex-shrink-0 text-3xl"
                  >
                    🎃
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-pumpkin mb-1">Update Available!</h4>
                    <p className="text-sm text-ghost/80">
                      A new version of the app is available. Update now to get the latest features.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdate}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pumpkin/30 to-pumpkin/20 hover:from-pumpkin/40 hover:to-pumpkin/30 border border-pumpkin/50 text-pumpkin font-medium rounded-xl transition-all duration-300 shadow-lg shadow-pumpkin/20"
                  >
                    Update Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowUpdatePrompt(false)}
                    className="px-4 py-2.5 bg-graveyard/50 hover:bg-graveyard/80 border border-pumpkin/20 text-ghost/80 hover:text-ghost font-medium rounded-xl transition-all duration-300"
                  >
                    Later
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
