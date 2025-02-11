'use client';

import React from 'react';

import { trpc } from '@/providers/TrpcProvider';

import type { Project } from '@/types';
import DebouncedInput from '@/components/common/DebouncedInput';

const zeroId = "00000000-0000-0000-0000-000000000000";

const RealtimeProject: React.FC<
  React.ComponentProps<'div'>
  & { initialProject: Project }
> = ({
  initialProject,
  className,
  ...props
}) => { 
  const [project, setProject] = 
    React.useState<Project>(initialProject);

  const mutation = trpc.project.update.useMutation();
  trpc.project.onUpdate.useSubscription(
    { id: zeroId }, 
    {
      onData: data => setProject(data),
      onError: err => console.log(err),
    },
  );

  return (
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
  );
};

export default RealtimeProject;

