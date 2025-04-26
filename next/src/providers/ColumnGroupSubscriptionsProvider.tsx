'use client' // for hooks

import { trpc } from '@/providers/TrpcProvider';

export type ColumnGroupSubscriptionProviderProps = {
  projectId: string;
};

export const ColumnGroupSubscriptionProvider = ({
  projectId
}: ColumnGroupSubscriptionProviderProps) => {
  
  const utils = trpc.useUtils();

  const target = trpc.condition.columnGroup;
  const utilsTarget = utils.condition.columnGroup.list;

  target.onUpdate.useSubscription({ projectId }, {
    onData: newData => utilsTarget.setData(
      { projectId },
      prev => prev?.map(d => d.id === newData.id ? newData : d)
    )
  });
  target.onAdd.useSubscription({ projectId }, {
    onData: newData => utilsTarget.setData(
      { projectId },
      prev => prev == null ? [newData] : [...prev, newData]
    ),
  });
  target.onRemove.useSubscription({ projectId }, {
    onData: info => utilsTarget.setData(
      { projectId },
      prev => prev?.filter(d => d.id !== info.id),
    ),
  });

  return null;
};

