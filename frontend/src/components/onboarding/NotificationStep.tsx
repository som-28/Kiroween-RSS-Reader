import { motion } from 'framer-motion';
import { useState } from 'react';

interface NotificationStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function NotificationStep({ onNext, onBack }: NotificationStepProps) {
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>(
    'default'
  );
  const [isRequesting, setIsRequesting] = useState(false);

  const requestNotificationPermission = async () => {
    setIsRequesting(true);

    try {
      if (!('Notification' in window)) {
        alert('This browser does not support notifications');
        setIsRequesting(false);
        return;
      }

      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);

      if (permission === 'granted') {
        // Show a test notification
        new Notification('🎃 Haunted RSS Reader', {
          body: "Notifications enabled! You'll be alerted about high-priority articles.",
          icon: '/pumpkin.svg',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkipNotifications = () => {
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-6xl inline-block"
        >
          🦇
        </motion.div>
        <h2 className="text-4xl font-bold text-ghost">Stay in the Loop</h2>
        <p className="text-fog/70 text-lg max-w-2xl mx-auto">
          Enable notifications to get alerted about high-priority articles that match your interests
        </p>
      </div>

      {/* Notification preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md mx-auto"
      >
        <div className="bg-gradient-to-br from-graveyard/60 to-haunted-black/60 backdrop-blur-xl border border-pumpkin/30 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎃</div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-ghost">Haunted RSS Reader</h3>
                <span className="text-xs text-fog/60">Just now</span>
              </div>
              <p className="text-sm text-fog/80">
                New article matches your interests: "The Future of AI in Web Development"
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto"
      >
        {[
          {
            icon: '⚡',
            title: 'Instant Alerts',
            description: 'Get notified within 1 minute of high-priority content',
          },
          {
            icon: '🎯',
            title: 'Smart Filtering',
            description: 'Only articles that match your interests',
          },
          {
            icon: '🔕',
            title: 'Respectful',
            description: 'Honors do-not-disturb and system settings',
          },
        ].map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="bg-graveyard/40 backdrop-blur-sm border border-pumpkin/20 rounded-xl p-4 text-center"
          >
            <div className="text-3xl mb-2">{benefit.icon}</div>
            <h4 className="font-bold text-ghost text-sm mb-1">{benefit.title}</h4>
            <p className="text-xs text-fog/70">{benefit.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="space-y-4"
      >
        {notificationStatus === 'default' && (
          <div className="text-center space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={requestNotificationPermission}
              disabled={isRequesting}
              className="px-10 py-4 bg-gradient-to-r from-pumpkin to-blood-red text-ghost font-bold text-lg rounded-2xl shadow-2xl shadow-pumpkin/30 hover:shadow-pumpkin/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRequesting ? 'Requesting...' : 'Enable Notifications'}
            </motion.button>
            <div>
              <button
                onClick={handleSkipNotifications}
                className="text-fog/60 hover:text-ghost transition-colors text-sm"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {notificationStatus === 'granted' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-poison-green/20 border border-poison-green/40 rounded-xl text-poison-green">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Notifications Enabled!
            </div>
            <p className="text-fog/70 text-sm">You'll receive alerts for high-priority articles</p>
          </motion.div>
        )}

        {notificationStatus === 'denied' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-blood-red/20 border border-blood-red/40 rounded-xl text-blood-red">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Notifications Blocked
            </div>
            <p className="text-fog/70 text-sm">You can enable them later in Settings</p>
          </motion.div>
        )}
      </motion.div>

      {/* Navigation buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center justify-between pt-4"
      >
        <button
          onClick={onBack}
          className="px-6 py-3 text-fog/70 hover:text-ghost transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {notificationStatus !== 'default' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-8 py-3 bg-gradient-to-r from-pumpkin to-blood-red text-ghost font-bold rounded-xl shadow-lg shadow-pumpkin/30 hover:shadow-pumpkin/50 transition-all duration-300 flex items-center gap-2"
          >
            Continue
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
