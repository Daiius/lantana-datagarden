import type {
  Column,
  ColumnGroup,
} from '@/types';
import { trpc } from '@/providers/TrpcProvider';

type ColumnGroupWithColumns =
  ColumnGroup & { columns: Column[] };

export const useRealtimeColumnGroup = ({
  initialColumnGroup,
}: {
  initialColumnGroup: ColumnGroupWithColumns
}) => {
  const utils = trpc.useUtils();
  const { id, projectId } = initialColumnGroup;
  const { data: queriedColumnGroup } = trpc.columnGroup.get.useQuery(
    { id, projectId },
    { enabled: false, initialData: initialColumnGroup }
  );
 
  const { mutateAsync: updateColumnGroup } = 
    trpc.columnGroup.update.useMutation();
  const { mutateAsync: deleteColumnGroup } =
    trpc.columnGroup.remove.useMutation();

  trpc.columnGroup.onUpdate.useSubscription(
    { id, projectId },
    {
      onData: data => utils.columnGroup.get.setData(
        { id, projectId }, data
      ),
      onError: err => console.error(err),
    }
  );
  const columnGroup = {
    ...initialColumnGroup,
    ...queriedColumnGroup,
  };

  return {
    columnGroup,
    updateColumnGroup,
    deleteColumnGroup,
  };
};

