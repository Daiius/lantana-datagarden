import {
  Column
} from '@/types';
import { trpc } from '@/providers/TrpcProvider';


export const useColumn = ({
  initialColumn
}: {
  initialColumn: Column
}) => {
  const { projectId, columnGroupId, id } = initialColumn;
  const utils = trpc.useUtils();
  const { mutateAsync: updateColumn } = 
    trpc.column.update.useMutation();
  const { mutateAsync: deleteColumn } =
    trpc.column.remove.useMutation();
  trpc.column.onUpdate.useSubscription(
    { id, projectId, columnGroupId }, 
    {
      onData: data =>
        utils.column.get.setData(
          { id, projectId, columnGroupId },
          data
        ),
      onError: err => console.log(err),
    },
  );
  const { data: column } = trpc.column.get.useQuery(
    { id, projectId, columnGroupId },
    { enabled: false, initialData: initialColumn }
  );

  return {
    column,
    updateColumn,
    deleteColumn,
  }
};

