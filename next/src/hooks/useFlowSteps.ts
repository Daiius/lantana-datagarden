'use client' // for hooks

import { useState, useEffect } from 'react';

import { trpc } from '@/providers/TrpcProvider';
import type { FlowStep } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import { DebounceTime } from './common';

export type UseFlowStepsArgs = {
  projectId: string;
  flowId: number;
};

export const useFlowSteps = ({
  projectId,
  flowId,
}: UseFlowStepsArgs) => {

  const target = trpc.flow.flowStep;

  const {
    data: fetchedData,
    isLoading,
  } = target.list.useQuery({ projectId, flowId });
  const [data, setData] = useState<FlowStep[]>([]);
  useEffect(() => {
    if (fetchedData != null) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  const { mutateAsync: updateDb } = target.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newValue: FlowStep) => await updateDb(newValue),
    DebounceTime,
  );
  const update = async (newValue: FlowStep) => {
    setData(prev => prev.map(d => d.id === newValue.id ? newValue: d));
    await debouncedUpdateDb(newValue);
  };
  target.onUpdate.useSubscription({ projectId, flowId }, {
    onData: newData => setData(prev => 
      prev.map(d => d.id === newData.id ? newData : d)
    ),
  });

  const { mutateAsync: add } = target.add.useMutation();
  target.onAdd.useSubscription({ projectId, flowId }, {
    onData: newData => setData(prev => [...prev, newData]),
  });
  const { mutateAsync: remove } = target.remove.useMutation();
  target.onRemove.useSubscription({ projectId, flowId }, {
    onData: info => setData(prev => prev.filter(d => d.id !== info.id)),
  });

  return {
    data,
    isLoading,
    update,
    add,
    remove,
  };
};

