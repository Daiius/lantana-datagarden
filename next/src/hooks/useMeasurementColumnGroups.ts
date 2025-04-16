
import { trpc } from '@/providers/TrpcProvider';

export type UseMeasurementColumNGroupsArgs = {
  projectId: string;
}

/**
 * TODO なぜかtRPC型伝搬が出来ない
 */
export const useMeasurementColumnGroups = ({
  projectId
}: UseMeasurementColumNGroupsArgs) => {
  const utils = trpc.useUtils();
  const { data: measurementColumnGroups } = 
    trpc.measurement.columnGroup.list.useQuery({ projectId });

  trpc.measurement.columnGroup.onAdd.useSubscription(
    { projectId },
    {
      onData: data => utils.measurement.columnGroup.list.setData(
        { projectId },
        measurementColumnGroups == null
        ? [data]
        : [...measurementColumnGroups, data]
      ),
    }
  );

  trpc.measurement.columnGroup.onRemove.useSubscription(
    { projectId },
    {
      onData: data => utils.measurement.columnGroup.list.setData(
        { projectId },
        measurementColumnGroups == null
        ? []
        : measurementColumnGroups.filter(mcg => mcg.id !== data.id)
      )
    }
  );

  const { mutateAsync: addMeasurementColumnGroup } = trpc.measurement.columnGroup.add.useMutation();

  return {
    measurementColumnGroups,
    addMeasurementColumnGroup,
  }
};

