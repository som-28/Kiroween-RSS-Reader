import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface SpookyErrorMessageProps {
  error: Error | null;
  level?: 'page' | 'component' | 'feature';
  onReset?: () => void;
  onReload?: () => void;
  message?: string;
}

export const SpookyErrorMessage = ({
  error,
  level = 'component',
  onReset,
  onReload,
  message,
}: SpookyErrorMessageProps) => {
  const errorMessages = {
    page: {
      title: '👻 The Spirits Have Fled!',
      description: 'A dark curse has befallen this page. The spirits are too frightened to appear.',
    },
    component: {
      title: '🎃 Something Wicked Happened',
      description: 'A mischievous ghost has disrupted this component. Fear not, we can try again.',
    },
    feature: {
      title: '🕷️ The Web is Tangled',
      description: 'The spiders have woven their webs too tightly. This feature needs untangling.',
    },
  };

  const { title, description } = errorMessages[level];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-[300px] p-6"
    >
      <div className="max-w-md w-full">
        {/* Spooky container */}
        <div className="relative bg-haunted-black border-2 border-blood-red/50 rounded-lg p-8 shadow-2xl">
          {/* Animated cobwebs in corners */}
          <div className="absolute top-0 left-0 w-16 h-16 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M 0 0 L 50 50 M 0 0 L 0 50 L 50 50 M 0 0 L 25 0 L 50 50"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                className="text-ghost-white"
              />
            </svg>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 opacity-20 transform scale-x-[-1]">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M 0 0 L 50 50 M 0 0 L 0 50 L 50 50 M 0 0 L 25 0 L 50 50"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                className="text-ghost-white"
              />
            </svg>
          </div>

          {/* Flickering warning icon */}
          <motion.div
            className="flex justify-center mb-4"
            animate={{
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="relative">
              <AlertTriangle className="w-16 h-16 text-pumpkin-orange" />
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle, rgba(255,107,53,0.4) 0%, transparent 70%)',
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </div>
          </motion.div>

          {/* Error title */}
          <h2 className="text-2xl font-bold text-pumpkin-orange text-center mb-3">{title}</h2>

          {/* Error description */}
          <p className="text-ghost-white/80 text-center mb-6">{message || description}</p>

          {/* Error details (in development) */}
          {import.meta.env.DEV && error && (
            <details className="mb-6 bg-graveyard-gray/50 rounded p-3 text-xs">
              <summary className="cursor-pointer text-witch-purple font-medium mb-2 flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Technical Details (Dev Only)
              </summary>
              <div className="text-ghost-white/60 font-mono space-y-2">
                <div>
                  <strong className="text-blood-red">Error:</strong> {error.message}
                </div>
                {error.stack && (
                  <div className="max-h-32 overflow-auto">
                    <strong className="text-blood-red">Stack:</strong>
                    <pre className="text-xs mt-1 whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onReset && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-witch-purple hover:bg-witch-purple/80 text-ghost-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </motion.button>
            )}

            {onReload && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-pumpkin-orange hover:bg-pumpkin-orange/80 text-haunted-black rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </motion.button>
            )}

            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-graveyard-gray hover:bg-graveyard-gray/80 text-ghost-white border border-ghost-white/20 rounded-lg font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </motion.a>
          </div>

          {/* Spooky footer message */}
          <motion.p
            className="text-center text-xs text-ghost-white/40 mt-6 italic"
            animate={{
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            "Even in darkness, there is always a way back to the light..."
          </motion.p>
        </div>

        {/* Floating ghost decoration */}
        <motion.div
          className="absolute -top-8 -right-8 text-6xl opacity-20"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          👻
        </motion.div>
      </div>
    </motion.div>
  );
};
