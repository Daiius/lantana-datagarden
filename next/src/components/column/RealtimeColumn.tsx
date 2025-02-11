'use client';

import React from 'react';

import { trpc } from '@/providers/TrpcProvider';

import type { Column } from '@/types';
import DebouncedInput from '@/components/common/DebouncedInput';


const RealtimeColumn: React.FC<
  React.ComponentProps<'div'>
  & { initialColumn: Column }
> = ({
  initialColumn,
  className,
  ...props
}) => { 
  const [column, setColumn] = 
    React.useState<Column>(initialColumn);

  const mutation = trpc.column.updateName.useMutation();
  trpc.column.onUpdate.useSubscription(
    column, 
    {
      onData: data => setColumn(data),
      onError: err => console.log(err),
    },
  );

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

