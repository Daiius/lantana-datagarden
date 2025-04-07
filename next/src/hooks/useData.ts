'use client'

import { trpc } from '@/providers/TrpcProvider';

import type { Data } from '@/types';

export const useData = ({
  id,
  projectId,
  columnGroupId,
  initialData,
}: Pick<Data, 'id' | 'projectId' | 'columnGroupId'> & {
  initialData?: Data,
}) => {
  const utils = trpc.useUtils();
  const { data, error, isLoading } = trpc.data.get.useQuery(
    { id, projectId, columnGroupId },
    initialData == null
    ? { enabled: true }
    : { enabled: false, initialData }
  );
  trpc.data.onUpdate.useSubscription(
    { id, projectId, columnGroupId },
    {
      onData: data => utils.data.get.setData(
        { id, projectId, columnGroupId },
        data
      ),
      onError: err => console.error(err),
    }
  );
  const { mutateAsync: update } = trpc.data.update.useMutation();
  const { mutateAsync: remove } = trpc.data.remove.useMutation();

  return {
    data,
    update,
    remove,
    isLoading,
    error,
  };
};

