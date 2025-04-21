
import { trpc } from '@/providers/TrpcProvider';

export type UseMeasurementColumNGroupsArgs = {
  projectId: string;
}

export const useMeasurementColumnGroups = ({
  projectId
}: UseMeasurementColumNGroupsArgs) => {
  const utils = trpc.useUtils();
  const { data } = 
    trpc.measurement.columnGroup.list.useQuery({ projectId });

  trpc.measurement.columnGroup.onAdd.useSubscription(
    { projectId },
    {
      onData: newData => utils.measurement.columnGroup.list.setData(
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
      onData: newData => utils.measurement.columnGroup.list.setData(
        { projectId },
        data == null
        ? []
        : data.filter(mcg => mcg.id !== newData.id)
      )
    }
  );

  return {
    data,
  }
};

