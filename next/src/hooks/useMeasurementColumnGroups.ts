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

  const { data: fetchedData } = 
    trpc.measurement.columnGroup.list.useQuery({ projectId });

  // IMEを使用する入力欄のvalueにする際、
  // React Queryキャッシュを直接設定するとおかしくなるのでstateを使う
  const [data, setData] = useState<MeasurementColumnGroup[]>([]);
  useEffect(() => {
    if (fetchedData != null) {
      setData(fetchedData);
    }
  }, [data]);

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

  // add
  const { mutateAsync: add } =
    trpc.condition.columnGroup.add.useMutation();
  trpc.measurement.columnGroup.onAdd.useSubscription(
    { projectId },
    {
      onData: newData => setData([...data, newData]),
    }
  );

  // remove
  const { mutateAsync: remove } =
    trpc.condition.columnGroup.remove.useMutation();
  trpc.measurement.columnGroup.onRemove.useSubscription(
    { projectId },
    {
      onData: newData => setData(data.filter(mcg => mcg.id !== newData.id))
    }
  );

  return {
    data,
    update,
    add,
    remove,
  }
};

