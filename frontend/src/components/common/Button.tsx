import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

const variantStyles = {
  primary:
    'bg-gradient-to-r from-pumpkin/20 to-pumpkin/10 hover:from-pumpkin/30 hover:to-pumpkin/20 border-pumpkin/40 text-pumpkin',
  secondary:
    'bg-gradient-to-r from-witch-purple/20 to-witch-purple/10 hover:from-witch-purple/30 hover:to-witch-purple/20 border-witch-purple/40 text-witch-purple',
  danger:
    'bg-gradient-to-r from-blood-red/20 to-blood-red/10 hover:from-blood-red/30 hover:to-blood-red/20 border-blood-red/40 text-blood-red',
  success:
    'bg-gradient-to-r from-poison-green/20 to-poison-green/10 hover:from-poison-green/30 hover:to-poison-green/20 border-poison-green/40 text-poison-green',
  ghost: 'bg-graveyard/50 hover:bg-graveyard border-pumpkin/10 text-fog hover:text-ghost',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        border rounded-lg font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <motion.svg
          className="w-4 h-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </motion.svg>
      )}
      {children}
    </motion.button>
  );
}
