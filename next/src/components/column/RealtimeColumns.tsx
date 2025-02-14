'use client'

import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';
import Skeleton from '../common/Skeleton';
import RealtimeColumn from '@/components/column/RealtimeColumn';

const RealtimeColumns: React.FC<
  React.ComponentProps<'div'>
  & { categoryId: string }
> = ({
  categoryId,
  className,
  ...props
}) => {
  const utils = trpc.useUtils();
  trpc.column.onUpdateList.useSubscription(
    { categoryId }, {
      onData: data =>
        utils.column.list.setData({ categoryId }, data),
      onError: err => console.error(err),
    }
  ); 
  const { data: columns, isLoading } = 
    trpc.column.list.useQuery({ categoryId });

  if (columns == null) {
    return isLoading
      ? <Skeleton />
      : <div>columnsをロードできません</div>
  }

  return (
    <>
      {columns.map(c =>
        <RealtimeColumn key={c.id} initialColumn={c} />
      )}
    </>
  );
};

export default RealtimeColumns;

