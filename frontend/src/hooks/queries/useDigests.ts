import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  digestService,
  type DigestPreferences,
  type GenerateDigestInput,
} from '../../services/digestService';
import { queryKeys } from '../../lib/queryClient';

/**
 * Hook to fetch the latest digest
 */
export function useLatestDigest() {
  return useQuery({
    queryKey: queryKeys.latestDigest,
    queryFn: () => digestService.getLatestDigest(),
    // Digests are relatively static, cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch all digests with optional filters
 */
export function useDigests(type?: 'daily' | 'weekly' | 'custom', limit?: number) {
  return useQuery({
    queryKey: queryKeys.digests({ type, limit }),
    queryFn: () => digestService.getAllDigests(type, limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a specific digest by ID
 */
export function useDigest(id: string) {
  return useQuery({
    queryKey: queryKeys.digest(id),
    queryFn: () => digestService.getDigestById(id),
    enabled: !!id,
    // Individual digests don't change, cache for longer
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Hook to generate a new digest
 */
export function useGenerateDigest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GenerateDigestInput) => digestService.generateDigest(input),
    onSuccess: (data) => {
      // Update latest digest
      queryClient.setQueryData(queryKeys.latestDigest, data);
      // Invalidate digest lists
      queryClient.invalidateQueries({ queryKey: ['digests'] });
    },
  });
}

/**
 * Hook to update digest preferences
 */
export function useUpdateDigestPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Partial<DigestPreferences>) =>
      digestService.updateDigestPreferences(preferences),
    onSuccess: () => {
      // Invalidate preferences to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences });
    },
  });
}

/**
 * Hook to delete a digest
 */
export function useDeleteDigest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => digestService.deleteDigest(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['digests'] });

      // Snapshot previous values
      const previousDigests = queryClient.getQueryData(['digests']);
      const previousLatest = queryClient.getQueryData(queryKeys.latestDigest);

      // Optimistically remove from lists
      queryClient.setQueriesData({ queryKey: ['digests'] }, (old: any[] | undefined) => {
        if (!old) return old;
        return old.filter((digest) => digest.id !== id);
      });

      return { previousDigests, previousLatest };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousDigests) {
        queryClient.setQueryData(['digests'], context.previousDigests);
      }
      if (context?.previousLatest) {
        queryClient.setQueryData(queryKeys.latestDigest, context.previousLatest);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['digests'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.latestDigest });
    },
  });
}
