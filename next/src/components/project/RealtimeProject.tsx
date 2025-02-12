'use client';

import React from 'react';
import clsx from 'clsx';

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
    { id: projectId }, {
      onData: data => 
        utils.project.get.setData({ id: projectId }, data),
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
    <div
      className={clsx(
        'bg-sky-200/50 rounded-lg shadow',
        'border border-sky-500',
        'px-2 pb-2',
      )}
    >
      <div className='flex flex-row items-center'>
        <div 
          className={clsx(
            'text-2xl text-sky-800 font-bold',
          )}
        >
          Project
        </div>
        <div className='ml-8 text-sky-800/50'>
          id: {project.id}
        </div>
      </div>
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
      <div
        className='ml-4'
      >
        <RealtimeCategories projectId={project.id} />
      </div>
    </div>
  );
};

export default RealtimeProject;

