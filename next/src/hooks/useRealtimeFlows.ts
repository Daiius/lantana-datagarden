import { trpc } from '@/providers/TrpcProvider';

export const useRealtimeFlows = ({
  projectId,
}: {
  projectId: string;
}) => {
  const { data: flows } = trpc.flow.listNested.useQuery({
    projectId,
  });

  return {
    flows
  };
};
