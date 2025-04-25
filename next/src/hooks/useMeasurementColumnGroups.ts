'use client' // for hooks

import { useEffect, useState } from 'react';

import { trpc } from '@/providers/TrpcProvider';
import type { MeasurementColumnGroup } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import { DebounceTime } from '@/hooks/common';

export type UseMeasurementColumnGroupsArgs = {
  projectId: string;
}

export const useMeasurementColumnGroups = ({
  projectId
}: UseMeasurementColumnGroupsArgs) => {

  const { 
    data: fetchedData,
    isLoading,
  } = trpc.measurement.columnGroup.list.useQuery({ projectId });

  // IMEを使用する入力欄のvalueにする際、
  // React Queryキャッシュを直接設定するとおかしくなるのでstateを使う
  const [data, setData] = useState<MeasurementColumnGroup[]>([]);
  useEffect(() => {
    if (fetchedData != null) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  const { mutateAsync: updateDb } =
    trpc.measurement.columnGroup.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newData: MeasurementColumnGroup) => await updateDb(newData),
    DebounceTime,
  );
  const update = async (newValue: MeasurementColumnGroup) => {
    setData(data.map(d => d.id === newValue.id ? newValue: d));
    await debouncedUpdateDb(newValue);
  };

  trpc.measurement.columnGroup.onUpdate.useSubscription(
    { projectId },
    { onData: newData => {
      console.log('onUpdate: %o', newData);
      setData(data.map(d => d.id === newData.id ? newData : d)) ;
    }}
  );

  // add
  const { mutateAsync: add } =
    trpc.measurement.columnGroup.add.useMutation();
  trpc.measurement.columnGroup.onAdd.useSubscription(
    { projectId },
    {
      onData: newData => setData([...data, newData]),
    }
  );

  // remove
  const { mutateAsync: remove } =
    trpc.measurement.columnGroup.remove.useMutation();
  trpc.measurement.columnGroup.onRemove.useSubscription(
    { projectId },
    {
      onData: newData => setData(data.filter(mcg => mcg.id !== newData.id))
    }
  );

  return {
    data,
    isLoading,
    update,
    add,
    remove,
  }
};

