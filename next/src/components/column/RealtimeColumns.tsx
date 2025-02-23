import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';

import type {
  Column
} from '@/types';

import RealtimeColumn from '@/components/column/RealtimeColumn';

const RealtimeColumns: React.FC<
  React.ComponentProps<'div'>
  & { columns: Column[] }
> = ({
  columns: initialColumns,
  className,
  ...props
}) => {

  const columnGroupId = initialColumns[0]?.columnGroupId ?? '';
  const projectId = initialColumns[0]?.projectId ?? '';

  const utils = trpc.useUtils();
  const { data: columns } = trpc.column.list.useQuery(
    { projectId, columnGroupId },
    { enabled: false, initialData: initialColumns }
  );
  trpc.column.onUpdateList.useSubscription(
    { projectId, columnGroupId },
    {
      onData: data => utils.column.list.setData(
        { projectId, columnGroupId },
        data
      ),
      onError: err => console.error(err),
    }
  );

  return (
    <div
      className={clsx(className)}
      {...props}
    >
      {columns.map(c =>
        <RealtimeColumn key={c.id} initialColumn={c} />
      )}
    </div>
  );
};

export default RealtimeColumns;

