'use client' // for hooks

import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { trpc } from '@/providers/TrpcProvider';

import type { Data } from '@/types';
import { DebounceTime } from './common';

import debug from 'debug';
const log = debug('lantana-datagarden:log');
const error = debug('lantana-datagarden:error');

export type UseDataArgs = {
  projectId: Data['projectId'];
  columnGroupId: Data['columnGroupId'] | Data['columnGroupId'][];
};

export const useData = ({
  projectId,
  columnGroupId,
}: UseDataArgs) => {
  const utils = trpc.useUtils();
  const utilsTarget = utils.condition.data.list;
  const target = trpc.condition.data;
  const { 
    data: fetchedData, 
    isLoading,
  } = target.list.useQuery({ projectId, columnGroupId });
  const [data, _setData] = useState<Data[]>([]);
  useEffect(() => {
    if (fetchedData) {
      log('useData:useEffect', fetchedData);
      setData(fetchedData);
    }
  }, [fetchedData]);


  /** trpcキャッシュとIME入力対応用stateを両方更新します */
  const setData = (newData: Data[]) => {
    log('useData:setData: %o', newData);
    utilsTarget.setData({ projectId, columnGroupId }, newData);
    _setData(newData);
  };

  const { mutateAsync: updateDb } = target.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newData: Data) => await updateDb(newData),
    DebounceTime,
  );
  const update = async (newData: Data) => {
    log('useData:update: %o', newData);
    setData(data.map(d => d.id === newData.id ? newData : d)
    );
    await debouncedUpdateDb(newData);
  };
  target.onUpdate.useSubscription(
    { projectId, columnGroupId },
    {
      onData: newData => setData(data.map(d => d.id === newData.id ? newData : d)),
      onError: err => error(err),
    }
  );
  const { mutateAsync: remove } = target.remove.useMutation();
  target.onRemove.useSubscription(
    { projectId, columnGroupId },
    {
      onData: info => setData(data.filter(d => d.id !== info.id)),
      onError: err => error(err),
    }
  );

  const { mutateAsync: add } = target.add.useMutation();
  target.onAdd.useSubscription(
    { projectId, columnGroupId },
    {
      onData: newData => setData([...data, newData]),
      onError: err => error(err),
    }
  );

  return {
    data,
    update,
    add,
    remove,
    isLoading,
    error,
  };
};

