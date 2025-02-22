import React from 'react';
import clsx from 'clsx';

import Header from '@/components/header/Header';
import RelationsTable from '@/components/table/RelationsTable';

export default async function Page() {
  const zeroId = '00000000-0000-0000-0000-000000000000' as const;
  
  return (
    <div>
      <Header className='min-h-[4rem]'/>
      <RelationsTable className='h-[calc(100vh-8rem)]'/>
    </div>
  );
}

