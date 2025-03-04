import React from 'react';
import clsx from 'clsx';

import Link from 'next/link';

import { La_Belle_Aurore } from 'next/font/google';
import { 
  IconBrandGithub,
  IconTable,
  IconSortDescending2,
  IconColumnInsertRight,
} from '@tabler/icons-react';

import Button from '@/components/common/Button';

const laBelleAurore = La_Belle_Aurore({
  weight: '400',
  subsets: ['latin'],
});

const Header: React.FC<
  React.ComponentProps<'div'>
  & { projectId?: string }
> = ({
  projectId,
  className,
  ...props
}) => (
  <div
    className={clsx(
      'navbar w-full z-40',
      'flex flex-row items-center',
      'bg-base-100',
      className,
    )}
    {...props}
  >
    <Link href='/' className='flex-none'>
      <div className={clsx(
        'font-bold italic text-2xl',
        laBelleAurore.className,
      )}>
        <div> Lantana </div>
        <div className='ml-2 -mt-3'> Datagarden </div>
      </div>
    </Link>

    {projectId &&
      <div className={clsx(
        'flex flex-row gap-4 align-middle justify-center',
        'flex-grow',
      )}>
        <Link 
          href={`/projects/${projectId}/tables`} 
          className='flex flex-row items-center'
        >
          <IconTable stroke={1}/>
          Tables
        </Link>
        <Link 
          href={`/projects/${projectId}/flows`} 
          className='flex flex-row items-center'
        >
          <IconSortDescending2 stroke={1} className='-rotate-90' />
          Flows
        </Link>
        <Link 
          href={`/projects/${projectId}/columns`} 
          className='flex flex-row items-center'
        >
          <IconColumnInsertRight stroke={1} />
          Columns
        </Link>
      </div>
    }

    <Link 
      href='https://github.com/Daiius/lantana-datagarden'
      target='_blank'
      className='flex-none ms-auto'
    >
      <Button className='btn-ghost'>
        <IconBrandGithub />
      </Button> 
    </Link>
  </div>
);

export default Header;

