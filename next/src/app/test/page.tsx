import React from 'react';
import clsx from 'clsx';

import Header from '@/components/header/Header';
import RelationsTableTest from '@/components/table/RelationsTableTest';

export default async function Page() {
  const zeroId = '00000000-0000-0000-0000-000000000000' as const;
  
  return (
    <div >
      <Header className='h-8'/>
      <RelationsTableTest 
        className='m-2 p-2 h-[calc(100vh-8rem)]'
      />
    </div>
  );
}

