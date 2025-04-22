import { trpc } from '@/providers/TrpcProvider';

export type UseMeasurementColumnsArgs = {
  projectId: string;
  columnGroupId: number;
};

export const useMeasurementColumns = ({
  projectId,
  columnGroupId,
}: UseMeasurementColumnsArgs) => {
  const utils = trpc.useUtils();
  const { data } = trpc.measurement.column.list.useQuery(
    { projectId, columnGroupId },
  );

  const { mutateAsync: add } = trpc.measurement.column.add.useMutation();
  trpc.measurement.column.onAdd.useSubscription(
    { projectId, columnGroupId },
    {
      onData: newData => utils.measurement.column.list.setData(
        { projectId, columnGroupId },
        data
        ? [...data, newData]
        : [newData],
      ),
    }
  );

  trpc.measurement.column.onRemove.useSubscription(
    { projectId, columnGroupId },
    {
      onData: removalInfo => utils.measurement.column.list.setData(
        { projectId, columnGroupId },
        data?.filter(d => d.id !== removalInfo.id)
      ),
    }
  );

  return {
    data,
    add,
  };
};

