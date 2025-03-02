import { trpc } from '@/providers/TrpcProvider';
import type {
  Flow,
  ColumnGroup,
} from '@/types';

type FlowColumnGroups = Flow & { columnGroups: ColumnGroup[][] };

export const useRealtimeFlow = ({
  initialFlow
}: {
  initialFlow: FlowColumnGroups
}) => {
  const utils = trpc.useUtils();
  const { id, projectId } = initialFlow;
  const { data: flow } = trpc.flow.getNested.useQuery(
    { id, projectId },
    { enabled: false, initialData: initialFlow },
  );
  const { mutateAsync: updateFlow } = trpc.flow.update.useMutation();
  const { mutateAsync: deleteFlow } = trpc.flow.delete.useMutation();
  trpc.flow.onUpdate.useSubscription(
    { id, projectId },
    {
      onData: data => {
        // TODO
        // しばらくの間ここを get にしていたせいで
        // 更新機能が動作しないバグに悩まされた
        // 何とかできないだろうか？ 
        utils.flow.getNested.setData({ id, projectId }, data);
        console.log('onData, %o', data);
      },
      onError: err => console.error(err),
    }
  );

  return {
    flow,
    updateFlow,
    deleteFlow,
  };
};

