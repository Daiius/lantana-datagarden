'use client';

import React from 'react';

import { trpc } from '@/providers/TrpcProvider';

import type { Column } from '@/types';
import DebouncedInput from '@/components/common/DebouncedInput';
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
  const mutation = trpc.column.updateName.useMutation();
  trpc.column.onUpdate.useSubscription(
    initialColumn, 
    {
      onData: data =>
        utils.column.get.setData(initialColumn, data),
      onError: err => console.log(err),
    },
  );
  const { data: column, isLoading } =trpc.column.get.useQuery(
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
      className='text-lg flex flex-row'
      {...props}
    >
      <div>列名：</div>
      <DebouncedInput
        value={column.name}
        debouncedOnChange={async (newValue: string) =>
          await mutation.mutateAsync({ ...column, name: newValue })
        }
      />
      <div>型：</div>
      <div>{column.type}</div>
    </div>
  );
};

export default RealtimeColumn;

