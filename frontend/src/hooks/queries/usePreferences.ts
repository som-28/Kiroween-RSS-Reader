import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { preferencesService, type UserPreferences } from '../../services/preferencesService';
import { queryKeys } from '../../lib/queryClient';

/**
 * Hook to fetch user preferences
 */
export function usePreferences() {
  return useQuery({
    queryKey: queryKeys.preferences,
    queryFn: () => preferencesService.getPreferences(),
    // Preferences change infrequently, cache for 10 minutes
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to update user preferences
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Partial<UserPreferences>) =>
      preferencesService.updatePreferences(preferences),
    onMutate: async (preferences) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.preferences });

      // Snapshot previous value
      const previousPreferences = queryClient.getQueryData(queryKeys.preferences);

      // Optimistically update
      queryClient.setQueryData(queryKeys.preferences, (old: UserPreferences | undefined) => {
        if (!old) return old;
        return { ...old, ...preferences };
      });

      return { previousPreferences };
    },
    onError: (_err, _preferences, context) => {
      // Rollback on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(queryKeys.preferences, context.previousPreferences);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences });
      // Invalidate articles as relevance scores may have changed
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}
