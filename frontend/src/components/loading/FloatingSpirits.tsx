import { motion } from 'framer-motion';

interface FloatingSpiritsProps {
  count?: number;
  className?: string;
  message?: string;
}

export const FloatingSpirits = ({
  count = 3,
  className = '',
  message = 'Syncing...',
}: FloatingSpiritsProps) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative w-24 h-16">
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${i * 30}%`,
            }}
            animate={{
              y: [0, -15, 0],
              x: [0, 5, 0, -5, 0],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          >
            {/* Spirit body */}
            <svg
              width="32"
              height="40"
              viewBox="0 0 32 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Main ghost shape */}
              <path
                d="M 16 5 Q 8 5 8 15 L 8 30 Q 8 35 10 35 Q 12 33 14 35 Q 16 37 18 35 Q 20 33 22 35 Q 24 35 24 30 L 24 15 Q 24 5 16 5 Z"
                fill="rgba(240, 240, 240, 0.7)"
                className="drop-shadow-lg"
              />

              {/* Eyes */}
              <motion.circle
                cx="12"
                cy="15"
                r="2"
                fill="var(--haunted-black, #0a0a0a)"
                animate={{
                  scaleY: [1, 0.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
              <motion.circle
                cx="20"
                cy="15"
                r="2"
                fill="var(--haunted-black, #0a0a0a)"
                animate={{
                  scaleY: [1, 0.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />

              {/* Mouth */}
              <ellipse cx="16" cy="22" rx="3" ry="2" fill="var(--haunted-black, #0a0a0a)" />
            </svg>

            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(240,240,240,0.3) 0%, transparent 70%)',
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        ))}
      </div>

      {message && (
        <motion.p
          className="text-sm text-ghost-white/80 font-medium"
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};
