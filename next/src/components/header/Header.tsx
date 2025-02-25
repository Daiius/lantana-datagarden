import React from 'react';
import clsx from 'clsx';

import Link from 'next/link';

import { La_Belle_Aurore } from 'next/font/google';
import { GithubIcon } from '@/components/icon/Icons';

import Button from '@/components/common/Button';

const laBelleAurore = La_Belle_Aurore({
  weight: '400',
  subsets: ['latin'],
});

const Header: React.FC<
  React.ComponentProps<'div'>
> = ({
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

    <div className={clsx(
      'flex flex-row gap-4 align-middle justify-center',
      'flex-grow',
    )}>
      <Link href='/table'>Table</Link>
      <Link href='/columns'>Columns</Link>
    </div>

    <Link 
      href='https://github.com/Daiius/lantana-datagarden'
      target='_blank'
      className='flex-none'
    >
      <Button className='btn-ghost'>
        <GithubIcon />
      </Button> 
    </Link>
  </div>
);

export default Header;

