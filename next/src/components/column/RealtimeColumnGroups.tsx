'use client'

import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';
import Skeleton from '../common/Skeleton';
import RealtimeColumnGroup from '@/components/column/RealtimeColumnGroup';

const RealtimeColumnGroups: React.FC<
  React.ComponentProps<'div'>
  & { projectId: string }
> = ({
  projectId,
  className,
  ...props
}) => {
  // column関連のトップレベルのデータ取得
  // まとめてネストしたcolumnGroups, columns を取得する
  const { data: columnGroups, isLoading } = 
    trpc.columnGroup.list.useQuery({ projectId });
  const utils = trpc.useUtils();
  // 数の変更や削除時に全読み込みしなおす
  trpc.columnGroup.onUpdateList.useSubscription(
    { projectId }, {
      onData: data =>
        utils.columnGroup.list.setData({ projectId }, data),
      onError: err => console.error(err),
    }
  ); 

  if (columnGroups == null) {
    return isLoading
      ? <Skeleton />
      : <div>columnGroupsをロードできません</div>
  }

  return (
    <div 
      className={clsx('px-2 pb-2 m-2')}
      {...props}
    >
      <div className='text-xl font-bold'>
        Columns
      </div>
      {columnGroups.map(c =>
        <RealtimeColumnGroup key={c.id} columnGroup={c} />
      )}
    </div>
  );
};

export default RealtimeColumnGroups;

