import { trpc, AppRouter } from '@/providers/TrpcProvider';
import { inferRouterOutputs } from '@trpc/server';
import type {
  Flow,
} from '@/types';

export type NestedFlow = inferRouterOutputs<AppRouter>['flow']['getNested'];

export const useFlow = ({
  projectId,
  id,
  initialFlow,
}: {
  projectId: string;
  id: Flow['id'];
  initialFlow?: NestedFlow;
}) => {
  const utils = trpc.useUtils();
  const { data: flow, error } = trpc.flow.getNested.useQuery(
    { id, projectId },
    initialFlow == null
    ? { enabled: true }
    : { enabled: false, initialData: initialFlow },
  );
  const { mutateAsync: update } = trpc.flow.update.useMutation();
  const { mutateAsync: remove } = trpc.flow.remove.useMutation();
  trpc.flow.onUpdateNested.useSubscription(
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
    update,
    remove,
    error,
  };
};

