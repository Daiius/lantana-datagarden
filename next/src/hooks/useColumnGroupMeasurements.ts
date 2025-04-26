'use client' // for trpc hooks

import { useState, useEffect } from 'react';

import { trpc } from '@/providers/TrpcProvider';
import type { ColumnGroupMeasurement } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import { DebounceTime } from './common';

export type UseColumnGroupMeasurementsArgs = {
  projectId: string;
  columnGroupId: number;
};

export const useColumnGroupMeasurements = ({
  projectId,
  columnGroupId,
}: UseColumnGroupMeasurementsArgs) => {
  const { 
    data: fetchedData 
  } = trpc.condition.columnGroupMeasurement.list.useQuery({
    columnGroupId, projectId
  });
  const [data, setData] = useState<ColumnGroupMeasurement[]>([]);
  useEffect(() => {
    if (fetchedData != null) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  const { mutateAsync: updateDb } =
    trpc.condition.columnGroupMeasurement.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newValue: ColumnGroupMeasurement) => await updateDb(newValue),
    DebounceTime,
  );
  const update = async (newValue: ColumnGroupMeasurement) => {
    setData(data.map(d => d.id === newValue.id ? newValue : d));
    await debouncedUpdateDb(newValue);
  };

  trpc.condition.columnGroupMeasurement.onUpdate.useSubscription(
    { projectId, columnGroupId },
    {
      onData: newData => setData(
        data.map(d => d.id === newData.id ? newData : d)
      ),
    }
  );

  const { mutateAsync: add } =
    trpc.condition.columnGroupMeasurement.add.useMutation();
  trpc.condition.columnGroupMeasurement.onAdd.useSubscription(
    { projectId, columnGroupId },
    { 
      onData: newData => setData(
        data.map(d => d.id === newData.id ? newData : d)
      ), 
    }
  );

  const { mutateAsync: remove } =
    trpc.condition.columnGroupMeasurement.remove.useMutation();
  trpc.condition.columnGroupMeasurement.onRemove.useSubscription(
    { projectId, columnGroupId },
    {
      onData: info => setData(
        data.filter(d => d.id !== info.id)
      ),
    }
  );

  return { 
    data,
    update,
    add,
    remove,
  };
};

