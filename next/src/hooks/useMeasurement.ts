'use client'

import { trpc } from '@/providers/TrpcProvider';

import type {
  Measurement,
} from '@/types';

export type UseMeasurementArgs = {
  initialData: Measurement;
  useSubscription?: boolean;
}

/**
 * 単体のMeasurementを、初期値を元にDB同期するフック
 */
export const useMeasurement = ({
  initialData,
  useSubscription = true,
}: UseMeasurementArgs) => {

  const { id, projectId, columnGroupId } = initialData;

  const utils = trpc.useUtils();
  
  const { data } = trpc.measurement.data.get.useQuery(
    { id, projectId, columnGroupId },
    { initialData, enabled: false },
  );

  if (useSubscription) {
    trpc.measurement.data.onUpdate.useSubscription(
      { id, projectId, columnGroupId },
      {
        onData: newData => utils.measurement.data.get.setData(
          { id, projectId, columnGroupId },
          newData
        )
      }
    );
  }

  return { 
    data 
  };
};

