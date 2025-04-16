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
  const { data: column } = trpc.column.get.useQuery(
    { id, projectId, columnGroupId },
    { enabled: false, initialData: initialColumn }
  );
  trpc.column.onUpdate.useSubscription(
    { id, projectId, columnGroupId }, 
    {
      onData: data => {
        utils.column.get.setData(
          { id, projectId, columnGroupId },
          data
        );
        console.log('useColumn update called! %o', data);
      },
      onError: err => console.log(err),
    },
  );
  const { mutateAsync: update } = 
    trpc.column.update.useMutation();
  const { mutateAsync: remove } =
    trpc.column.remove.useMutation();

  return {
    column,
    update,
    remove,
  }
};

