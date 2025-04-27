'use client' // for hooks

import { useState, useEffect } from 'react';

import { trpc } from '@/providers/TrpcProvider';

import type { Data } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import { DebounceTime } from './common';

export type UseDataArgs = {
  projectId: Data['projectId'];
  columnGroupId: Data['columnGroupId'] | Data['columnGroupId'][];
};

export const useData = ({
  projectId,
  columnGroupId,
}: UseDataArgs) => {
  const target = trpc.condition.data;
  const { 
    data: fetchedData, 
    error, 
    isLoading,
  } = target.list.useQuery({ projectId, columnGroupId });
  const [data, setData] = useState<Data[]>([]);
  useEffect(() => {
    if (fetchedData) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  const { mutateAsync: updateDb } = target.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newData: Data) => await updateDb(newData),
    DebounceTime,
  );
  const update = async (newData: Data) => {
    setData(data.map(d => d.id === newData.id ? newData : d));
    await debouncedUpdateDb(newData);
  };
  target.onUpdate.useSubscription(
    { projectId, columnGroupId },
    {
      onData: newData => setData(data.map(d => d.id === newData.id ? newData : d)),
      onError: err => console.error(err),
    }
  );
  const { mutateAsync: remove } = target.remove.useMutation();
  target.onRemove.useSubscription(
    { projectId, columnGroupId },
    {
      onData: info => setData(data.filter(d => d.id !== info.id)),
      onError: err => console.error(err),
    }
  );

  const { mutateAsync: add } = target.add.useMutation();
  target.onAdd.useSubscription(
    { projectId, columnGroupId },
    {
      onData: newData => setData([...data, newData]),
      onError: err => console.error(err),
    }
  );

  return {
    data,
    update,
    add,
    remove,
    isLoading,
    error,
  };
};

