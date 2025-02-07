'use client';

import type { 
  Project,
} from '@/types';
import Input from '@/components/common/Input';
import { updateProjectName } from '@/actions/project';

const Project: React.FC<
  React.ComponentProps<'div'>
  & { project: Project }
> = ({
  project,
  className,
  ...props
}) => (
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
  </div>
);

export default Project;
