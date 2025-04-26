'use client'

import React from 'react';
import clsx from 'clsx';

import Flow from '@/components/flow/Flow';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';

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
    data: flows,
    isLoading,
    add,
    remove,
    update,
  } = useFlows({ projectId });

  if (isLoading) return <Skeleton />;

  return (
    <div className={clsx('flex flex-col gap-4', className)}>
      {flows.map(flow =>
        <Flow 
          key={flow.id} 
          flow={flow} 
          remove={remove}
          update={update}
        />
      )}
      <div className='divider'/>
      <Button 
        className='btn-success btn-block'
        onClick={async () => {
          await add({ 
            projectId,
            name: '新しいフロー',
          })
        }}
      >
        フローを追加
      </Button>
    </div>
  );
};

export default Flows;

