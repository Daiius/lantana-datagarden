'use client';

import React from 'react';

import type { 
  Project,
} from '@/types';
import Input from '@/components/common/Input';
import { updateProjectName } from '@/actions/project';


import { useTrpcClient } from '@/providers/TrpcProvider';

const Project: React.FC<
  React.ComponentProps<'div'>
  & { project: Project }
> = ({
  project,
  className,
  ...props
}) => { 
  const trpcClient = useTrpcClient();
  const message = React.use(trpcClient.greeting.query());
  return (
    <div 
      className='text-lg flex flex-row'
      {...props}
    >
      <div>
        プロジェクト名：
      </div>
      <Input
        value={project.name}
        onUpdate={async (newName: string) => updateProjectName(
          project.id, newName
        )}
      />
      <div>{message}</div>
    </div>
  );
};

export default Project;
