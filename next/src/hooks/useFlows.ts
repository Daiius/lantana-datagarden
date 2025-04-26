import { useState, useEffect } from 'react';

import type { Flow } from '@/types';
import { trpc } from '@/providers/TrpcProvider';
import { useDebouncedCallback } from 'use-debounce';
import { DebounceTime } from './common';

export const useFlows = ({
  projectId,
}: {
  projectId: string;
}) => {
  const { 
    data: fetchedData,
    isLoading,
  } = trpc.flow.flow.list.useQuery({ projectId });
  const [data, setData] = useState<Flow[]>([]);
  useEffect(() => {
    if (fetchedData != null) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  const { mutateAsync: updateDb } =
    trpc.flow.flow.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newData: Flow) => await updateDb(newData),
    DebounceTime,
  );
  const update = async (newData: Flow) => {
    setData(data.map(d => d.id === newData.id ? newData : d));
    await debouncedUpdateDb(newData);
  };
  trpc.flow.flow.onUpdate.useSubscription(
    { projectId },
    {
      onData: newData => setData(
        data.map(d => d.id === newData.id ? newData : d)
      ),
    }
  );

  const { mutateAsync: add } = trpc.flow.flow.add.useMutation();
  const { mutateAsync: remove } = trpc.flow.flow.remove.useMutation();

  trpc.flow.flow.onAdd.useSubscription(
    { projectId },
    {
      onData: newData => setData([ ...data, newData]),
    }
  );

  trpc.flow.flow.onRemove.useSubscription(
    { projectId },
    {
      onData: newData => setData(data.filter(d => d.id !== newData.id)),
    }
  );

  return {
    data, 
    isLoading,
    update,
    add,
    remove,
  };
};

