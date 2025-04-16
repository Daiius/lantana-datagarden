'use client'

import { trpc } from '@/providers/TrpcProvider';

import type {
  Measurement
} from '@/types';

export type UseMeasurementsArgs = {
  projectId: string;
  columnGroupId: number;
  initialData: Measurement[];
}

export const useMeasurements = ({
  projectId,
  columnGroupId,
  initialData,
}: UseMeasurementsArgs) => {
  
  const utils = trpc.useUtils();

  const { data } = trpc.measurement.data.list.useQuery(
    { projectId, columnGroupId },
    { initialData, enabled: false },
  );

  trpc.measurement.data.onAdd.useSubscription(
    { projectId, columnGroupId },
    {
      onData: newData => utils.measurement.data.list.setData(
        { projectId, columnGroupId },
        [...data, newData],
      )
    }
  );

  trpc.measurement.data.onRemove.useSubscription(
    { projectId, columnGroupId },
    {
      onData: info => utils.measurement.data.list.setData(
        { projectId, columnGroupId },
        data.filter(d => d.id !== info.id)
      )
    }
  );

  return {
    data
  };
};

