'use client';

import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';

import Skeleton from '@/components/common/Skeleton';
import DebouncedInput from '@/components/common/DebouncedInput';

/**
 * リアルタイム更新を行うProjectコンポーネント
 *
 * 目的上Client Componentになります
 * TODO
 * Categoriesの数が変わったことを検出する方法が無い...
 */
const Project: React.FC<
  React.ComponentProps<'div'>
  & { projectId: string }
> = ({
  projectId,
  className,
  ...props
}) => { 
  
  const utils = trpc.useUtils();
  const { mutateAsync } = trpc.project.update.useMutation();
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
        'px-2 pb-2',
        className,
      )}
      {...props}
    >
      <div className='flex flex-row items-center'>
        <div 
          className={clsx(
            'text-2xl font-bold',
          )}
        >
          Project
        </div>
        <div className='ml-8'>
          id: {project.id}
        </div>
      </div>
      <fieldset className='fieldset'>
        <label className='fieldset-label'>プロジェクト名：</label>
        <DebouncedInput
          value={project.name}
          debouncedOnChange={async newValue =>
            await mutateAsync({ ...project, name: newValue as string })
          }
        />
      </fieldset>
      <div className='divider'></div>
    </div>
  );
};

export default Project;

