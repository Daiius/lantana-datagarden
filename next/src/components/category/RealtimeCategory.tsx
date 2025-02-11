'use client';

import React from 'react';

import { trpc } from '@/providers/TrpcProvider';

import type { Category } from '@/types';
import DebouncedInput from '@/components/common/DebouncedInput';

const RealtimeCategory: React.FC<
  React.ComponentProps<'div'>
  & { initialCategory: Category }
> = ({
  initialCategory,
  className,
  ...props
}) => { 
  const [category, setCategory] = 
    React.useState<Category>(initialCategory);

  const mutation = trpc.category.update.useMutation();
  trpc.category.onUpdate.useSubscription(
    category, 
    {
      onData: data => setCategory(data),
      onError: err => console.log(err),
    },
  );

  return (
    <div 
      className='text-lg flex flex-row'
      {...props}
    >
      <div>カテゴリ名：</div>
      <DebouncedInput
        value={category.name}
        debouncedOnChange={async (newValue: string) =>
          await mutation.mutateAsync({ ...category, name: newValue })
        }
      />
    </div>
  );
};

export default RealtimeCategory;

