import { trpc } from '@/providers/TrpcProvider';

export const useRealtimeFlows = ({
  projectId,
}: {
  projectId: string;
}) => {
  const utils = trpc.useUtils();
  const { data: flows } = trpc.flow.listNested.useQuery({
    projectId,
  });
  const { mutateAsync: addFlow } = trpc.flow.add.useMutation();
  trpc.flow.onUpdateList.useSubscription(
    { projectId },
    {
      onData: data => utils.flow.listNested.setData(
        { projectId },
        data.flows
      ),
      onError: err => console.error(err),
    }
  );

  return {
    flows,
    addFlow,
  };
};
