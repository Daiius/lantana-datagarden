import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';

import type {
  ColumnGroup,
  Column,
} from '@/types';

import RealtimeColumns from '@/components/column/RealtimeColumns';
import DebouncedInput from '@/components/common/DebouncedInput';

type ColumnGroupWithColumns = ColumnGroup & { columns: Column[] };

const RealtimeColumnGroup: React.FC<
  React.ComponentProps<'div'>
  & { columnGroup: ColumnGroupWithColumns }
> = ({
  columnGroup: initialColumnGroup,
  className,
  ...props
}) => {
  const utils = trpc.useUtils();
  const { id, projectId } = initialColumnGroup;
  const { data: queriedColumnGroup } = trpc.columnGroup.get.useQuery(
    { id, projectId },
    { enabled: false, initialData: initialColumnGroup }
  );
  const { mutateAsync } = trpc.columnGroup.update.useMutation();
  trpc.columnGroup.onUpdate.useSubscription(
    { id, projectId },
    {
      onData: data => utils.columnGroup.get.setData(
        { id, projectId }, data
      ),
      onError: err => console.error(err),
    }
  );
  const columnGroup = {
    ...initialColumnGroup,
    ...queriedColumnGroup,
  };

  return (
    <div 
      className={clsx(
        'rounded-lg border border-base-100',
        'p-4',
        'bg-base-200',
        className,
      )} 
      {...props}
    >
      <fieldset className='fieldset'>
        <label className='fieldset-label'>
          列グループ名:
        </label>
        <DebouncedInput
          value={columnGroup.name}
          debouncedOnChange={async newValue =>
            await mutateAsync({ ...columnGroup, name: newValue as string })
          }
        />
      </fieldset>
      <RealtimeColumns 
        projectId={projectId}
        columnGroupId={id}
        initialColumns={columnGroup.columns} 
      />
    </div>
  );
};

export default RealtimeColumnGroup;

