import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeStep from './WelcomeStep';
import FeaturesStep from './FeaturesStep';
import PreferencesStep from './PreferencesStep';
import NotificationStep from './NotificationStep';
import CompleteStep from './CompleteStep';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export type OnboardingStep = 'welcome' | 'features' | 'preferences' | 'notifications' | 'complete';

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [preferences, setPreferences] = useState<string[]>([]);

  console.log('🎃 OnboardingModal render:', { isOpen, currentStep });

  const steps: OnboardingStep[] = [
    'welcome',
    'features',
    'preferences',
    'notifications',
    'complete',
  ];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-haunted-black/90 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget && currentStep !== 'welcome') {
            handleSkip();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-graveyard via-haunted-black to-graveyard border-2 border-pumpkin/30 rounded-3xl shadow-2xl shadow-pumpkin/20"
        >
          {/* Mystical background effects */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-pumpkin/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-0 w-64 h-64 bg-witch-purple/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />

          {/* Progress bar */}
          {currentStep !== 'welcome' && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-graveyard/50">
              <motion.div
                className="h-full bg-gradient-to-r from-pumpkin via-blood-red to-witch-purple"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}

          {/* Skip button */}
          {currentStep !== 'complete' && currentStep !== 'welcome' && (
            <button
              onClick={handleSkip}
              className="absolute top-6 right-6 z-10 text-fog/60 hover:text-ghost transition-colors text-sm"
              aria-label="Skip onboarding"
            >
              Skip Tour
            </button>
          )}

          {/* Content */}
          <div className="relative p-8 md:p-12">
            <AnimatePresence mode="wait">
              {currentStep === 'welcome' && (
                <WelcomeStep key="welcome" onNext={handleNext} onSkip={handleSkip} />
              )}
              {currentStep === 'features' && (
                <FeaturesStep key="features" onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === 'preferences' && (
                <PreferencesStep
                  key="preferences"
                  onNext={handleNext}
                  onBack={handleBack}
                  preferences={preferences}
                  setPreferences={setPreferences}
                />
              )}
              {currentStep === 'notifications' && (
                <NotificationStep key="notifications" onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === 'complete' && (
                <CompleteStep
                  key="complete"
                  onComplete={handleComplete}
                  preferences={preferences}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
