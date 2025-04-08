'use client'

import React from 'react';
import clsx from 'clsx';

import Flow from '@/components/flow/Flow';
import Button from '@/components/common/Button';

import { useFlows } from '@/hooks/useFlows';

type FlowsProps = {
  projectId: string;

  className?: string;
};

/**
 * データ表示方法を規定するflow表示用のコンポーネント
 */
const Flows = ({
  projectId,
  className,
}: FlowsProps) => {
  const { 
    flows,
    addFlow,
  } = useFlows({ projectId });

  if (flows == null) return (
    <div className='skeleton h-32 w-full'></div>
  );

  return (
    <div className={clsx('flex flex-col gap-4', className)}>
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
            flowSteps: [],
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

