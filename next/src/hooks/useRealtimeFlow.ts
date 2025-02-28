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
  trpc.flow.onUpdate.useSubscription(
    { id, projectId },
    {
      onData: data => {
        utils.flow.get.setData({ id, projectId }, data);
        console.log('onData, %o', data);
      },
      onError: err => console.error(err),
    }
  );

  return {
    flow,
    updateFlow,
  };
};

