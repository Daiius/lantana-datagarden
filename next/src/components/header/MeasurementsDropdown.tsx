import clsx from 'clsx';
import Link from 'next/link';

import {
  IconFlask,
  IconTable,
  IconColumnInsertRight,
} from '@tabler/icons-react';

import type { Project} from '@/types';

export type MeasurementsDropdownProps = {
  project: Project;
}

const MeasurementsDropdown = ({
  project,
}: MeasurementsDropdownProps) => (
  <div className='dropdown'>
    <div tabIndex={0} role='button' className='btn'>
      <IconFlask stroke={2} />
      Measurements
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
        href={`/projects/${project.id}/measurements`} 
        className='flex flex-row items-center'
      >
        <IconTable stroke={1}/>
        Tables
      </Link>
      <Link 
        href={`/projects/${project.id}/mcolumns`} 
        className='flex flex-row items-center'
      >
        <IconColumnInsertRight stroke={1} />
        Columns
      </Link>
    </div>
  </div>
);

export default MeasurementsDropdown;

