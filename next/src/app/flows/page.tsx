import React from 'react';
import clsx from 'clsx';

import Header from '@/components/header/Header';
import Flows from '@/components/flow/Flows';

const zeroId = '00000000-0000-0000-0000-000000000000' as const;

const FlowsPage: React.FC = async () => (
  <div>
    <Header className='h-[4rem]' />
    <div className='h-[calc(100vh-4rem)] overflow-auto p-4'>
      <Flows projectId={zeroId} />
    </div>
  </div>
);

export default FlowsPage;

