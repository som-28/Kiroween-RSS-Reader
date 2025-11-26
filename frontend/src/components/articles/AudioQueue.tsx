import { useState } from 'react';
import { motion } from 'framer-motion';
import AudioPlayer from './AudioPlayer';

interface QueuedAudio {
  id: string;
  audioUrl: string;
  duration?: number;
  title: string;
}

interface AudioQueueProps {
  queue: QueuedAudio[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function AudioQueue({ queue, onRemove, onClear }: AudioQueueProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const currentAudio = queue[currentIndex];

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleClose = () => {
    if (currentAudio) {
      onRemove(currentAudio.id);
      if (currentIndex >= queue.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    }
  };

  if (queue.length === 0) {
    return null;
  }

  return (
    <>
      {/* Main audio player */}
      {currentAudio && !isMinimized && (
        <div className="fixed bottom-6 right-6 z-50">
          <AudioPlayer
            audioUrl={currentAudio.audioUrl}
            duration={currentAudio.duration}
            title={currentAudio.title}
            onClose={handleClose}
          />

          {/* Queue controls */}
          {queue.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 bg-haunted-black/90 backdrop-blur-lg border border-witch-purple/50 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-fog">
                  Queue: {currentIndex + 1} / {queue.length}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClear}
                  className="text-xs text-blood-red hover:text-blood-red/80 transition-colors"
                >
                  Clear All
                </motion.button>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="flex-1 px-3 py-2 bg-witch-purple/20 hover:bg-witch-purple/30 border border-witch-purple rounded text-xs text-witch-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⏮️ Previous
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  disabled={currentIndex === queue.length - 1}
                  className="flex-1 px-3 py-2 bg-witch-purple/20 hover:bg-witch-purple/30 border border-witch-purple rounded text-xs text-witch-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next ⏭️
                </motion.button>
              </div>

              {/* Queue list */}
              <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                {queue.map((audio, index) => (
                  <motion.div
                    key={audio.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between gap-2 p-2 rounded ${
                      index === currentIndex
                        ? 'bg-witch-purple/30 border border-witch-purple'
                        : 'bg-graveyard/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-ghost truncate">{audio.title}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onRemove(audio.id)}
                      className="text-fog hover:text-blood-red transition-colors"
                    >
                      ✕
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Minimized indicator */}
      {isMinimized && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-witch-purple hover:bg-witch-purple/80 rounded-full flex items-center justify-center text-3xl shadow-2xl transition-colors"
        >
          🔮
        </motion.button>
      )}
    </>
  );
}
