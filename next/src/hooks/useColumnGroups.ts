'use client' // for hooks

import { useEffect, useState } from 'react';

import { trpc } from '@/providers/TrpcProvider';
import type { ColumnGroup } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import { DebounceTime } from '@/hooks/common';

/**
 * 指定されたprojectに属するColumnGroup[]を取得します
 * IMEを用いた入力欄バインド用のstateと、React Queryによるキャッシュを持ちます
 *
 * NOTE subscriptionは別コンポーネントで行います
 */
export const useColumnGroups = ({
  projectId
}: {
  projectId: string;
}) => {

  const target = trpc.condition.columnGroup;

  const { 
    data: fetchedData,
    isLoading,
  } = target.list.useQuery({ projectId });
  const [data, setData] = useState<ColumnGroup[]>([]);
  useEffect(() => {
    if (fetchedData != null) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  const { mutateAsync: updateDb } = target.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newData: ColumnGroup) => await updateDb(newData),
    DebounceTime,
  );
  const update = async (newData: ColumnGroup) => {
    setData(prev => prev.map(d => d.id === newData.id ? newData : d));
    await debouncedUpdateDb(newData);
  };

  const { mutateAsync: add } = target.add.useMutation();
  const { mutateAsync: remove } = target.remove.useMutation();

  return {
    data,
    isLoading,
    update,
    add,
    remove,
  };
};

