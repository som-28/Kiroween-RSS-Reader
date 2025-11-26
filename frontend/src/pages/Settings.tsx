import { motion } from 'framer-motion';
import { useState } from 'react';
import PreferencesForm from '../components/settings/PreferencesForm';
import NotificationSettings from '../components/settings/NotificationSettings';
import UICustomizationSettings from '../components/settings/UICustomizationSettings';

type SettingsTab = 'preferences' | 'notifications' | 'ui' | 'about';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('preferences');

  const tabs = [
    { id: 'preferences' as const, label: 'Preferences', icon: '🧪' },
    { id: 'notifications' as const, label: 'Notifications', icon: '🔔' },
    { id: 'ui' as const, label: 'UI Customization', icon: '🎨' },
    { id: 'about' as const, label: 'About', icon: '👻' },
  ];

  const handleRestartOnboarding = () => {
    localStorage.removeItem('haunted-rss-onboarding-completed');
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-block text-6xl"
        >
          ⚙️
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pumpkin via-blood-red to-witch-purple">
          Settings
        </h1>
        <p className="text-fog/70 text-lg">Configure your haunted RSS experience</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-pumpkin to-blood-red text-ghost shadow-lg shadow-pumpkin/30'
                : 'bg-graveyard/50 text-fog border border-fog/20 hover:border-fog/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'preferences' && <PreferencesForm />}
        {activeTab === 'notifications' && <NotificationSettings />}
        {activeTab === 'ui' && <UICustomizationSettings />}
        {activeTab === 'about' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-gradient-to-br from-graveyard/60 to-haunted-black/60 backdrop-blur-xl border border-pumpkin/30 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-ghost mb-4">About Haunted RSS Reader</h2>
              <p className="text-fog/80 mb-6 leading-relaxed">
                A modern resurrection of RSS feed technology, enhanced with AI-powered features and
                wrapped in a spooky Halloween-themed interface.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎃</span>
                  <div>
                    <h3 className="font-bold text-ghost">Version</h3>
                    <p className="text-fog/70 text-sm">1.0.0 - Resurrection Edition</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h3 className="font-bold text-ghost">AI Features</h3>
                    <p className="text-fog/70 text-sm">
                      Powered by OpenAI for summaries and semantic analysis
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">👻</span>
                  <div>
                    <h3 className="font-bold text-ghost">Theme</h3>
                    <p className="text-fog/70 text-sm">
                      Halloween-inspired design with mystical animations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-graveyard/60 to-haunted-black/60 backdrop-blur-xl border border-pumpkin/30 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-ghost mb-4">Help & Support</h2>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRestartOnboarding}
                  className="w-full px-6 py-4 bg-gradient-to-r from-pumpkin/20 to-blood-red/20 border border-pumpkin/40 rounded-xl text-ghost hover:border-pumpkin/60 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔮</span>
                      <div>
                        <h3 className="font-bold">Restart Onboarding</h3>
                        <p className="text-fog/70 text-sm">Take the guided tour again</p>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-pumpkin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </motion.button>

                <div className="px-6 py-4 bg-graveyard/40 border border-pumpkin/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📚</span>
                    <div>
                      <h3 className="font-bold text-ghost mb-2">Keyboard Shortcuts</h3>
                      <div className="space-y-1 text-sm text-fog/70">
                        <div className="flex justify-between">
                          <span>Navigate articles</span>
                          <kbd className="px-2 py-1 bg-graveyard/60 rounded text-xs">↑ ↓</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Open article</span>
                          <kbd className="px-2 py-1 bg-graveyard/60 rounded text-xs">Enter</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Search</span>
                          <kbd className="px-2 py-1 bg-graveyard/60 rounded text-xs">Ctrl+K</kbd>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
