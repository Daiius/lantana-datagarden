'use client' // for trpc hooks

import { trpc } from '@/providers/TrpcProvider';

export type UseColumnGroupMeasurementsArgs = {
  projectId: string;
  columnGroupId: number;
};

export const useColumnGroupMeasurements = ({
  projectId,
  columnGroupId,
}: UseColumnGroupMeasurementsArgs) => {
  const { data } = trpc.condition.columnGroupMeasurement.list.useQuery({
    columnGroupId, projectId
  });
  const utils = trpc.useUtils();
  trpc.condition.columnGroupMeasurement.onUpdate.useSubscription(
    { projectId, columnGroupId },
    {
      onData: newData => utils.condition.columnGroupMeasurement.list.setData(
        { projectId, columnGroupId },
        data == null
        ? [newData]
        : data.map(d => d.id === newData.id ? newData : d)
      )
    }
  );

  return { 
    data
  };
};

