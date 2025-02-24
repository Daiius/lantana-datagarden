import React from 'react';
import clsx from 'clsx';

import Header from '@/components/header/Header';
import RealtimeColumnGroups from '@/components/column/RealtimeColumnGroups';

export default async function Page() {
  const zeroId = '00000000-0000-0000-0000-000000000000' as const;
  
  return (
    <div
      className={clsx(
      )}
    >
      <Header className='h-[4rem]'/>
      <div
        className='h-[calc(100vh-4rem)] overflow-auto'
      >
        <RealtimeColumnGroups projectId={zeroId} />
      </div>
    </div>
  );
}

