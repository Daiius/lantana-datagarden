'use client';

import React from 'react';

import { trpc } from '@/providers/TrpcProvider';

import type { Column } from '@/types';
import { DataTypes } from '@/types';
import DebouncedInput from '@/components/common/DebouncedInput';
import DebouncedSelect from '@/components/common/DebouncedSelect';
import Skeleton from '../common/Skeleton';
import Button from '@/components/common/Button';
import { IconTrash } from '@tabler/icons-react';


const RealtimeColumn: React.FC<
  React.ComponentProps<'div'>
  & { initialColumn: Column }
> = ({
  initialColumn,
  className,
  ...props
}) => { 
  const { projectId, columnGroupId, id } = initialColumn;
  const utils = trpc.useUtils();
  const { mutateAsync: updateColumn } = 
    trpc.column.update.useMutation();
  const { mutateAsync: deleteColumn } =
    trpc.column.remove.useMutation();
  trpc.column.onUpdate.useSubscription(
    { id, projectId, columnGroupId }, 
    {
      onData: data =>
        utils.column.get.setData(
          { id, projectId, columnGroupId },
          data
        ),
      onError: err => console.log(err),
    },
  );
  const { data: column, isLoading } = trpc.column.get.useQuery(
    { id, projectId, columnGroupId },
    { enabled: false, initialData: initialColumn }
  );

  if (column == null) {
    return isLoading
      ? <Skeleton />
      : <div>columnをロードできません</div>
  }

  return (
    <div 
      className='text-lg flex flex-row'
      {...props}
    >
      <fieldset className='fieldset'>
        <label className='fieldset-label'>
          列名：
        </label>
        <DebouncedInput
          value={column.name}
          debouncedOnChange={async newValue =>
            await updateColumn({ ...column, name: newValue as string })
          }
        />
      </fieldset>
      <fieldset className='fieldset'>
        <label className='fieldset-label'>
          型：
        </label>
        <DebouncedSelect
          value={column.type}
          options={DataTypes}
          debouncedOnChange={async (newValue) =>
            await updateColumn({ ...column, type: newValue })
          }
        />
      </fieldset>
      {/* TODO 手動で位置を調整してしまっている...... */}
      <Button 
        className='text-error ml-8 mt-7'
        onClick={async () => await deleteColumn(
          { ...column }
        )}
      >
        <IconTrash />
      </Button>
    </div>
  );
};

export default RealtimeColumn;

