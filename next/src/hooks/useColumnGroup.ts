import { useEffect, useState } from 'react';

import type {
  ColumnGroup,
} from '@/types';
import { trpc } from '@/providers/TrpcProvider';

import { useColumnGroupMutations } from '@/hooks/useColumnGroupMutations';
import { useDebouncedCallback } from 'use-debounce';


export type UseColumnGroupArgs<T extends ColumnGroup> = {
  initialData: T;
};

export const useColumnGroup = <
  T extends ColumnGroup
>({
  initialData,
}: UseColumnGroupArgs<T>) => {

  const [localData, setLocalData] = 
    useState<ColumnGroup>(initialData);
  useEffect(() => {
    setLocalData(initialData);
  }, [initialData])
 
  const {
    update: updateDb,
    remove,
  } = useColumnGroupMutations();

  const { id, projectId } = initialData;
  trpc.condition.columnGroup.onUpdate.useSubscription(
    { id, projectId },
    {
      onData: data => setLocalData(data)
      ,
      onError: err => console.error(err),
    }
  );
  const data = {
    ...initialData,
    ...localData,
  };

  const update = async (newValue: ColumnGroup) => {
    setLocalData(newValue);
    await debouncedUpdateDb(newValue);
  };

  const debouncedUpdateDb = useDebouncedCallback(
    async (newValue: ColumnGroup) => await updateDb(newValue),
    1_000,
  );

  return {
    data,
    update,
    remove,
  };
};

