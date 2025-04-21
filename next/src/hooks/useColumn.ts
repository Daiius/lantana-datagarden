import { useState, useEffect } from 'react';

import {
  Column
} from '@/types';
import { trpc } from '@/providers/TrpcProvider';

import { useColumnMutations } from '@/hooks/useColumnMutations';
import { useDebouncedCallback } from 'use-debounce';


export const useColumn = ({
  initialColumn
}: {
  initialColumn: Column
}) => {

  const [localData, setLocalData] = useState<Column>(initialColumn);
  useEffect(() => setLocalData(initialColumn), [initialColumn]);

  const { projectId, columnGroupId, id } = initialColumn;
  trpc.condition.column.onUpdate.useSubscription(
    { id, projectId, columnGroupId }, 
    {
      onData: data => setLocalData(data),
      onError: err => console.log(err),
    },
  );

  const {
    update: updateDb,
    remove,
  } = useColumnMutations();

  const debouncedUpdateDb = useDebouncedCallback(
    async (newColumn: Column) => await updateDb(newColumn),
    1_000,
  );

  const update = async (newColumn: Column) => {
    setLocalData(newColumn);
    await debouncedUpdateDb(newColumn);
  };

  return {
    data: localData,
    update,
    remove,
  }
};

