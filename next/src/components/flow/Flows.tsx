'use client'

import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';

import Flow from '@/components/flow/Flow';

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
  const { data: nestedFlows } = trpc.flow.listNested.useQuery({
    projectId,
  });

  if (nestedFlows == null) return (
    <div className='skeleton h-32 w-full'></div>
  );

  return (
    <div>
      {nestedFlows.map(flow =>
        <Flow key={flow.id} initialFlow={flow} />
      )}
      <pre>
        {JSON.stringify(nestedFlows, undefined, 2)}
      </pre>
    </div>
  );
};

export default Flows;

