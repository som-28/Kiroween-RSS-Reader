import { useNavigate } from 'react-router-dom';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

/**
 * Global keyboard shortcuts component
 * Provides keyboard navigation throughout the app
 */
export default function KeyboardShortcuts() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts = useMemo<KeyboardShortcut[]>(
    () => [
      {
        key: 'h',
        action: () => navigate('/'),
        description: 'Go to Home',
      },
      {
        key: 'f',
        action: () => navigate('/feeds'),
        description: 'Go to Feeds',
      },
      {
        key: 'a',
        action: () => navigate('/articles'),
        description: 'Go to Articles',
      },
      {
        key: 'd',
        action: () => navigate('/digests'),
        description: 'Go to Digests',
      },
      {
        key: 's',
        action: () => navigate('/search'),
        description: 'Go to Search',
      },
      {
        key: ',',
        action: () => navigate('/settings'),
        description: 'Go to Settings',
      },
      {
        key: '?',
        shiftKey: true,
        action: () => setShowHelp((prev) => !prev),
        description: 'Toggle keyboard shortcuts help',
      },
      {
        key: 'Escape',
        action: () => setShowHelp(false),
        description: 'Close dialogs',
      },
    ],
    [navigate]
  );

  useKeyboardNavigation(shortcuts);

  return (
    <>
      <AnimatePresence>
        {showHelp && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
              className="fixed inset-0 bg-haunted-black/80 backdrop-blur-sm z-50"
              aria-hidden="true"
            />

            {/* Help Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              role="dialog"
              aria-labelledby="keyboard-shortcuts-title"
              aria-modal="true"
            >
              <div className="bg-gradient-to-br from-graveyard via-haunted-black to-graveyard border border-pumpkin/30 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2
                    id="keyboard-shortcuts-title"
                    className="text-2xl font-bold text-ghost flex items-center gap-3"
                  >
                    <svg
                      className="w-8 h-8 text-pumpkin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                    Keyboard Shortcuts
                  </h2>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="p-2 rounded-xl bg-graveyard/50 hover:bg-graveyard text-fog hover:text-ghost transition-all duration-300"
                    aria-label="Close keyboard shortcuts help"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  {shortcuts.map((shortcut, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-haunted-black/50 border border-pumpkin/20 rounded-xl hover:border-pumpkin/40 transition-all duration-300"
                    >
                      <span className="text-ghost">{shortcut.description}</span>
                      <div className="flex items-center gap-2">
                        {shortcut.shiftKey && (
                          <kbd className="px-3 py-1.5 bg-graveyard border border-pumpkin/30 rounded-lg text-pumpkin font-mono text-sm">
                            Shift
                          </kbd>
                        )}
                        {shortcut.ctrlKey && (
                          <kbd className="px-3 py-1.5 bg-graveyard border border-pumpkin/30 rounded-lg text-pumpkin font-mono text-sm">
                            Ctrl
                          </kbd>
                        )}
                        {shortcut.altKey && (
                          <kbd className="px-3 py-1.5 bg-graveyard border border-pumpkin/30 rounded-lg text-pumpkin font-mono text-sm">
                            Alt
                          </kbd>
                        )}
                        {shortcut.metaKey && (
                          <kbd className="px-3 py-1.5 bg-graveyard border border-pumpkin/30 rounded-lg text-pumpkin font-mono text-sm">
                            Cmd
                          </kbd>
                        )}
                        <kbd className="px-3 py-1.5 bg-graveyard border border-pumpkin/30 rounded-lg text-pumpkin font-mono text-sm">
                          {shortcut.key === ' ' ? 'Space' : shortcut.key}
                        </kbd>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-poison-green/10 border border-poison-green/30 rounded-xl">
                  <p className="text-sm text-poison-green">
                    <strong>Tip:</strong> Press{' '}
                    <kbd className="px-2 py-1 bg-graveyard border border-poison-green/30 rounded text-xs">
                      ?
                    </kbd>{' '}
                    anytime to toggle this help menu
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
