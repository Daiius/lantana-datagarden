'use client' // for hooks

import { useEffect, useState } from 'react';
import { trpc } from '@/providers/TrpcProvider';


import type { MeasurementColumn } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import { DebounceTime } from '@/hooks/common';

export type UseMeasurementColumnsArgs = {
  projectId: string;
  columnGroupId: number;
};

export const useMeasurementColumns = ({
  projectId,
  columnGroupId,
}: UseMeasurementColumnsArgs) => {
  const target = trpc.measurement.column;
  const { 
    data: fetchedData,
    isLoading,
  } = target.list.useQuery(
    { projectId, columnGroupId },
  );
  // NOTE IME対応には必要らしい、React Queryキャッシュと重複するのは嫌だが...
  const [data, setData] = useState<MeasurementColumn[]>([]);

  useEffect(() => {
    if (fetchedData) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  // update with debounce
  const { mutateAsync: updateDb } = target.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newData: MeasurementColumn) => await updateDb(newData),
    DebounceTime,
  );
  const update = async (newData: MeasurementColumn) => {
    setData(prev =>
      prev.map(d => d.id === newData.id ? newData : d)
    );
    await debouncedUpdateDb(newData);
  }
  
  // NOTE addはdebounceしない
  // そうすると remove と add はlocalDataに依存しないので
  // 別のフックに切り出すことも出来るが、煩雑になりそうなので
  // update, add, remove もこのふっくにまとめてしまう

  // add
  const { mutateAsync: add } = target.add.useMutation();

  // remove
  const { mutateAsync: remove } = target.remove.useMutation();


  // TODO 他ユーザからの更新と自分の更新を区別したい
  //      2回再描画されるのでは？
  target.onAdd.useSubscription({ projectId, columnGroupId }, {
    onData: newData => setData(prev => [...prev, newData]),
  });

  target.onRemove.useSubscription({ projectId, columnGroupId }, {
    onData: removalInfo => setData(prev =>
      prev.filter(d => d.id !== removalInfo.id)
    ),
  });

  target.onUpdate.useSubscription({ projectId, columnGroupId }, {
    onData: newData => setData(prev =>
      prev.map(d => d.id === newData.id ? newData : d)
    ),
  });

  return {
    data,
    isLoading,
    update,
    add,
    remove,
  };
};

