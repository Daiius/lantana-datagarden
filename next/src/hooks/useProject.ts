import { trpc } from '@/providers/TrpcProvider';

export const useProject = ({
  id
}: {
  id: string
}) => {
  const utils = trpc.useUtils();
  const { data: project } = trpc.project.get.useQuery({ id });
  trpc.project.onUpdate.useSubscription(
    { id },
    {
      onData: data => utils.project.get.setData(
        { id }, data
      ),
      onError: err => console.error(err),
    }
  );

  const { mutateAsync: updateProject } = trpc.project.update.useMutation();

  return {
    project,
    updateProject,
  };
};

