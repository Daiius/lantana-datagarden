'use client'

import { useState, useEffect } from 'react';

import { Column, ColumnGroup } from '@/types';
import { trpc } from '@/providers/TrpcProvider';
import { useDebouncedCallback } from 'use-debounce';
import { DebounceTime } from './common';

export const useColumns = ({
  projectId,
  columnGroupId,
}: {
  projectId: string;
  columnGroupId: ColumnGroup['id'] | ColumnGroup['id'][];
}) => {
  const target = trpc.condition.column;
  const { 
    data: fetchedData,
    isLoading,
  } = target.list.useQuery({ projectId, columnGroupId });
  const [data, setData] = useState<Column[]>([]);
  useEffect(() => {
    if (fetchedData != null) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  const { mutateAsync: updateDb } = target.update.useMutation();
  const debouncedUpddateDb = useDebouncedCallback(
    async (newValue: Column) => await updateDb(newValue),
    DebounceTime,
  );
  const update = async (newValue: Column) => {
    setData(prev => prev.map(d => d.id === newValue.id ? newValue : d));
    await debouncedUpddateDb(newValue);
  };

  const { mutateAsync: add } = target.add.useMutation();
  target.onAdd.useSubscription({ projectId, columnGroupId }, {
    onData: newData => setData(prev => [...prev, newData]),
  });
  const { mutateAsync: remove } = target.remove.useMutation();
  target.onRemove.useSubscription({ projectId, columnGroupId }, {
    onData: newData => setData(prev => prev.filter(d => d.id !== newData.id))
  });

  return {
    data,
    isLoading,
    add,
    remove,
    update,
  };
};

