'use client'

import { useEffect, useState } from 'react';

import type { Measurement } from '@/types';
import { trpc } from '@/providers/TrpcProvider';
import { useDebouncedCallback } from 'use-debounce';
import { DebounceTime } from './common';


export type UseMeasurementsArgs = {
  projectId: string;
  columnGroupId: number;
}

export const useMeasurements = ({
  projectId,
  columnGroupId,
}: UseMeasurementsArgs) => {
  
  const target = trpc.measurement.data;

  const {
    data: fetchedData,
    isLoading,
  } = target.list.useQuery({ projectId, columnGroupId });
  const [data, setData] = useState<Measurement[]>([]);
  useEffect(() => {
    if (fetchedData) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  const { mutateAsync: updateDb } = target.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newData: Measurement) => await updateDb(newData),
    DebounceTime,
  );
  const update = async (newData: Measurement) => {
    setData(prev => prev.map(d => d.id === newData.id ? newData : d));
    await debouncedUpdateDb(newData);
  };

  const { mutateAsync: add } = target.add.useMutation();
  target.onAdd.useSubscription({ projectId, columnGroupId }, {
    onData: newData => setData(prev => [...prev, newData]),
  });

  const { mutateAsync: remove } = target.remove.useMutation();
  target.onRemove.useSubscription({ projectId, columnGroupId }, {
    onData: info => setData(prev => prev.filter(d => d.id !== info.id)),
  });

  return {
    data,
    isLoading,
    update,
    add,
    remove,
  };
};

