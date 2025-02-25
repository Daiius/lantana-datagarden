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
      <div
        className={clsx(
          'h-[calc(100vh-8rem)] overflow-auto scroll-m-4',
        )}
      >
        <div 
          className={clsx(
            'w-fit h-full',
            'bg-gradient-to-r from-neutral from-20% via-base-300 to-base-300',
          )}
        >
          <RealtimeTables className='p-4' projectId={zeroId} />
        </div>
      </div>
    </div>
  );
}

