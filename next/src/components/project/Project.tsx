
import React from 'react';
import type { 
  Project,
} from '@/types';

import { 
  getProjectData,
} from '@/lib';

import RealtimeProject from '@/components/project/RealtimeProject';

import Category from '@/components/category/Category';
import Column from '@/components/column/Column';
import DebugJson from '@/components/common/DebugJson';

import Table from '@/components/table/Table';

export const zeroId = '00000000-0000-0000-0000-000000000000' as const;

const Project: React.FC<
  React.ComponentProps<'div'>
> = async ({
  className,
  ...props
}) => {
  
  const project = await getProjectData(zeroId);

  if (project == null) return (
    <div>プロジェクトが見つかりませんでした</div>
  );

  return (
    <div 
      className='text-lg w-full'
      {...props}
    >
      <RealtimeProject initialProject={project} />
      <div className='bg-green-200 rounded-lg shadow m-2'>
        {project.categories.map(c =>
          <div key={c.id} className='ml-2'>
            <Category category={c} />
            {c.columns.map(c =>
              <Column key={c.id} className='ml-4' column={c} />
            )}
          </div>
        )}
      </div>
      <div className='bg-red-200 rounded-lg shadow m-2'>
        {project.categories.map(c =>
          <Table key={c.id} initialCategory={c}/>
        )}
      </div>
      <DebugJson data={project} />
    </div>
  );
};

export default Project;

