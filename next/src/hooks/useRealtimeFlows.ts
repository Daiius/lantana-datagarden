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
  const { mutateAsync: removeFlow } = trpc.flow.remove.useMutation();

  trpc.flow.onAdd.useSubscription(
    { projectId },
    {
      onData: data => utils.flow.listNested.setData(
        { projectId },
        flows == null
        ? [data]
        : [ ...flows, data]
      ),
    }
  );

  trpc.flow.onRemove.useSubscription(
    { projectId },
    {
      onData: data => utils.flow.listNested.setData(
        { projectId },
        flows == null
        ? undefined
        : flows.filter(f => f.id !== data.id)
      ),
    }
  );

  return {
    flows,
    addFlow,
    removeFlow,
  };
};

