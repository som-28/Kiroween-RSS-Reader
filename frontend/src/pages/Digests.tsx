import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../router';
import DigestView from '../components/digests/DigestView';
import DigestSettings from '../components/digests/DigestSettings';
import { digestService, type Digest, type DigestPreferences } from '../services/digestService';
import { useDigestNotification } from '../hooks/useDigestNotification';
import type { Article } from '../types/models';

export default function Digests() {
  const [activeTab, setActiveTab] = useState<'view' | 'settings'>('view');
  const [digest, setDigest] = useState<Digest | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [preferences, setPreferences] = useState<DigestPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { markDigestAsViewed, checkForNewDigest } = useDigestNotification();

  // Load latest digest
  const loadLatestDigest = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await digestService.getLatestDigest();
      setDigest(data.digest);
      setArticles(data.articles);
      markDigestAsViewed(data.digest.id);
    } catch (err: any) {
      setError(err.message || 'Failed to load digest');
      setDigest(null);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load preferences
  const loadPreferences = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/preferences');
      if (!response.ok) throw new Error('Failed to load preferences');
      const data = await response.json();
      setPreferences({
        digestFrequency: data.preferences.digestFrequency,
        digestTime: data.preferences.digestTime,
        digestArticleCount: data.preferences.digestArticleCount,
      });
    } catch (err: any) {
      console.error('Failed to load preferences:', err);
    }
  };

  useEffect(() => {
    loadLatestDigest();
    loadPreferences();
  }, []);

  const handleRegenerate = async () => {
    if (!digest) return;

    try {
      setIsRegenerating(true);
      setError(null);
      const data = await digestService.generateDigest({ type: digest.type });
      setDigest(data.digest);
      setArticles(data.articles);
      markDigestAsViewed(data.digest.id);
      await checkForNewDigest();
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate digest');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSavePreferences = async (updates: Partial<DigestPreferences>) => {
    try {
      setIsSavingPreferences(true);
      await digestService.updateDigestPreferences(updates);
      setPreferences((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
      throw err;
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleGenerateDaily = async () => {
    try {
      setIsRegenerating(true);
      setError(null);
      const data = await digestService.generateDigest({ type: 'daily' });
      setDigest(data.digest);
      setArticles(data.articles);
      markDigestAsViewed(data.digest.id);
      setActiveTab('view');
      await checkForNewDigest();
    } catch (err: any) {
      setError(err.message || 'Failed to generate daily digest');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleGenerateWeekly = async () => {
    try {
      setIsRegenerating(true);
      setError(null);
      const data = await digestService.generateDigest({ type: 'weekly' });
      setDigest(data.digest);
      setArticles(data.articles);
      markDigestAsViewed(data.digest.id);
      setActiveTab('view');
      await checkForNewDigest();
    } catch (err: any) {
      setError(err.message || 'Failed to generate weekly digest');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-creepy text-pumpkin">📖 Mystical Digests</h2>
          <p className="text-fog mt-2">Your curated spellbook of personalized content</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-graveyard/50 backdrop-blur-sm border border-pumpkin/20 rounded-xl p-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('view')}
            className={`relative px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'view' ? 'text-pumpkin' : 'text-fog hover:text-ghost'
            }`}
          >
            {activeTab === 'view' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-pumpkin/20 to-pumpkin/10 rounded-lg border border-pumpkin/30"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">View</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('settings')}
            className={`relative px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'settings' ? 'text-pumpkin' : 'text-fog hover:text-ghost'
            }`}
          >
            {activeTab === 'settings' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-pumpkin/20 to-pumpkin/10 rounded-lg border border-pumpkin/30"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">Settings</span>
          </motion.button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-blood-red/20 border border-blood-red/40 rounded-xl"
        >
          <svg
            className="w-5 h-5 text-blood-red flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-blood-red">{error}</p>
        </motion.div>
      )}

      {/* Content */}
      {activeTab === 'view' ? (
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 text-pumpkin"
              >
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </motion.div>
            </div>
          ) : digest && articles.length > 0 ? (
            <DigestView
              digest={digest}
              articles={articles}
              onRegenerate={handleRegenerate}
              isRegenerating={isRegenerating}
            />
          ) : (
            <div className="text-center py-20 space-y-6">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-6xl"
              >
                📚
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-2xl font-creepy text-ghost">No Digest Available</h3>
                <p className="text-fog">Generate your first mystical digest to get started</p>
              </div>
              <div className="flex items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerateDaily}
                  disabled={isRegenerating}
                  className="px-6 py-3 bg-gradient-to-r from-pumpkin/30 to-pumpkin/20 hover:from-pumpkin/40 hover:to-pumpkin/30 border border-pumpkin/50 rounded-xl text-pumpkin font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Generate Daily Digest
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerateWeekly}
                  disabled={isRegenerating}
                  className="px-6 py-3 bg-gradient-to-r from-witch-purple/30 to-witch-purple/20 hover:from-witch-purple/40 hover:to-witch-purple/30 border border-witch-purple/50 rounded-xl text-witch-purple font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Generate Weekly Digest
                </motion.button>
              </div>
            </div>
          )}
        </div>
      ) : (
        preferences && (
          <DigestSettings
            preferences={preferences}
            onSave={handleSavePreferences}
            isSaving={isSavingPreferences}
          />
        )
      )}
    </motion.div>
  );
}
