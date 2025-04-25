'use client'

import React from 'react';
import clsx from 'clsx';

import Skeleton from '../common/Skeleton';
import ColumnGroup from '@/components/column/ColumnGroup';
import Button from '@/components/common/Button';

import { useColumnGroups } from '@/hooks/useColumnGroups';

type ColumnGroupsProps = {
  projectId: string;

  className?: string;
};


const ColumnGroups = ({
  projectId,
  className,
}: ColumnGroupsProps) => {

  const { 
    data: columnGroups,
    isLoading,
    update,
    add,
    remove,
  } = useColumnGroups({ projectId });

  if (isLoading) return (
    <Skeleton />
  );

  return (
    <div 
      className={clsx(
        'px-2 pb-2 m-2',
        'flex flex-col gap-4',
        'animate-fade-in',
        className,
      )}
    >
      <div className='text-xl font-bold'>
        列グループ
      </div>
      {columnGroups.map(c =>
        <ColumnGroup 
          key={c.id} 
          columnGroup={c} 
          update={update}
          remove={remove}
        />
      )}
      <div className='divider'></div>
      <Button 
        className='btn-success'
        onClick={async () => await add({
          name: '新しい列グループ',
          sort: null,
          projectId,
        })}
      >
        + 列グループの追加
      </Button>
    </div>
  );
};

export default ColumnGroups;

