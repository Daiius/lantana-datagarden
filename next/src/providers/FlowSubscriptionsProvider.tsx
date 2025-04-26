
import { trpc } from '@/providers/TrpcProvider';

export type FlowSubscriptionsProps = {
  projectId: string;
}

export const FlowSubscriptions = ({
  projectId,
}: FlowSubscriptionsProps) => {
  const utils = trpc.useUtils();
  trpc.flow.flow.onUpdate.useSubscription(
    { projectId },
    {
      onData: newData => utils.flow.flow.list.setData(
        { projectId },
        prev => prev?.map(d => d.id === newData.id ? newData : d)
      ),
    }
  );
  trpc.flow.flow.onAdd.useSubscription(
    { projectId },
    {
      onData: newData => utils.flow.flow.list.setData(
        { projectId },
        prev => prev == null ? [newData] : [...prev, newData]
      ),
    }
  );
  trpc.flow.flow.onRemove.useSubscription(
    { projectId },
    {
      onData: info => utils.flow.flow.list.setData(
        { projectId },
        prev => prev?.filter(d => d.id !== info.id),
      ),
    }
  );
  
  return null; 
};

