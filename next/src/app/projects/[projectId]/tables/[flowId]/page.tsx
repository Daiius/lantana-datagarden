import React from 'react';
import clsx from 'clsx';

import Header from '@/components/header/Header';
import RealtimeTables from '@/components/table/RealtimeTables';

import FlowSelect from '@/components/flow/FlowSelect';

const TablesForFlowIdPage = async ({
  params
}: {
  params: Promise<{ projectId: string, flowId: string }>
}) => {
  const { projectId, flowId } = await params;

  return (
    <div>
      <Header 
        className='h-[4rem]' 
        projectId={projectId}
      />
      <div className='h-[calc(100vh-4rem)] overflow-auto p-4'>
        <FlowSelect
          projectId={projectId}
          initialId={Number(flowId)}
        />
        <RealtimeTables
          projectId={projectId}
          flowId={Number(flowId)}
        />
      </div>
    </div>
  );
};

export default TablesForFlowIdPage;

