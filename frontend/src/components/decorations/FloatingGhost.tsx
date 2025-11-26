import { motion } from 'framer-motion';

interface FloatingGhostProps {
  delay?: number;
  duration?: number;
  className?: string;
}

export default function FloatingGhost({
  delay = 0,
  duration = 8,
  className = '',
}: FloatingGhostProps) {
  return (
    <motion.div
      className={`absolute opacity-10 ${className}`}
      initial={{ y: 0, x: 0 }}
      animate={{
        y: [-20, 20, -20],
        x: [-10, 10, -10],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      aria-hidden="true"
      role="presentation"
    >
      <svg
        width="60"
        height="80"
        viewBox="0 0 60 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Ghost body */}
        <path
          d="M 30 10 Q 10 10 10 35 L 10 70 Q 15 65 20 70 Q 25 75 30 70 Q 35 65 40 70 Q 45 75 50 70 L 50 35 Q 50 10 30 10 Z"
          fill="rgba(240, 240, 240, 0.8)"
        />
        {/* Eyes */}
        <circle cx="22" cy="30" r="3" fill="#0a0a0a" />
        <circle cx="38" cy="30" r="3" fill="#0a0a0a" />
        {/* Mouth */}
        <path
          d="M 25 42 Q 30 45 35 42"
          stroke="#0a0a0a"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}
