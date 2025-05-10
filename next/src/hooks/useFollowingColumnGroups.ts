'use client' // for hooks

import { trpc } from '@/providers/TrpcProvider';

export type UseFollowingColumnGroupsArgs = {
  flowId: number;
  projectId: string;
}

export const useFollowingColumnGroups = ({
  flowId,
  projectId,
}: UseFollowingColumnGroupsArgs) => {
  const target = trpc.table.followingColumnGroups;
  const {
    data,
    isLoading,
    refetch,
  } = target.list.useQuery({ id: flowId, projectId });
  target.onUpdate.useSubscription(
    { id: flowId, projectId },
    {
      onData: async _ => await refetch(),
    }
  );

  return {
    data: data ?? [],
    isLoading,
  }
};

