import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { Feed } from '../../services/feedService';

interface DeleteFeedModalProps {
  feed: Feed | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteFeedModal({
  feed,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteFeedModalProps) {
  const { enableAnimations } = useTheme();

  if (!feed) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={enableAnimations ? { opacity: 0 } : undefined}
            animate={enableAnimations ? { opacity: 1 } : undefined}
            exit={enableAnimations ? { opacity: 0 } : undefined}
            onClick={onClose}
            className="fixed inset-0 bg-haunted-black/80 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={enableAnimations ? { opacity: 0, scale: 0.9, y: 20 } : undefined}
              animate={enableAnimations ? { opacity: 1, scale: 1, y: 0 } : undefined}
              exit={enableAnimations ? { opacity: 0, scale: 0.9, y: 20 } : undefined}
              className="bg-haunted-gray border-2 border-blood/50 rounded-lg p-6 
                       max-w-md w-full shadow-2xl shadow-blood/20"
            >
              {/* Skull icon */}
              <div className="text-center mb-4">
                <motion.div
                  animate={
                    enableAnimations
                      ? {
                          rotate: [0, -10, 10, -10, 0],
                          transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 },
                        }
                      : false
                  }
                  className="text-6xl inline-block"
                >
                  💀
                </motion.div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-creepy text-blood text-center mb-2">
                Banish This Feed?
              </h3>

              {/* Description */}
              <p className="text-fog text-center mb-4">
                Are you sure you want to send{' '}
                <span className="text-pumpkin font-semibold">{feed.title}</span> back to the void?
              </p>

              {/* Warning */}
              <div className="bg-blood/10 border border-blood/30 rounded p-3 mb-6 text-sm text-fog">
                <p className="flex items-start gap-2">
                  <span className="text-blood">⚠️</span>
                  <span>
                    This will permanently delete the feed and all its articles. This action cannot
                    be undone.
                  </span>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={enableAnimations && !isDeleting ? { scale: 1.02 } : undefined}
                  whileTap={enableAnimations && !isDeleting ? { scale: 0.98 } : undefined}
                  onClick={onClose}
                  disabled={isDeleting}
                  className="flex-1 bg-haunted-black hover:bg-haunted-gray border-2 border-fog/30
                           text-fog font-semibold py-2 rounded transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={enableAnimations && !isDeleting ? { scale: 1.02 } : undefined}
                  whileTap={enableAnimations && !isDeleting ? { scale: 0.98 } : undefined}
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex-1 bg-blood hover:bg-blood-light text-haunted-white 
                           font-bold py-2 rounded transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <span className="animate-spin">⚰️</span>
                      <span>Banishing...</span>
                    </>
                  ) : (
                    <>
                      <span>🗑️</span>
                      <span>Delete Feed</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
