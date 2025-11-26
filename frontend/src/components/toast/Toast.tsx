import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast = ({ id, type, message, description, duration = 5000, onClose }: ToastProps) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-poison-green/20',
      borderColor: 'border-poison-green',
      iconColor: 'text-poison-green',
      glowColor: 'rgba(57, 255, 20, 0.3)',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-blood-red/20',
      borderColor: 'border-blood-red',
      iconColor: 'text-blood-red',
      glowColor: 'rgba(139, 0, 0, 0.3)',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-pumpkin-orange/20',
      borderColor: 'border-pumpkin-orange',
      iconColor: 'text-pumpkin-orange',
      glowColor: 'rgba(255, 107, 53, 0.3)',
    },
    info: {
      icon: Info,
      bgColor: 'bg-witch-purple/20',
      borderColor: 'border-witch-purple',
      iconColor: 'text-witch-purple',
      glowColor: 'rgba(106, 13, 173, 0.3)',
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, glowColor } = config[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      className={`relative flex items-start gap-3 p-4 rounded-lg border-2 ${bgColor} ${borderColor} backdrop-blur-sm shadow-lg max-w-md w-full`}
      style={{
        boxShadow: `0 0 20px ${glowColor}`,
      }}
    >
      {/* Animated icon */}
      <motion.div
        initial={{ rotate: -180, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className={iconColor}
      >
        <Icon className="w-6 h-6" />
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ghost-white text-sm">{message}</p>
        {description && <p className="text-ghost-white/70 text-xs mt-1">{description}</p>}
      </div>

      {/* Close button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onClose(id)}
        className="text-ghost-white/60 hover:text-ghost-white transition-colors"
      >
        <X className="w-4 h-4" />
      </motion.button>

      {/* Progress bar */}
      {duration > 0 && (
        <motion.div
          className={`absolute bottom-0 left-0 h-1 ${borderColor.replace('border-', 'bg-')}`}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}

      {/* Spooky decorative elements */}
      <div className="absolute -top-1 -right-1 text-xs opacity-30">
        {type === 'success' && '✨'}
        {type === 'error' && '💀'}
        {type === 'warning' && '⚠️'}
        {type === 'info' && '🔮'}
      </div>
    </motion.div>
  );
};
