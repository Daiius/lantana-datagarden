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
    columnGroups,
    addColumnGroup,
  } = useColumnGroups({
    projectId
  });

  if (columnGroups == null) return (
    <Skeleton />
  );

  return (
    <div 
      className={clsx(
        'px-2 pb-2 m-2',
        'flex flex-col gap-4',
        className,
      )}
    >
      <div className='text-xl font-bold'>
        列グループ
      </div>
      {columnGroups.map(c =>
        <ColumnGroup key={c.id} columnGroup={c} />
      )}
      <div className='divider'></div>
      <Button 
        className='btn-success'
        onClick={async () => await addColumnGroup({
          name: '新しい列グループ',
          type: 'condition',
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

