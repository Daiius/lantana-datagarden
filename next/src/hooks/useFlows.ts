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
  const target = trpc.flow.flow;
  const { 
    data: fetchedData,
    isLoading,
  } = target.list.useQuery({ projectId });
  const [data, setData] = useState<Flow[]>([]);
  useEffect(() => {
    if (fetchedData != null) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  const { mutateAsync: updateDb } = target.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newData: Flow) => await updateDb(newData),
    DebounceTime,
  );
  const update = async (newData: Flow) => {
    setData(prev => prev.map(d => d.id === newData.id ? newData : d));
    await debouncedUpdateDb(newData);
  };
  target.onUpdate.useSubscription({ projectId }, {
    onData: newData => setData(prev => 
      prev.map(d => d.id === newData.id ? newData : d)
    ),
  });

  const { mutateAsync: add } = target.add.useMutation();
  const { mutateAsync: remove } = target.remove.useMutation();

  target.onAdd.useSubscription({ projectId }, {
    onData: newData => setData(prev => [ ...prev, newData]),
  });

  target.onRemove.useSubscription({ projectId }, {
    onData: newData => setData(prev => prev.filter(d => d.id !== newData.id)),
  });

  return {
    data, 
    isLoading,
    update,
    add,
    remove,
  };
};

