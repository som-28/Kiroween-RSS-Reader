import { useState } from 'react';
import {
  PumpkinSpinner,
  BubblingCauldron,
  FloatingSpirits,
  GhostlySkeleton,
  ErrorBoundary,
  SpookyErrorMessage,
} from '../components';
import { useToast } from '../hooks/useToast';

/**
 * Example component demonstrating all loading states, error handling, and toast notifications
 * This is for demonstration purposes only
 */
export const LoadingAndErrorExample = () => {
  const { toast } = useToast();
  const [showError, setShowError] = useState(false);
  const [loadingState, setLoadingState] = useState<
    'none' | 'pumpkin' | 'cauldron' | 'spirits' | 'skeleton'
  >('none');

  const ErrorComponent = () => {
    if (showError) {
      throw new Error('This is a test error to demonstrate error boundaries!');
    }
    return <div className="text-ghost-white">No errors here! 👻</div>;
  };

  return (
    <div className="min-h-screen bg-haunted-black p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-pumpkin-orange mb-2">
            🎃 Loading & Error Handling Demo
          </h1>
          <p className="text-ghost-white/70">
            Showcase of all themed loading components, error boundaries, and toast notifications
          </p>
        </div>

        {/* Loading Components Section */}
        <div className="bg-graveyard-gray border border-witch-purple/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-witch-purple mb-4">Loading Components</h2>

          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setLoadingState('pumpkin')}
                className="px-4 py-2 bg-pumpkin-orange text-haunted-black rounded-lg hover:bg-pumpkin-orange/80"
              >
                Show Pumpkin Spinner
              </button>
              <button
                onClick={() => setLoadingState('cauldron')}
                className="px-4 py-2 bg-poison-green text-haunted-black rounded-lg hover:bg-poison-green/80"
              >
                Show Bubbling Cauldron
              </button>
              <button
                onClick={() => setLoadingState('spirits')}
                className="px-4 py-2 bg-ghost-white text-haunted-black rounded-lg hover:bg-ghost-white/80"
              >
                Show Floating Spirits
              </button>
              <button
                onClick={() => setLoadingState('skeleton')}
                className="px-4 py-2 bg-witch-purple text-ghost-white rounded-lg hover:bg-witch-purple/80"
              >
                Show Skeleton
              </button>
              <button
                onClick={() => setLoadingState('none')}
                className="px-4 py-2 bg-blood-red text-ghost-white rounded-lg hover:bg-blood-red/80"
              >
                Clear
              </button>
            </div>

            <div className="min-h-[200px] flex items-center justify-center bg-haunted-black/50 rounded-lg">
              {loadingState === 'pumpkin' && <PumpkinSpinner size="lg" />}
              {loadingState === 'cauldron' && (
                <BubblingCauldron size="lg" message="Brewing spooky magic..." />
              )}
              {loadingState === 'spirits' && (
                <FloatingSpirits count={5} message="Haunting the server..." />
              )}
              {loadingState === 'skeleton' && <GhostlySkeleton variant="article" count={2} />}
              {loadingState === 'none' && (
                <p className="text-ghost-white/50 italic">Select a loading component to preview</p>
              )}
            </div>
          </div>
        </div>

        {/* Toast Notifications Section */}
        <div className="bg-graveyard-gray border border-pumpkin-orange/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-pumpkin-orange mb-4">Toast Notifications</h2>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => toast.success('Success!', 'Your spooky action was successful! 🎃')}
              className="px-4 py-2 bg-poison-green text-haunted-black rounded-lg hover:bg-poison-green/80"
            >
              Success Toast
            </button>
            <button
              onClick={() => toast.error('Error!', 'Something wicked happened! 💀')}
              className="px-4 py-2 bg-blood-red text-ghost-white rounded-lg hover:bg-blood-red/80"
            >
              Error Toast
            </button>
            <button
              onClick={() => toast.warning('Warning!', 'The spirits are restless... ⚠️')}
              className="px-4 py-2 bg-pumpkin-orange text-haunted-black rounded-lg hover:bg-pumpkin-orange/80"
            >
              Warning Toast
            </button>
            <button
              onClick={() => toast.info('Info', 'The crystal ball reveals new information... 🔮')}
              className="px-4 py-2 bg-witch-purple text-ghost-white rounded-lg hover:bg-witch-purple/80"
            >
              Info Toast
            </button>
            <button
              onClick={() => toast.clearAll()}
              className="px-4 py-2 bg-graveyard-gray border border-ghost-white/20 text-ghost-white rounded-lg hover:bg-graveyard-gray/80"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Error Boundary Section */}
        <div className="bg-graveyard-gray border border-blood-red/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-blood-red mb-4">Error Boundaries</h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setShowError(!showError)}
                className="px-4 py-2 bg-blood-red text-ghost-white rounded-lg hover:bg-blood-red/80"
              >
                {showError ? 'Hide Error' : 'Trigger Error'}
              </button>
            </div>

            <ErrorBoundary level="component">
              <div className="min-h-[200px] flex items-center justify-center bg-haunted-black/50 rounded-lg p-4">
                <ErrorComponent />
              </div>
            </ErrorBoundary>
          </div>
        </div>

        {/* Standalone Error Message */}
        <div className="bg-graveyard-gray border border-ghost-white/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-ghost-white mb-4">Standalone Error Message</h2>

          <SpookyErrorMessage
            error={new Error('This is a preview of the spooky error message')}
            level="component"
            message="This is what users see when something goes wrong"
            onReset={() => toast.info('Reset clicked', 'Component would reset here')}
            onReload={() => toast.info('Reload clicked', 'Page would reload here')}
          />
        </div>

        {/* Size Variations */}
        <div className="bg-graveyard-gray border border-poison-green/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-poison-green mb-4">Size Variations</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg text-ghost-white mb-2">Pumpkin Spinner Sizes</h3>
              <div className="flex items-center gap-8 bg-haunted-black/50 rounded-lg p-4">
                <div className="text-center">
                  <PumpkinSpinner size="sm" />
                  <p className="text-xs text-ghost-white/60 mt-2">Small</p>
                </div>
                <div className="text-center">
                  <PumpkinSpinner size="md" />
                  <p className="text-xs text-ghost-white/60 mt-2">Medium</p>
                </div>
                <div className="text-center">
                  <PumpkinSpinner size="lg" />
                  <p className="text-xs text-ghost-white/60 mt-2">Large</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg text-ghost-white mb-2">Skeleton Variants</h3>
              <div className="space-y-4 bg-haunted-black/50 rounded-lg p-4">
                <div>
                  <p className="text-xs text-ghost-white/60 mb-2">Article Skeleton</p>
                  <GhostlySkeleton variant="article" count={1} />
                </div>
                <div>
                  <p className="text-xs text-ghost-white/60 mb-2">Feed Skeleton</p>
                  <GhostlySkeleton variant="feed" count={1} />
                </div>
                <div>
                  <p className="text-xs text-ghost-white/60 mb-2">Card Skeleton</p>
                  <GhostlySkeleton variant="card" count={1} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Note */}
        <div className="bg-witch-purple/20 border border-witch-purple rounded-lg p-4">
          <p className="text-ghost-white text-sm">
            <strong className="text-witch-purple">Note:</strong> This is a demonstration component.
            In production, these components are used throughout the application for loading states,
            error handling, and user notifications. See{' '}
            <code className="bg-haunted-black px-2 py-1 rounded">
              LOADING_AND_ERROR_HANDLING.md
            </code>{' '}
            for usage documentation.
          </p>
        </div>
      </div>
    </div>
  );
};
