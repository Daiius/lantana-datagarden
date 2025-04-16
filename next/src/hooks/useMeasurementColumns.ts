import { trpc } from '@/providers/TrpcProvider';

import type { MeasurementColumn } from '@/types';

export type UseMeasurementColumnsArgs = {
  projectId: string;
  columnGroupId: number;
  initialData: MeasurementColumn[];
};

export const useMeasurementColumns = ({
  projectId,
  columnGroupId,
  initialData,
}: UseMeasurementColumnsArgs) => {
  const utils = trpc.useUtils();
  const { data } = trpc.measurement.column.list.useQuery(
    { projectId, columnGroupId },
    { initialData, enabled: false }
  );

  const { mutateAsync: add } = trpc.measurement.column.add.useMutation();
  trpc.measurement.column.onAdd.useSubscription(
    { projectId, columnGroupId },
    {
      onData: newData => utils.measurement.column.list.setData(
        { projectId, columnGroupId },
        [...data, newData],
      ),
    }
  );

  trpc.measurement.column.onRemove.useSubscription(
    { projectId, columnGroupId },
    {
      onData: removalInfo => utils.measurement.column.list.setData(
        { projectId, columnGroupId },
        data.filter(d => d.id !== removalInfo.id)
      ),
    }
  );

  return {
    data,
    add,
  };
};

