'use client' // for hooks

import { useState, useEffect } from 'react';
import { trpc } from '@/providers/TrpcProvider';

import type { 
  FlowStep,
  FlowStepColumnGroup,
} from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import { DebounceTime } from './common';

export type UseFlowStepColumnGroupsArgs =
  Pick<FlowStep, 'projectId'|'flowId'|'id'>;

export const useFlowStepColumnGroups = ({
  projectId,
  flowId,
  id: flowStepId,
}: UseFlowStepColumnGroupsArgs) => {
  const target = trpc.flow.flowStepColumnGroup;
  const {
    data: fetchedData,
    isLoading,
  } = target.list.useQuery({
    projectId,
    flowId,
    flowStepId
  });
  const [data, setData] = useState<FlowStepColumnGroup[]>([]);
  useEffect(() => {
    if (fetchedData != null) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  const { mutateAsync: updateDb } = target.update.useMutation();
  const debouncedUpdateDb = useDebouncedCallback(
    async (newValue: FlowStepColumnGroup) => await updateDb(newValue),
    DebounceTime,
  );
  const update = async (newValue: FlowStepColumnGroup) => {
    setData(prev => prev.map(d => d.id === newValue.id ? newValue : d));
    await debouncedUpdateDb(newValue);
  };
  target.onUpdate.useSubscription({ projectId, flowId, flowStepId }, {
    onData: newData => setData(prev => prev.map(d => d.id === newData.id ? newData : d)),
  });

  const { mutateAsync: add } = target.add.useMutation();
  target.onAdd.useSubscription({ projectId, flowId, flowStepId }, {
    onData: newData => setData(prev => [...prev, newData]),
  });
  const { mutateAsync: remove } = target.remove.useMutation();
  target.onRemove.useSubscription({ projectId, flowId, flowStepId }, {
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

