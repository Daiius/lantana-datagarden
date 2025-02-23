import React from 'react';
import clsx from 'clsx';

import type {
  ColumnGroup,
  Column,
} from '@/types';

import RealtimeColumns from '@/components/column/RealtimeColumns';

type ColumnGroupWithColumns = ColumnGroup & { columns: Column[] };

const RealtimeColumnGroup: React.FC<
  React.ComponentProps<'div'>
  & { columnGroup: ColumnGroupWithColumns }
> = ({
  columnGroup,
  className,
  ...props
}) => {
  return (
    <div className={clsx(className)} {...props}>
      <div>column group name:</div>
      <div>{columnGroup.name}</div>
      <RealtimeColumns columns={columnGroup.columns} />
    </div>
  );
};

export default RealtimeColumnGroup;

