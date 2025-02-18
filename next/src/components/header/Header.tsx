import React from 'react';
import clsx from 'clsx';

import Link from 'next/link';

const Header: React.FC<
  React.ComponentProps<'div'>
> = ({
  className,
  ...props
}) => (
  <div
    className={clsx(
      'navbar w-full z-40',
      'flex flex-row items-center sticky top-0',
      'bg-base-100',
      className,
    )}
    {...props}
  >
    <Link href='/'>
      <div className='font-bold italic text-2xl'>
        Lantana Datagarden
      </div>
    </Link>

    <div className='flex flex-row w-full gap-3 align-middle'>
      <Link href='/sequences'>Sequences</Link>
      <div>Measurements</div>
      <div>Options</div>
      <Link href='/test'>Test</Link>
    </div>

    <div className='ms-auto'>
      Link
    </div>
  </div>
);

export default Header;

