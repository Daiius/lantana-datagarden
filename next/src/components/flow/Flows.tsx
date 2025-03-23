'use client'

import React from 'react';
import clsx from 'clsx';

import Flow from '@/components/flow/Flow';
import Button from '@/components/common/Button';

import { useFlows } from '@/hooks/useFlows';
import { useColumnGroups } from '@/hooks/useColumnGroups';

/**
 * データ表示方法を規定するflow表示用のコンポーネント
 */
const Flows: React.FC<
  React.ComponentProps<'div'>
  & {
    projectId: string;
  }
> = ({
  projectId,
  className,
  ...props
}) => {
  const { 
    flows,
    addFlow,
  } = useFlows({ projectId });

  if (flows == null) return (
    <div className='skeleton h-32 w-full'></div>
  );

  return (
    <div className='flex flex-col gap-4'>
      {flows.map(flow =>
        <Flow 
          key={flow.id} 
          initialFlow={flow} 
        />
      )}
      <div className='divider'/>
      <Button 
        className='btn-success btn-block'
        onClick={async () => {
          await addFlow({ 
            projectId,
            columnGroupIds: [[]],
            name: '新しいフロー',
          })
        }}
      >
        フローを追加
      </Button>
      {/*
      <pre>
        {JSON.stringify(flows, undefined, 2)}
      </pre>
      */}
    </div>
  );
};

export default Flows;

