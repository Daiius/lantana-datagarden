import { trpc } from '@/providers/TrpcProvider';

import type {
  MeasurementColumn
} from '@/types';

export type UseMeasurementColumnArgs = {
  initialData: MeasurementColumn;
}

export const useMeasurementColumn = ({
  initialData,
}: UseMeasurementColumnArgs) => {
  const { projectId, columnGroupId, id } = initialData;
  const utils = trpc.useUtils();
  const { data } = trpc.measurement.column.get.useQuery(
    { projectId, columnGroupId, id },
    { initialData, enabled: false },
  );

  const { mutateAsync: update } = trpc.measurement.column.update.useMutation();
  trpc.measurement.column.onUpdate.useSubscription(
    { projectId, columnGroupId, id },
    {
      onData: newData => utils.measurement.column.get.setData(
        { projectId, columnGroupId, id },
        newData,
      ),
    }
  );

  const { mutateAsync: remove } = trpc.measurement.column.remove.useMutation();

  return {
    data,
    update,
    remove,
  };
};


