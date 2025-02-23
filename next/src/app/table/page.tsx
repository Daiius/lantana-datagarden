import React from 'react';
import clsx from 'clsx';

import Header from '@/components/header/Header';
//import RelationsTable from '@/components/table/RelationsTable';
import RealtimeTables from '@/components/table/RealtimeTables';

export default async function Page() {
  const zeroId = '00000000-0000-0000-0000-000000000000' as const;
  
  return (
    <div>
      <Header className='min-h-[4rem]'/>
      {/*
      <RelationsTable className='h-[calc(100vh-8rem)]'/>
      */}
      <div
        className={clsx(
          'h-[calc(100vh-8rem)] overflow-auto',
          'p-8',
        )}
      >
        <RealtimeTables projectId={zeroId} />
      </div>
    </div>
  );
}

