'use client'

import { trpc } from '@/providers/TrpcProvider';


export type UseMeasurementsArgs = {
  projectId: string;
  columnGroupId: number;
}

export const useMeasurements = ({
  projectId,
  columnGroupId,
}: UseMeasurementsArgs) => {
  
  const utils = trpc.useUtils();

  const { data } = trpc.measurement.data.list.useQuery(
    { projectId, columnGroupId },
  );

  trpc.measurement.data.onAdd.useSubscription(
    { projectId, columnGroupId },
    {
      onData: newData => utils.measurement.data.list.setData(
        { projectId, columnGroupId },
        data
        ? [...data, newData]
        : [newData],
      )
    }
  );

  trpc.measurement.data.onRemove.useSubscription(
    { projectId, columnGroupId },
    {
      onData: info => utils.measurement.data.list.setData(
        { projectId, columnGroupId },
        data?.filter(d => d.id !== info.id)
      )
    }
  );

  return {
    data
  };
};

