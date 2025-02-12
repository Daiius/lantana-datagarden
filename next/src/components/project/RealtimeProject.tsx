'use client';

import React from 'react';

import { trpc } from '@/providers/TrpcProvider';

import Skeleton from '@/components/common/Skeleton';
import DebouncedInput from '@/components/common/DebouncedInput';
import RealtimeCategories from '@/components/category/RealtimeCategories';

/**
 * リアルタイム更新を行うProjectコンポーネント
 *
 * 目的上Client Componentになります
 * TODO
 * Categoriesの数が変わったことを検出する方法が無い...
 */
const RealtimeProject: React.FC<
  React.ComponentProps<'div'>
  & { projectId: string }
> = ({
  projectId,
  className,
  ...props
}) => { 
  
  const utils = trpc.useUtils();
  const mutation = trpc.project.update.useMutation();
  trpc.project.onUpdate.useSubscription(
    { id: projectId }, 
    {
      onData: data => utils.project.get.setData(
          { id: projectId }, data
        ),
      onError: err => console.log(err),
    },
  );

  const { data: project, isLoading } = 
    trpc.project.get.useQuery({ id: projectId });

  if (project == null) {
    return isLoading 
      ? <Skeleton /> 
      : <div>プロジェクトが見つかりません</div>;
  }

  return (
    <div>
      <div 
        className='text-lg flex flex-row'
        {...props}
      >
        <div>プロジェクト名：</div>
        <DebouncedInput
          value={project.name}
          debouncedOnChange={async (newValue: string) =>
            await mutation.mutateAsync({ ...project, name: newValue })
          }
        />
      </div>
      <RealtimeCategories projectId={project.id} />
    </div>
  );
};

export default RealtimeProject;

