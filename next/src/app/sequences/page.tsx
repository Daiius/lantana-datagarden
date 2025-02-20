import React from 'react';
import clsx from 'clsx';

import Header from '@/components/header/Header';
import Sequences from '@/components/sequence/Sequences';

export default async function Page() {
  const zeroId = '00000000-0000-0000-0000-000000000000' as const;
  
  return (
    <div
      className={clsx(
      )}
    >
      <Header />
      <Sequences className='p-4' projectId={zeroId} />
    </div>
  );
}

