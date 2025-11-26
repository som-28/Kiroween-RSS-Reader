import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SearchSuggestion } from '../../services/searchService';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  suggestions: SearchSuggestion[];
  recentSearches: string[];
  onClearRecent: () => void;
  onRemoveRecent: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchInput({
  value,
  onChange,
  onSearch,
  suggestions,
  recentSearches,
  onClearRecent,
  onRemoveRecent,
  isLoading = false,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShowSuggestions(isFocused && (suggestions.length > 0 || recentSearches.length > 0));
  }, [isFocused, suggestions.length, recentSearches.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (text: string) => {
    onChange(text);
    onSearch(text);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleRecentClick = (query: string) => {
    onChange(query);
    onSearch(query);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative">
      {/* Ouija board-styled search container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        {/* Mystical glow effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-witch-purple/20 via-pumpkin/20 to-poison-green/20 blur-2xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Search form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative bg-gradient-to-br from-haunted-black/90 via-graveyard/80 to-haunted-black/90 backdrop-blur-xl border-2 border-pumpkin/40 rounded-3xl shadow-2xl overflow-hidden">
            {/* Decorative corner elements */}
            <div className="absolute top-0 left-0 w-16 h-16">
              <svg viewBox="0 0 100 100" className="w-full h-full text-pumpkin/30">
                <circle cx="0" cy="0" r="50" fill="currentColor" />
              </svg>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16">
              <svg viewBox="0 0 100 100" className="w-full h-full text-witch-purple/30">
                <circle cx="100" cy="0" r="50" fill="currentColor" />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-16 h-16">
              <svg viewBox="0 0 100 100" className="w-full h-full text-poison-green/30">
                <circle cx="0" cy="100" r="50" fill="currentColor" />
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16">
              <svg viewBox="0 0 100 100" className="w-full h-full text-pumpkin/30">
                <circle cx="100" cy="100" r="50" fill="currentColor" />
              </svg>
            </div>

            {/* Input container */}
            <div className="relative flex items-center gap-4 p-6">
              {/* Mystical search icon */}
              <motion.div
                className="flex-shrink-0"
                animate={{
                  rotate: isLoading ? 360 : 0,
                }}
                transition={{
                  duration: 2,
                  repeat: isLoading ? Infinity : 0,
                  ease: 'linear',
                }}
              >
                <svg
                  className="w-8 h-8 text-pumpkin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </motion.div>

              {/* Input field */}
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                placeholder="Summon articles from the void..."
                className="flex-1 bg-transparent text-ghost text-xl placeholder-fog/50 outline-none font-medium"
              />

              {/* Clear button */}
              <AnimatePresence>
                {value && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    type="button"
                    onClick={() => onChange('')}
                    className="flex-shrink-0 p-2 hover:bg-graveyard/50 rounded-full transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-fog"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Search button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!value.trim() || isLoading}
                className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-pumpkin to-pumpkin/80 hover:from-pumpkin/90 hover:to-pumpkin/70 text-haunted-black font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pumpkin/30"
              >
                Search
              </motion.button>
            </div>
          </div>
        </form>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-4 z-50"
            >
              <div className="bg-gradient-to-br from-haunted-black/95 via-graveyard/90 to-haunted-black/95 backdrop-blur-xl border border-pumpkin/30 rounded-2xl shadow-2xl overflow-hidden">
                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <div className="p-4 border-b border-pumpkin/20">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-fog uppercase tracking-wide flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-witch-purple"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Recent Summonings
                      </h4>
                      <button
                        onClick={onClearRecent}
                        className="text-xs text-fog/60 hover:text-pumpkin transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((query, index) => (
                        <motion.div
                          key={query}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-2 group"
                        >
                          <button
                            onClick={() => handleRecentClick(query)}
                            className="flex-1 text-left px-3 py-2 text-ghost hover:bg-graveyard/50 rounded-lg transition-colors"
                          >
                            {query}
                          </button>
                          <button
                            onClick={() => onRemoveRecent(query)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blood-red/20 rounded transition-all"
                          >
                            <svg
                              className="w-4 h-4 text-blood-red"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mystical suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-4">
                    <h4 className="text-sm font-bold text-fog uppercase tracking-wide mb-3 flex items-center gap-2">
                      <motion.svg
                        className="w-4 h-4 text-poison-green"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </motion.svg>
                      Mystical Suggestions
                    </h4>
                    <div className="space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <motion.button
                          key={suggestion.text}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleSuggestionClick(suggestion.text)}
                          className="w-full text-left px-3 py-2 text-ghost hover:bg-graveyard/50 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-poison-green animate-pulse" />
                          {suggestion.text}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
