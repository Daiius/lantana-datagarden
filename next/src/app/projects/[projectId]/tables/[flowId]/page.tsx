import React from 'react';
import clsx from 'clsx';

import Header from '@/components/header/Header';
import Tables from '@/components/table/Tables';

import FlowSelect from '@/components/flow/FlowSelect';

const TablesForFlowIdPage = async ({
  params
}: {
  params: Promise<{ projectId: string, flowId: string }>
}) => {
  const { projectId, flowId: flowIdString } = await params;

  // TODO
  // flowId が存在するか否かのチェック、
  // 無ければエラー表示、リダイレクト等対応

  const flowId = Number(flowIdString);

  return (
    <div>
      <Header 
        className='h-[4rem]' 
        projectId={projectId}
      />
      <div className='h-[calc(100vh-4rem)] overflow-auto p-4'>
        <FlowSelect
          projectId={projectId}
          initialId={flowId}
        />
        <Tables
          projectId={projectId}
          flowId={flowId}
        />
      </div>
    </div>
  );
};

export default TablesForFlowIdPage;

