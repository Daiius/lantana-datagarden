'use client' // for hooks

import { useEffect, useState } from 'react';

import { trpc } from '@/providers/TrpcProvider';
import type { ColumnGroup } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import { DebounceTime } from '@/hooks/common';

export const useColumnGroups = ({
  projectId
}: {
  projectId: string;
}) => {

  const { 
    data: fetchedData,
    isLoading,
  } = trpc.condition.columnGroup.list.useQuery(
    { projectId },
    //{ keepPreviousData: true },
  );
  const [data, setData] = useState<ColumnGroup[]>([]);
  useEffect(() => {
    if (fetchedData != null) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  const { mutateAsync: updateDb } =
    trpc.condition.columnGroup.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newData: ColumnGroup) => await updateDb(newData),
    DebounceTime,
  );
  const update = async (newData: ColumnGroup) => {
    setData(data.map(d => d.id === newData.id ? newData : d));
    await debouncedUpdateDb(newData);
  };
  trpc.condition.columnGroup.onUpdate.useSubscription(
    { projectId },
    { onData: newData => setData(data.map(d => d.id === newData.id ? newData : d)) }
  );

  const { mutateAsync: add } =
    trpc.condition.columnGroup.add.useMutation();
  trpc.condition.columnGroup.onAdd.useSubscription(
    { projectId },
    {
      onData: newData => setData([...data, newData]),
    }
  );

  const { mutateAsync: remove } =
    trpc.condition.columnGroup.remove.useMutation();
  trpc.condition.columnGroup.onRemove.useSubscription(
    { projectId },
    {
      onData: info => setData(data.filter(d => d.id !== info.id)),
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

