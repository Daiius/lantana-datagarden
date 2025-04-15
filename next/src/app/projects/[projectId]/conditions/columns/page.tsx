import React from 'react';
import clsx from 'clsx';

import Header from '@/components/header/Header';
import ColumnGroups from '@/components/column/ColumnGroups';

export default async function Page({
  params
}: { params: Promise<{ projectId: string }> }) {

  const { projectId } = await params;
  
  return (
    <div
      className={clsx(
      )}
    >
      <Header className='h-[4rem]' projectId={projectId} />
      <div
        className='h-[calc(100vh-4rem)] overflow-auto'
      >
        <ColumnGroups projectId={projectId} />
      </div>
    </div>
  );
}

