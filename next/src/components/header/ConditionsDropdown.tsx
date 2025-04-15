
import clsx from 'clsx';
import Link from 'next/link';

import {
  IconFileDescription,
  IconTable,
  IconSortDescending2,
  IconColumnInsertRight
} from '@tabler/icons-react';

import type { Project } from '@/types';

export type ConditionsDropdownProps = {
  project: Project;
}

const ConditionsDropdown = ({
  project,
}: ConditionsDropdownProps) => (
  <div className='dropdown'>
    <div tabIndex={0} role='button' className='btn'>
      <IconFileDescription stroke={2} />
      Conditions
    </div>
    <div 
      tabIndex={0} 
      className={clsx(
        'dropdown-content bg-base-100 rounded-box',
        'z-1 p-2 shadow-sm',
        'flex flex-col gap-2',
      )}
    >
      <Link 
        href={
          project?.lastSelectedFlow
          ? `/projects/${project.id}/conditions/tables/${project?.lastSelectedFlow}` 
          : `/projects/${project.id}/conditions/tables`
        } 
        className='flex flex-row items-center'
      >
        <IconTable stroke={1}/>
        Tables
      </Link>
      <Link 
        href={`/projects/${project.id}/conditions/flows`} 
        className='flex flex-row items-center'
      >
        <IconSortDescending2 stroke={1} className='-rotate-90' />
        Flows
      </Link>
      <Link 
        href={`/projects/${project.id}/conditions/columns`} 
        className='flex flex-row items-center'
      >
        <IconColumnInsertRight stroke={1} />
        Columns
      </Link>
    </div>
  </div>
);

export default ConditionsDropdown;

