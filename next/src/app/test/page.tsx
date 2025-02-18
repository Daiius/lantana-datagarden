import React from 'react';
import clsx from 'clsx';

import Header from '@/components/header/Header';
import RealtimeProject from '@/components/project/RealtimeProject';
import RelationsTable from '@/components/table/RelationsTable';

export default async function Page() {
  const zeroId = '00000000-0000-0000-0000-000000000000' as const;
  
  return (
    <div
      className={clsx(
      )}
    >
      <Header />
      {/*
      <RealtimeProject className='p-4' projectId={zeroId} />
      <div className='h-[50vh] overflow-y-auto'>
      </div>
      */}
      <RelationsTable />
    </div>
  );
}

