import { motion } from 'framer-motion';

interface PumpkinSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PumpkinSpinner = ({ size = 'md', className = '' }: PumpkinSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <motion.div
        className={`${sizeClasses[size]} relative`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        aria-hidden="true"
      >
        {/* Pumpkin body */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Main pumpkin shape */}
          <ellipse
            cx="50"
            cy="55"
            rx="35"
            ry="30"
            fill="var(--pumpkin-orange, #ff6b35)"
            className="drop-shadow-lg"
          />

          {/* Pumpkin ridges */}
          <path
            d="M 50 25 Q 45 55 50 85"
            stroke="var(--blood-red, #8b0000)"
            strokeWidth="2"
            opacity="0.3"
          />
          <path
            d="M 35 30 Q 32 55 35 80"
            stroke="var(--blood-red, #8b0000)"
            strokeWidth="2"
            opacity="0.3"
          />
          <path
            d="M 65 30 Q 68 55 65 80"
            stroke="var(--blood-red, #8b0000)"
            strokeWidth="2"
            opacity="0.3"
          />

          {/* Stem */}
          <rect x="47" y="15" width="6" height="12" rx="2" fill="var(--poison-green, #39ff14)" />

          {/* Spooky face - eyes */}
          <polygon points="38,45 42,50 38,55" fill="var(--haunted-black, #0a0a0a)" />
          <polygon points="62,45 58,50 62,55" fill="var(--haunted-black, #0a0a0a)" />

          {/* Spooky face - mouth */}
          <path
            d="M 35 65 Q 50 70 65 65"
            stroke="var(--haunted-black, #0a0a0a)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 40 65 L 40 68 M 50 70 L 50 73 M 60 65 L 60 68"
            stroke="var(--haunted-black, #0a0a0a)"
            strokeWidth="2"
          />
        </svg>

        {/* Glowing effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,53,0.3) 0%, transparent 70%)',
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  );
};
