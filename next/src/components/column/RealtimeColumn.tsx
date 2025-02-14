'use client';

import React from 'react';

import { trpc } from '@/providers/TrpcProvider';

import type { Column } from '@/types';
import { DataTypes } from '@/types';
import DebouncedInput from '@/components/common/DebouncedInput';
import DebouncedSelect from '@/components/common/DebouncedSelect';
import Skeleton from '../common/Skeleton';


const RealtimeColumn: React.FC<
  React.ComponentProps<'div'>
  & { initialColumn: Column }
> = ({
  initialColumn,
  className,
  ...props
}) => { 

  const utils = trpc.useUtils();
  const { mutateAsync } = trpc.column.update.useMutation();
  trpc.column.onUpdate.useSubscription(
    initialColumn, 
    {
      onData: data =>
        utils.column.get.setData(initialColumn, data),
      onError: err => console.log(err),
    },
  );
  const { data: column, isLoading } = trpc.column.get.useQuery(
    initialColumn,
    { initialData: initialColumn }
  );

  if (column == null) {
    return isLoading
      ? <Skeleton />
      : <div>columnをロードできません</div>
  }

  return (
    <div 
      className='text-lg flex flex-row items-center'
      {...props}
    >
      <fieldset className='fieldset'>
        <label className='fieldset-label'>列名：</label>
        <DebouncedInput
          value={column.name}
          debouncedOnChange={async (newValue: string) =>
            await mutateAsync({ ...column, name: newValue })
          }
        />
      </fieldset>
      <fieldset className='fieldset'>
        <label className='fieldset-label'>型：</label>
        <DebouncedSelect
          value={column.type}
          options={DataTypes}
          debouncedOnChange={async (newValue) =>
            await mutateAsync({ ...column, type: newValue })
          }
        />
      </fieldset>
    </div>
  );
};

export default RealtimeColumn;

