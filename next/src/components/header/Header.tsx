import React from 'react';
import clsx from 'clsx';

import Link from 'next/link';

import { La_Belle_Aurore } from 'next/font/google';
import { 
  IconBrandGithub,
} from '@tabler/icons-react';

import Button from '@/components/common/Button';

import { t } from 'server/trpc';
import { appRouter } from 'server/router';
import ConditionsDropdown from './ConditionsDropdown';
import MeasurementsDropdown from './MeasurementsDropdown';

const laBelleAurore = La_Belle_Aurore({
  weight: '400',
  subsets: ['latin'],
});

type HeaderProps = {
  projectId?: string;

  className?: string;
};

const Header = async ({
  projectId,
  className,
}: HeaderProps) => {

  const createCaller = t.createCallerFactory(appRouter);
  const caller = createCaller({});
  const project = projectId != null
    ? await caller.project.get({ id: projectId })
    : undefined;

  return (
    <div
      className={clsx(
        'navbar w-full z-40',
        'flex flex-row items-center',
        'bg-base-100',
        className,
      )}
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

      {project && 
        <>
          <ConditionsDropdown project={project} />
          <MeasurementsDropdown project={project} />
        </>
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
}

export default Header;

