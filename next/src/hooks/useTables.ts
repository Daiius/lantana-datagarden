
import { trpc } from '@/providers/TrpcProvider';

export const useTables = ({
  flowId,
  projectId,
}: { 
  flowId: number;
  projectId: string;
}) => {

  const utils = trpc.useUtils();
  const { data: flowWithData } = trpc.flow.getNestedWithData.useQuery(
    { id: flowId, projectId },
  );
  const invalidate = async () => {
    await utils.flow.getNestedWithData.invalidate({
      projectId, id: flowId,
    });
  };
  const { mutateAsync: update } = trpc.flow.update.useMutation();
  trpc.flow.onUpdateNested.useSubscription(
    { id: flowId, projectId },
    {
      onData: data => utils.flow.getNestedWithData.setData(
        { id: flowId, projectId },
        data,
      ),
      onError: err => console.error(err),
    }
  );

  return {
    flowWithData,
    invalidate,
    update,
  }
};

