'use client'

import React from 'react'
import clsx from 'clsx'

import { trpc } from '@/providers/TrpcProvider';

import Skeleton from '@/components/common/Skeleton';
import RealtimeTable from '@/components/table/RealtimeTable';

const Sequences: React.FC<
  React.ComponentProps<'div'>
  & { projectId: string }
> = ({
  projectId,
  className,
  ...props
}) => {
  const utils = trpc.useUtils();
  const { data: sequences, isLoading } = trpc.category.list.useQuery(
    { projectId, type: 'sequence' }
  );
  trpc.category.onUpdateList.useSubscription(
    { projectId }, {
      onData: data => utils.category.list.setData(
        { projectId, type: 'sequence' }, data
      ),
      onError: err => console.error(err),
    }
  );

  if (sequences == null) {
    return isLoading
      ? <Skeleton />
      : <div>カテゴリ一覧をロードできません</div>
  }

  return (
    <div className={clsx(
      'flex flex-row',
      className,
    )}>
      {sequences.map(c =>
        <div key={c.id}>
          <div>{c.name}</div>
          <RealtimeTable
            projectId={projectId}
            categoryId={c.id}
          />
        </div>
      )}
    </div>
  );
};

export default Sequences;

