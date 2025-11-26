import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  feedService,
  type CreateFeedInput,
  type UpdateFeedInput,
} from '../../services/feedService';
import { queryKeys } from '../../lib/queryClient';

/**
 * Hook to fetch all feeds
 */
export function useFeeds() {
  return useQuery({
    queryKey: queryKeys.feeds,
    queryFn: () => feedService.getFeeds(),
  });
}

/**
 * Hook to fetch a single feed by ID
 */
export function useFeed(id: string) {
  return useQuery({
    queryKey: queryKeys.feed(id),
    queryFn: () => feedService.getFeed(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new feed
 */
export function useCreateFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFeedInput) => feedService.createFeed(input),
    onSuccess: () => {
      // Invalidate feeds list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.feeds });
    },
  });
}

/**
 * Hook to update a feed
 */
export function useUpdateFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFeedInput }) =>
      feedService.updateFeed(id, input),
    onMutate: async ({ id, input }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.feed(id) });

      // Snapshot previous value
      const previousFeed = queryClient.getQueryData(queryKeys.feed(id));

      // Optimistically update
      queryClient.setQueryData(queryKeys.feed(id), (old: any) => ({
        ...old,
        ...input,
      }));

      return { previousFeed };
    },
    onError: (_err, { id }, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(queryKeys.feed(id), context.previousFeed);
      }
    },
    onSettled: (_data, _error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.feed(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.feeds });
    },
  });
}

/**
 * Hook to delete a feed
 */
export function useDeleteFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => feedService.deleteFeed(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.feeds });

      // Snapshot previous value
      const previousFeeds = queryClient.getQueryData(queryKeys.feeds);

      // Optimistically remove from list
      queryClient.setQueryData(
        queryKeys.feeds,
        (old: any[]) => old?.filter((feed) => feed.id !== id) || []
      );

      return { previousFeeds };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousFeeds) {
        queryClient.setQueryData(queryKeys.feeds, context.previousFeeds);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.feeds });
      // Also invalidate articles since they depend on feeds
      queryClient.invalidateQueries({ queryKey: queryKeys.articles() });
    },
  });
}

/**
 * Hook to refresh a feed
 */
export function useRefreshFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => feedService.refreshFeed(id),
    onSuccess: (data, id) => {
      // Update the feed in cache
      queryClient.setQueryData(queryKeys.feed(id), data.feed);
      // Invalidate feeds list
      queryClient.invalidateQueries({ queryKey: queryKeys.feeds });
      // Invalidate articles to show new ones
      queryClient.invalidateQueries({ queryKey: queryKeys.articles() });
    },
  });
}
