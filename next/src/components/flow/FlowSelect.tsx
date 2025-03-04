'use client'

import React from 'react';
import clsx from 'clsx';

import { useRouter } from 'next/navigation';

import {
  useRealtimeFlows
} from '@/hooks/useRealtimeFlows';

/**
 * Flowを選択するためのコンポーネント
 *
 * TODO
 * データベースの値を書き換える場合と、
 * クライアント側の一時的な状態を書き換える場合とで
 * 使い方が大分異なり、両方に対応できているか微妙かもしれない
 */
const FlowSelect: React.FC<
  React.ComponentProps<'select'>
  & { 
    projectId: string; 
    initialId?: number;
  }
> = ({
  projectId,
  value,
  initialId,
  className,
  ...props
}) => {
  const { flows } = useRealtimeFlows({ projectId });
  const router = useRouter();

  if (flows == null) return (
    <div className='skeleton select-md'/>
  );

  return (
    <select
      {...props}
      className={clsx('select', className)}
      onChange={async e => {
        const newName = e.currentTarget.value;
        const selectedFlow = flows
          .find(f => f.name === newName);
          if (selectedFlow == null) return;

          router.push(
            `/projects/${projectId}/tables/${selectedFlow.id}`
          );
      }}
      value={
        value 
        ?? (
          initialId != null
          ? flows.find(f => f.id === initialId)?.name
          : undefined
        )
      }
    >
      <option value=''>選択してください...</option>
      {flows.map(f =>
        <option key={f.id} value={f.name}>{f.name}</option>
      )}
    </select>
  );
};

export default FlowSelect;

