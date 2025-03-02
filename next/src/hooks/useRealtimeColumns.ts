import { Column } from '@/types';
import { trpc } from '@/providers/TrpcProvider';

export const useRealtimeColumns = ({
  initialColumns,
  projectId,
  columnGroupId,
}: {
  initialColumns: Column[];
  projectId: string;
  columnGroupId: string;
}) => {
  const utils = trpc.useUtils();
  const { data: columns } = trpc.column.list.useQuery(
    { projectId, columnGroupId },
    { enabled: false, initialData: initialColumns }
  );
  trpc.column.onUpdateList.useSubscription(
    { projectId, columnGroupId },
    {
      onData: data => utils.column.list.setData(
        { projectId, columnGroupId },
        data
      ),
      onError: err => console.error(err),
    }
  );
  const { mutateAsync: addColumn } = trpc.column.add.useMutation();

  return {
    columns,
    addColumn,
  };
};

