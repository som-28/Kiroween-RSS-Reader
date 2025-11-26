import { motion } from 'framer-motion';

interface BubblingCauldronProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export const BubblingCauldron = ({
  size = 'md',
  className = '',
  message = 'Brewing AI magic...',
}: BubblingCauldronProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className={`${sizeClasses[size]} relative`} aria-hidden="true">
        {/* Cauldron */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Cauldron body */}
          <path
            d="M 20 40 L 15 70 Q 15 85 30 85 L 70 85 Q 85 85 85 70 L 80 40 Z"
            fill="var(--graveyard-gray, #1a1a1a)"
            stroke="var(--ghost-white, #f0f0f0)"
            strokeWidth="2"
          />

          {/* Cauldron rim */}
          <ellipse
            cx="50"
            cy="40"
            rx="32"
            ry="8"
            fill="var(--graveyard-gray, #1a1a1a)"
            stroke="var(--ghost-white, #f0f0f0)"
            strokeWidth="2"
          />

          {/* Cauldron legs */}
          <path
            d="M 30 85 L 25 95 M 50 85 L 50 95 M 70 85 L 75 95"
            stroke="var(--ghost-white, #f0f0f0)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Bubbles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-poison-green/40"
            style={{
              width: `${8 + Math.random() * 8}px`,
              height: `${8 + Math.random() * 8}px`,
              left: `${30 + Math.random() * 40}%`,
              bottom: '30%',
            }}
            animate={{
              y: [-20, -60],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Steam/smoke */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`steam-${i}`}
            className="absolute rounded-full"
            style={{
              width: '20px',
              height: '20px',
              left: `${35 + i * 15}%`,
              top: '10%',
              background: 'radial-gradient(circle, rgba(106,13,173,0.3) 0%, transparent 70%)',
            }}
            animate={{
              y: [-10, -40],
              opacity: [0.6, 0],
              scale: [1, 1.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 60%, rgba(57,255,20,0.2) 0%, transparent 60%)',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {message && (
        <motion.p
          className="text-sm text-witch-purple font-medium"
          animate={{
            opacity: [0.7, 1, 0.7],
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
