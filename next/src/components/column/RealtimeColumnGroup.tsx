import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';

import type {
  ColumnGroup,
  Column,
} from '@/types';

import RealtimeColumns from '@/components/column/RealtimeColumns';
import DebouncedInput from '@/components/common/DebouncedInput';
import Button from '@/components/common/Button';
import { TrashIcon } from '@/components/icon/Icons';

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
 
  const { mutateAsync: updateColumnGroup } = 
    trpc.columnGroup.update.useMutation();
  const { mutateAsync: deleteColumnGroup } =
    trpc.columnGroup.remove.useMutation();

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
      <div className='flex flex-row'>
        <fieldset className='fieldset'>
          <label className='fieldset-label'>
            列グループ名:
          </label>
          <DebouncedInput
            value={columnGroup.name}
            debouncedOnChange={async newValue =>
              await updateColumnGroup(
                { ...columnGroup, name: newValue as string }
              )
            }
          />
        </fieldset>
        <Button 
          className='text-error ms-auto'
          onClick={async () => await deleteColumnGroup(
            { ...columnGroup }
          )}
        >
          <TrashIcon />
        </Button>
      </div>
      <RealtimeColumns 
        projectId={projectId}
        columnGroupId={id}
        initialColumns={columnGroup.columns} 
      />
    </div>
  );
};

export default RealtimeColumnGroup;

