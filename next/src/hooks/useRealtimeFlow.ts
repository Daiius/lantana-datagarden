import { trpc } from '@/providers/TrpcProvider';
import type {
  Flow,
  ColumnGroup,
} from '@/types';

type FlowColumnGroups = Flow & { columnGroups: ColumnGroup[][] };

export const useRealtimeFlow = ({
  projectId,
  id,
  initialFlow
}: {
  projectId: string;
  id: Flow['id'];
  initialFlow?: FlowColumnGroups;
}) => {
  const utils = trpc.useUtils();
  const { data: flow, error } = trpc.flow.getNested.useQuery(
    { id, projectId },
    initialFlow == null
    ? { enabled: true }
    : { enabled: false, initialData: initialFlow },
  );
  const { mutateAsync: updateFlow } = trpc.flow.update.useMutation();
  const { mutateAsync: removeFlow } = trpc.flow.remove.useMutation();
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
    removeFlow,
    error,
  };
};

