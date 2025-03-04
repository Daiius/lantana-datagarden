import React from 'react';
import clsx from 'clsx';

import Header from '@/components/header/Header';
import Flows from '@/components/flow/Flows';

export default async function FlowsPage({
  params
}: { params: Promise<{ projectId: string }> }) {

  const { projectId } = await params;

  return (
    <div>
      <Header className='h-[4rem]' projectId={projectId} />
      <div className='h-[calc(100vh-4rem)] overflow-auto p-4'>
        <Flows projectId={projectId} />
      </div>
    </div>
  );
};

