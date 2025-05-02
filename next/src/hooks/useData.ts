'use client' // for hooks

import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { trpc } from '@/providers/TrpcProvider';

import type { Data } from '@/types';
import { DebounceTime } from './common';

import { log, error } from '@/debug';


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
    isLoading,
  } = target.list.useQuery({ projectId, columnGroupId });
  const [data, setData] = useState<Data[]>([]);
  useEffect(() => {
    if (fetchedData) {
      log('useData:useEffect', fetchedData);
      setData(fetchedData);
    }
  }, [fetchedData]);

  const { mutateAsync: updateDb } = target.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newData: Data) => await updateDb(newData),
    DebounceTime,
  );
  const update = async (newData: Data) => {
    log('useData:update: %o', newData);
    setData(prev => prev.map(d => d.id === newData.id ? newData : d)
    );
    await debouncedUpdateDb(newData);
  };
  target.onUpdate.useSubscription({ projectId, columnGroupId }, {
    onData: newData => setData(prev => prev.map(d => d.id === newData.id ? newData : d)),
    onError: err => error(err),
  });
  const { mutateAsync: remove } = target.remove.useMutation();
  target.onRemove.useSubscription(
    { projectId, columnGroupId },
    {
      onData: info => setData(prev => prev.filter(d => d.id !== info.id)),
      onError: err => error(err),
    }
  );

  const { mutateAsync: add } = target.add.useMutation();
  target.onAdd.useSubscription(
    { projectId, columnGroupId },
    {
      onData: newData => setData(prev => [...prev, newData]),
      onError: err => error(err),
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

