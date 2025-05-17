'use client' // for trpc hooks

import { useState, useEffect } from 'react';

import { trpc } from '@/providers/TrpcProvider';
import type { ColumnGroupMeasurement } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import { DebounceTime } from './common';

import { log } from '@/debug';

export type UseColumnGroupMeasurementsArgs = {
  projectId: string;
  columnGroupId: number;
};

export const useColumnGroupMeasurements = ({
  projectId,
  columnGroupId,
}: UseColumnGroupMeasurementsArgs) => {
  const target = trpc.condition.columnGroupMeasurement;
  const { 
    data: fetchedData 
  } = target.list.useQuery({ columnGroupId, projectId });
  const [data, setData] = useState<ColumnGroupMeasurement[]>([]);
  useEffect(() => {
    if (fetchedData != null) {
      log('useColumnGroupMeasurements:useEffect updated from server data');
      setData(fetchedData);
    }
  }, [fetchedData]);

  const { mutateAsync: updateDb } = target.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newValue: ColumnGroupMeasurement) => await updateDb(newValue),
    DebounceTime,
  );
  const update = async (newValue: ColumnGroupMeasurement) => {
    setData(data.map(d => d.id === newValue.id ? newValue : d));
    await debouncedUpdateDb(newValue);
  };

  target.onUpdate.useSubscription({ projectId, columnGroupId }, {
    onData: newData => setData(data.map(d => d.id === newData.id ? newData : d)),
  });

  const { mutateAsync: add } = target.add.useMutation();
  target.onAdd.useSubscription({ projectId, columnGroupId }, { 
    onData: newData => setData([ ...data, newData]), 
  });

  const { mutateAsync: remove } = target.remove.useMutation();
  target.onRemove.useSubscription({ projectId, columnGroupId }, {
    onData: info => setData(data.filter(d => d.id !== info.id)),
  });

  return { 
    data,
    update,
    add,
    remove,
  };
};

