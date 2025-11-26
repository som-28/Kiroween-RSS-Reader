import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesService } from '../../services/preferencesService';
import { notificationService } from '../../services/notificationService';

export default function NotificationSettings() {
  const queryClient = useQueryClient();

  // Fetch current preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: () => preferencesService.getPreferences(),
  });

  // Local state
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [notificationThreshold, setNotificationThreshold] = useState(0.7);
  const [browserPermission, setBrowserPermission] = useState<'default' | 'granted' | 'denied'>(
    'default'
  );
  const [showTestMessage, setShowTestMessage] = useState(false);

  // Update local state when preferences load
  useEffect(() => {
    if (preferences) {
      setEnableNotifications(preferences.enableNotifications);
      setNotificationThreshold(preferences.notificationThreshold);
    }
  }, [preferences]);

  // Check browser permission on mount
  useEffect(() => {
    setBrowserPermission(notificationService.getPermission());
  }, []);

  // Mutation for updating preferences
  const updateMutation = useMutation({
    mutationFn: preferencesService.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });

  // Toggle notifications
  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled && browserPermission !== 'granted') {
      // Request permission first
      const permission = await notificationService.requestPermission();
      setBrowserPermission(permission);

      if (permission !== 'granted') {
        // Permission denied, don't enable
        return;
      }
    }

    setEnableNotifications(enabled);
    updateMutation.mutate({ enableNotifications: enabled });
  };

  // Update threshold
  const handleThresholdChange = (value: number) => {
    setNotificationThreshold(value);
  };

  // Save threshold on mouse up (debounced)
  const handleThresholdSave = () => {
    updateMutation.mutate({ notificationThreshold });
  };

  // Test notification
  const handleTestNotification = async () => {
    if (browserPermission !== 'granted') {
      const permission = await notificationService.requestPermission();
      setBrowserPermission(permission);

      if (permission !== 'granted') {
        return;
      }
    }

    await notificationService.showTestNotification();
    setShowTestMessage(true);
    setTimeout(() => setShowTestMessage(false), 3000);
  };

  // Request permission
  const handleRequestPermission = async () => {
    const permission = await notificationService.requestPermission();
    setBrowserPermission(permission);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-4xl"
        >
          🎃
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-br from-graveyard/60 to-haunted-black/60 backdrop-blur-xl border border-witch-purple/30 rounded-2xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-witch-purple/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🔔</span>
            <h3 className="text-2xl font-bold text-witch-purple">Notification Settings</h3>
          </div>
          <p className="text-fog/70">Get alerted when high-priority articles arrive</p>
        </div>
      </div>

      {/* Browser Permission Status */}
      {browserPermission !== 'granted' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-pumpkin/10 to-blood-red/10 backdrop-blur-xl border border-pumpkin/30 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">⚠️</span>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-pumpkin mb-2">Browser Permission Required</h4>
              <p className="text-fog/70 text-sm mb-4">
                {browserPermission === 'denied'
                  ? 'You have blocked notifications. Please enable them in your browser settings.'
                  : 'Allow notifications to receive alerts for high-priority articles.'}
              </p>
              {browserPermission === 'default' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRequestPermission}
                  className="px-6 py-3 bg-gradient-to-r from-pumpkin to-blood-red text-ghost font-bold rounded-xl hover:shadow-lg hover:shadow-pumpkin/30 transition-all"
                >
                  Grant Permission
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Enable/Disable Toggle */}
      <div className="bg-gradient-to-br from-graveyard/40 to-haunted-black/40 backdrop-blur-xl border border-poison-green/30 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👻</span>
              <h4 className="text-xl font-bold text-poison-green">Enable Notifications</h4>
            </div>
            <p className="text-fog/70 text-sm">
              Receive browser notifications for articles that match your interests
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToggleNotifications(!enableNotifications)}
            disabled={browserPermission === 'denied'}
            className={`relative w-16 h-8 rounded-full transition-colors ${
              enableNotifications ? 'bg-poison-green' : 'bg-graveyard-gray'
            } ${browserPermission === 'denied' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <motion.div
              animate={{ x: enableNotifications ? 32 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 left-1 w-6 h-6 bg-ghost rounded-full shadow-lg"
            />
          </motion.button>
        </div>
      </div>

      {/* Relevance Threshold Slider */}
      <div className="bg-gradient-to-br from-graveyard/40 to-haunted-black/40 backdrop-blur-xl border border-witch-purple/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎯</span>
          <h4 className="text-xl font-bold text-witch-purple">Relevance Threshold</h4>
        </div>
        <p className="text-fog/70 text-sm mb-6">
          Only notify for articles with relevance score above this threshold
        </p>

        <div className="space-y-4">
          {/* Slider */}
          <div className="relative">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={notificationThreshold}
              onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
              onMouseUp={handleThresholdSave}
              onTouchEnd={handleThresholdSave}
              disabled={!enableNotifications}
              className="w-full h-2 bg-graveyard-gray rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, rgb(138, 7, 215) 0%, rgb(138, 7, 215) ${notificationThreshold * 100}%, rgb(26, 26, 26) ${notificationThreshold * 100}%, rgb(26, 26, 26) 100%)`,
              }}
            />
          </div>

          {/* Value Display */}
          <div className="flex items-center justify-between">
            <div className="text-fog/70 text-sm">
              <span className="text-ghost font-bold">
                {(notificationThreshold * 100).toFixed(0)}%
              </span>{' '}
              relevance required
            </div>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => {
                  setNotificationThreshold(0.5);
                  updateMutation.mutate({ notificationThreshold: 0.5 });
                }}
                disabled={!enableNotifications}
                className="px-3 py-1 bg-graveyard-gray/50 text-fog rounded-lg hover:bg-graveyard-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Low (50%)
              </button>
              <button
                onClick={() => {
                  setNotificationThreshold(0.7);
                  updateMutation.mutate({ notificationThreshold: 0.7 });
                }}
                disabled={!enableNotifications}
                className="px-3 py-1 bg-graveyard-gray/50 text-fog rounded-lg hover:bg-graveyard-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Medium (70%)
              </button>
              <button
                onClick={() => {
                  setNotificationThreshold(0.9);
                  updateMutation.mutate({ notificationThreshold: 0.9 });
                }}
                disabled={!enableNotifications}
                className="px-3 py-1 bg-graveyard-gray/50 text-fog rounded-lg hover:bg-graveyard-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                High (90%)
              </button>
            </div>
          </div>

          {/* Explanation */}
          <div className="text-fog/60 text-xs italic">
            {notificationThreshold < 0.5 && "You'll receive many notifications"}
            {notificationThreshold >= 0.5 &&
              notificationThreshold < 0.8 &&
              'Balanced notification frequency'}
            {notificationThreshold >= 0.8 && 'Only the most relevant articles will notify you'}
          </div>
        </div>
      </div>

      {/* Test Notification */}
      <div className="bg-gradient-to-br from-graveyard/40 to-haunted-black/40 backdrop-blur-xl border border-pumpkin/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🧪</span>
          <h4 className="text-xl font-bold text-pumpkin">Test Notifications</h4>
        </div>
        <p className="text-fog/70 text-sm mb-4">
          Send a test notification to verify everything is working
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTestNotification}
          disabled={browserPermission === 'denied'}
          className="px-6 py-3 bg-gradient-to-r from-pumpkin to-blood-red text-ghost font-bold rounded-xl hover:shadow-lg hover:shadow-pumpkin/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send Test Notification
        </motion.button>

        {showTestMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-poison-green text-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Test notification sent! Check your notifications.
          </motion.div>
        )}
      </div>

      {/* Additional Info */}
      <div className="bg-gradient-to-br from-graveyard/20 to-haunted-black/20 backdrop-blur-xl border border-fog/10 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1 text-fog/70 text-sm space-y-2">
            <p>
              <strong className="text-ghost">How it works:</strong> When new articles are fetched,
              the system calculates a relevance score based on your interests. Articles above your
              threshold will trigger a notification.
            </p>
            <p>
              <strong className="text-ghost">Do Not Disturb:</strong> Notifications respect your
              system's do-not-disturb settings and won't show when you're actively viewing the app.
            </p>
          </div>
        </div>
      </div>

      {/* Save Status */}
      {updateMutation.isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-fog/70 text-sm"
        >
          <span className="inline-flex items-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              🔮
            </motion.span>
            Saving notification settings...
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
