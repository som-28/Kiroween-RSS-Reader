import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { searchService, feedService, articleService } from '../services';
import type { SearchFilters as Filters, SearchSuggestion } from '../services/searchService';
import type { Article, Feed } from '../types/models';
import SearchInput from '../components/search/SearchInput';
import SearchFiltersComponent from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import { pageTransition } from '../router';

export default function Search() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  // Load feeds and topics on mount
  useEffect(() => {
    loadFeeds();
    loadTopics();
    setRecentSearches(searchService.getRecentSearches());
  }, []);

  const loadFeeds = async () => {
    try {
      const feedList = await feedService.getFeeds();
      setFeeds(feedList);
    } catch (error) {
      console.error('Failed to load feeds:', error);
    }
  };

  const loadTopics = async () => {
    try {
      // Get articles to extract topics
      const articleList = await articleService.getArticles({ limit: 100 });
      const topicsSet = new Set<string>();
      articleList.forEach((article) => {
        article.topics.forEach((topic) => topicsSet.add(topic));
      });
      setAvailableTopics(Array.from(topicsSet).sort());
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  };

  // Debounced suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchService.getSuggestions(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Failed to get suggestions:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = useCallback(
    async (searchQuery: string, searchFilters: Filters, pageNum: number = 1) => {
      setIsLoading(true);
      try {
        const result = await searchService.search(searchQuery, searchFilters, pageNum);

        if (pageNum === 1) {
          setArticles(result.articles);
        } else {
          setArticles((prev) => [...prev, ...result.articles]);
        }

        setTotal(result.total);
        setPage(pageNum);
        setHasMore(result.hasMore);
        setHasSearched(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    performSearch(searchQuery, filters, 1);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    if (hasSearched) {
      performSearch(query, newFilters, 1);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      performSearch(query, filters, page + 1);
    }
  };

  const handleClearRecent = () => {
    searchService.clearRecentSearches();
    setRecentSearches([]);
  };

  const handleRemoveRecent = (searchQuery: string) => {
    searchService.removeRecentSearch(searchQuery);
    setRecentSearches(searchService.getRecentSearches());
  };

  const handleMarkRead = async (id: string) => {
    try {
      await articleService.updateArticle(id, { isRead: true });
      setArticles((prev) =>
        prev.map((article) => (article.id === id ? { ...article, isRead: true } : article))
      );
    } catch (error) {
      console.error('Failed to mark article as read:', error);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const article = articles.find((a) => a.id === id);
      if (!article) return;

      await articleService.updateArticle(id, { isFavorite: !article.isFavorite });
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isFavorite: !a.isFavorite } : a))
      );
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleFeedback = async (id: string, feedback: 'like' | 'dislike' | null) => {
    try {
      await articleService.submitFeedback(id, { feedback });
      setArticles((prev) =>
        prev.map((article) =>
          article.id === id ? { ...article, userFeedback: feedback } : article
        )
      );
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleGenerateAudio = async (id: string) => {
    try {
      const { audioUrl, duration } = await articleService.generateAudio(id);
      setArticles((prev) =>
        prev.map((article) =>
          article.id === id ? { ...article, audioUrl, audioDuration: duration } : article
        )
      );
    } catch (error) {
      console.error('Failed to generate audio:', error);
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8"
    >
      {/* Page header */}
      <div className="text-center space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-creepy text-transparent bg-clip-text bg-gradient-to-r from-pumpkin via-witch-purple to-poison-green"
        >
          Mystical Search
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-fog/80 text-lg"
        >
          Summon articles from the depths of your archive...
        </motion.p>
      </div>

      {/* Search input */}
      <SearchInput
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        suggestions={suggestions}
        recentSearches={recentSearches}
        onClearRecent={handleClearRecent}
        onRemoveRecent={handleRemoveRecent}
        isLoading={isLoading}
      />

      {/* Filters */}
      <SearchFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        feeds={feeds}
        availableTopics={availableTopics}
      />

      {/* Results */}
      <SearchResults
        articles={articles}
        query={query}
        total={total}
        isLoading={isLoading}
        hasSearched={hasSearched}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        onMarkRead={handleMarkRead}
        onToggleFavorite={handleToggleFavorite}
        onFeedback={handleFeedback}
        onGenerateAudio={handleGenerateAudio}
      />
    </motion.div>
  );
}
