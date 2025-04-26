'use client' // for hooks

import { useEffect, useState } from 'react';

import { trpc } from '@/providers/TrpcProvider';
import type { MeasurementColumnGroup } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import { DebounceTime } from '@/hooks/common';

export type UseMeasurementColumnGroupsArgs = {
  projectId: string;
}

/**
 * 指定されたprojectに属するMeasurementColumnGroup[]を取得します
 * IMEを用いた入力欄バインド用のstateと、React Queryによるキャッシュを持ちます
 * 
 * NOTE subscriptionは別コンポ―ネントで行います
 */
export const useMeasurementColumnGroups = ({
  projectId
}: UseMeasurementColumnGroupsArgs) => {

  const target = trpc.measurement.columnGroup;

  const { 
    data: fetchedData,
    isLoading,
  } = target.list.useQuery({ projectId });

  // IMEを使用する入力欄のvalueにする際、
  // React Queryキャッシュを直接設定するとおかしくなるのでstateを使う
  const [data, setData] = useState<MeasurementColumnGroup[]>([]);
  useEffect(() => {
    if (fetchedData != null) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  const { mutateAsync: updateDb } = target.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newData: MeasurementColumnGroup) => await updateDb(newData),
    DebounceTime,
  );
  const update = async (newValue: MeasurementColumnGroup) => {
    setData(data.map(d => d.id === newValue.id ? newValue: d));
    await debouncedUpdateDb(newValue);
  };

  const { mutateAsync: add } = target.add.useMutation();

  const { mutateAsync: remove } = target.remove.useMutation();

  return {
    data,
    isLoading,
    update,
    add,
    remove,
  }
};

