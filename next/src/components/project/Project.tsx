
import type { 
  Project,
} from '@/types';

import { 
  getProjectData,
} from '@/lib';

import ProjectTitle from '@/components/project/ProjectTitle';
import RealtimeProject from '@/components/project/RealtimeProject';

import Category from '@/components/category/Category';
import DebugJson from '@/components/common/DebugJson';

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
      {project.categories.map(c =>
        <Category key={c.id} category={c} />
      )}
      <DebugJson data={project} />
    </div>
  );
};

export default Project;

