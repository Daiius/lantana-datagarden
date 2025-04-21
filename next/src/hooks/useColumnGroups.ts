import { trpc } from '@/providers/TrpcProvider';

export const useColumnGroups = ({
  projectId
}: {
  projectId: string;
}) => {
  const { data } = 
    trpc.condition.columnGroup.list.useQuery({ projectId });
  
  const utils = trpc.useUtils();
  trpc.condition.columnGroup.onAdd.useSubscription(
    { projectId },
    {
      onData: newData => utils.condition.columnGroup.list.setData(
        { projectId },
        data == null
        ? [newData]
        : [...data, newData]
      ),
    }
  );
  trpc.condition.columnGroup.onRemove.useSubscription(
    { projectId },
    {
      onData: info => utils.condition.columnGroup.list.setData(
        { projectId },
        data == null
        ? []
        : data.filter(d => d.id !== info.id)
      ),
    }
  );

  return {
    data,
  };
};

