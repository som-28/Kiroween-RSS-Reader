import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
  title: string;
  onClose?: () => void;
}

export default function AudioPlayer({ audioUrl, duration, title, onClose }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setTotalDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];

    audio.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="bg-gradient-to-br from-witch-purple/20 via-haunted-black/90 to-haunted-black/90 backdrop-blur-2xl border border-witch-purple/40 rounded-2xl shadow-2xl p-6 w-96">
        {/* Modern header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <motion.div
              className="relative w-12 h-12 flex-shrink-0"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-witch-purple to-poison-green rounded-2xl opacity-30 blur-lg" />
              <div className="absolute inset-0 bg-gradient-to-br from-witch-purple/40 to-poison-green/40 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm border border-witch-purple/30">
                🔮
              </div>
            </motion.div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-ghost truncate">{title}</h4>
              <p className="text-xs text-fog/70 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-poison-green rounded-full animate-pulse" />
                Audio Summary
              </p>
            </div>
          </div>
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-graveyard/50 hover:bg-graveyard text-fog/60 hover:text-ghost transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          )}
        </div>

        {/* Modern progress bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="range"
              min="0"
              max={totalDuration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-graveyard/50 rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #6a0dad ${(currentTime / totalDuration) * 100}%, rgba(26, 26, 26, 0.5) ${(currentTime / totalDuration) * 100}%)`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-fog/70 mt-2 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Modern controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Speed control */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={changeSpeed}
            className="px-4 py-2 bg-witch-purple/20 hover:bg-witch-purple/30 border border-witch-purple/40 rounded-xl text-sm font-bold text-witch-purple transition-all duration-300 shadow-lg shadow-witch-purple/10"
          >
            {playbackSpeed}×
          </motion.button>

          {/* Play/Pause button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlayPause}
            className="relative w-14 h-14 bg-gradient-to-br from-witch-purple to-witch-purple/80 hover:from-witch-purple/90 hover:to-witch-purple/70 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl shadow-witch-purple/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
            {isPlaying ? (
              <svg className="w-6 h-6 text-ghost" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-ghost ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </motion.button>

          {/* Volume indicator */}
          <div className="px-4 py-2 bg-witch-purple/20 border border-witch-purple/40 rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 text-witch-purple" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #6a0dad 0%, #8b2fd9 100%);
          border: 3px solid #39ff14;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 15px rgba(106, 13, 173, 0.6), 0 0 30px rgba(57, 255, 20, 0.3);
          transition: all 0.3s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(106, 13, 173, 0.8), 0 0 40px rgba(57, 255, 20, 0.5);
        }

        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #6a0dad 0%, #8b2fd9 100%);
          border: 3px solid #39ff14;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 15px rgba(106, 13, 173, 0.6), 0 0 30px rgba(57, 255, 20, 0.3);
          transition: all 0.3s ease;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(106, 13, 173, 0.8), 0 0 40px rgba(57, 255, 20, 0.5);
        }
      `}</style>
    </motion.div>
  );
}
