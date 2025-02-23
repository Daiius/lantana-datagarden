'use client'

import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';
import Skeleton from '../common/Skeleton';
import RealtimeColumnGroup from '@/components/column/RealtimeColumnGroup';
import Button from '@/components/common/Button';

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
  const { mutateAsync } = trpc.columnGroup.add.useMutation();

  if (columnGroups == null) {
    return isLoading
      ? <Skeleton />
      : <div>columnGroupsをロードできません</div>
  }

  return (
    <div 
      className={clsx(
        'px-2 pb-2 m-2',
        'flex flex-col gap-4',
        className,
      )}
      {...props}
    >
      <div className='text-xl font-bold'>
        列グループ
      </div>
      {columnGroups.map(c =>
        <RealtimeColumnGroup key={c.id} columnGroup={c} />
      )}
      <div className='divider'></div>
      <Button 
        className='btn-success'
        onClick={async () => await mutateAsync({
          name: '新しい列グループ',
          type: 'sequence',
          sort: null,
          projectId,
        })}
      >
        + 列グループの追加
      </Button>
    </div>
  );
};

export default RealtimeColumnGroups;

