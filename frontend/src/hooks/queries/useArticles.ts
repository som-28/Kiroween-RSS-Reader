import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  articleService,
  type ArticleFeedbackInput,
  type UpdateArticleInput,
} from '../../services/articleService';
import { queryKeys } from '../../lib/queryClient';
import type { Article } from '../../types/models';

/**
 * Hook to fetch articles with optional filters
 */
export function useArticles(params?: {
  feedId?: string;
  isRead?: boolean;
  isFavorite?: boolean;
  limit?: number;
  offset?: number;
  topics?: string[];
  startDate?: Date;
  endDate?: Date;
}) {
  return useQuery({
    queryKey: queryKeys.articles(params),
    queryFn: () => articleService.getArticles(params),
    // Keep data fresh for article lists
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single article by ID
 */
export function useArticle(id: string) {
  return useQuery({
    queryKey: queryKeys.article(id),
    queryFn: () => articleService.getArticle(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch article summary
 */
export function useArticleSummary(id: string) {
  return useQuery({
    queryKey: queryKeys.articleSummary(id),
    queryFn: () => articleService.getArticleSummary(id),
    enabled: !!id,
    // Summaries don't change, cache indefinitely
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Hook to fetch related articles
 */
export function useRelatedArticles(id: string) {
  return useQuery({
    queryKey: queryKeys.relatedArticles(id),
    queryFn: () => articleService.getRelatedArticles(id),
    enabled: !!id,
    // Related articles can be cached for a while
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to generate audio for an article
 */
export function useGenerateAudio(id: string) {
  return useQuery({
    queryKey: queryKeys.articleAudio(id),
    queryFn: () => articleService.generateAudio(id),
    enabled: false, // Only fetch when explicitly requested
    // Audio URLs don't change, cache indefinitely
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Hook to update an article (mark as read, favorite, etc.)
 */
export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateArticleInput }) =>
      articleService.updateArticle(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.article(id) });

      // Snapshot previous value
      const previousArticle = queryClient.getQueryData(queryKeys.article(id));

      // Optimistically update
      queryClient.setQueryData(queryKeys.article(id), (old: Article | undefined) => {
        if (!old) return old;
        return { ...old, ...updates };
      });

      // Also update in article lists
      queryClient.setQueriesData({ queryKey: ['articles'] }, (old: Article[] | undefined) => {
        if (!old) return old;
        return old.map((article) => (article.id === id ? { ...article, ...updates } : article));
      });

      return { previousArticle };
    },
    onError: (_err, { id }, context) => {
      // Rollback on error
      if (context?.previousArticle) {
        queryClient.setQueryData(queryKeys.article(id), context.previousArticle);
      }
    },
    onSettled: (_data, _error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.article(id) });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

/**
 * Hook to submit feedback for an article
 */
export function useSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback: ArticleFeedbackInput }) =>
      articleService.submitFeedback(id, feedback),
    onSuccess: (_data, { id, feedback }) => {
      // Update article in cache with new feedback
      queryClient.setQueryData(queryKeys.article(id), (old: Article | undefined) => {
        if (!old) return old;
        return { ...old, userFeedback: feedback.feedback };
      });

      // Update in article lists
      queryClient.setQueriesData({ queryKey: ['articles'] }, (old: Article[] | undefined) => {
        if (!old) return old;
        return old.map((article) =>
          article.id === id ? { ...article, userFeedback: feedback.feedback } : article
        );
      });

      // Invalidate to trigger preference recalculation
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences });
    },
  });
}
