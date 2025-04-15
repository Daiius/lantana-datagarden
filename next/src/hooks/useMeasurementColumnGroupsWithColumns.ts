
import { trpc } from '@/providers/TrpcProvider';

export type UseMeasurementColumNGroupsArgs = {
  projectId: string;
}

export const useMeasurementColumnGroupsWithColumns = ({
  projectId
}: UseMeasurementColumNGroupsArgs) => {
  const utils = trpc.useUtils();
  const { data } = 
    trpc.measurement.columnGroup.listWithColumns.useQuery({ projectId });

  trpc.measurement.columnGroup.onAddWithColumns.useSubscription(
    { projectId },
    {
      onData: newData => utils.measurement.columnGroup.listWithColumns.setData(
        { projectId },
        data == null
        ? [newData]
        : [...data, newData]
      ),
    }
  );

  trpc.measurement.columnGroup.onRemove.useSubscription(
    { projectId },
    {
      onData: newData => utils.measurement.columnGroup.listWithColumns.setData(
        { projectId },
        data == null
        ? []
        : data.filter(d => d.id !== newData.id)
      )
    }
  );

  const { mutateAsync: add } = trpc.measurement.columnGroup.add.useMutation();

  return {
    data,
    add,
  }
};

