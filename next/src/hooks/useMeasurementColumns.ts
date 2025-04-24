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
  const { data } = trpc.measurement.column.list.useQuery(
    { projectId, columnGroupId },
  );
  // NOTE IME対応には必要らしい、React Queryキャッシュと重複するのは嫌だが...
  const [localData, setLocalData] = useState<MeasurementColumn[]>([]);

  useEffect(() => {
    if (data != null) {
      setLocalData(data);
    }
  }, [data]);

  // update with debounce
  const { mutateAsync: updateDb } = 
    trpc.measurement.column.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newData: MeasurementColumn) => await updateDb(newData),
    DebounceTime,
  );
  const update = async (newData: MeasurementColumn) => {
    setLocalData(
      localData.map(d => d.id === newData.id ? newData : d)
    );
    await debouncedUpdateDb(newData);
  }
  
  // NOTE addはdebounceしない
  // そうすると remove と add はlocalDataに依存しないので
  // 別のフックに切り出すことも出来るが、煩雑になりそうなので
  // update, add, remove もこのふっくにまとめてしまう

  // add
  const { mutateAsync: add } =
    trpc.measurement.column.add.useMutation();

  // remove
  const { mutateAsync: remove } =
    trpc.measurement.column.remove.useMutation();


  // TODO 他ユーザからの更新と自分の更新を区別したい
  //      2回再描画されるのでは？
  trpc.measurement.column.onAdd.useSubscription(
    { projectId, columnGroupId },
    {
      onData: newData => setLocalData([...localData, newData]),
    }
  );

  trpc.measurement.column.onRemove.useSubscription(
    { projectId, columnGroupId },
    {
      onData: removalInfo => setLocalData(
        localData.filter(d => d.id !== removalInfo.id)
      ),
    }
  );

  trpc.measurement.column.onUpdate.useSubscription(
    { projectId, columnGroupId },
    {
      onData: newData => setLocalData(
        localData.map(d => d.id === newData.id ? newData : d)
      ),
    }
  );

  return {
    data: localData,
    update,
    add,
    remove,
  };
};

