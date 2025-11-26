import { motion } from 'framer-motion';

interface CobwebProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export default function Cobweb({ className = '', position = 'top-left' }: CobwebProps) {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 scale-x-[-1]',
    'bottom-left': 'bottom-0 left-0 scale-y-[-1]',
    'bottom-right': 'bottom-0 right-0 scale-[-1]',
  };

  return (
    <motion.svg
      className={`absolute ${positionClasses[position]} w-20 h-20 md:w-32 md:h-32 opacity-20 pointer-events-none ${className}`}
      viewBox="0 0 100 100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.2 }}
      transition={{ duration: 2 }}
      aria-hidden="true"
      role="presentation"
    >
      <path
        d="M 0 0 L 30 30 L 0 60 M 0 0 L 60 0 L 30 30 M 30 30 L 50 10 M 30 30 L 10 50"
        stroke="rgba(200, 200, 200, 0.3)"
        strokeWidth="0.5"
        fill="none"
      />
      <path
        d="M 0 0 Q 15 15 30 30 Q 45 15 60 0 M 0 0 Q 15 30 0 60 M 30 30 Q 40 20 50 10 M 30 30 Q 20 40 10 50"
        stroke="rgba(200, 200, 200, 0.2)"
        strokeWidth="0.3"
        fill="none"
      />
      <circle cx="0" cy="0" r="1" fill="rgba(200, 200, 200, 0.4)" />
      <circle cx="30" cy="30" r="1.5" fill="rgba(200, 200, 200, 0.4)" />
      <circle cx="60" cy="0" r="1" fill="rgba(200, 200, 200, 0.4)" />
      <circle cx="0" cy="60" r="1" fill="rgba(200, 200, 200, 0.4)" />
    </motion.svg>
  );
}
