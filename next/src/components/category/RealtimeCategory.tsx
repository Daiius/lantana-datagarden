'use client';

import React from 'react';

import { trpc } from '@/providers/TrpcProvider';

import type { 
  Category,
} from '@/types';

import DebouncedInput from '@/components/common/DebouncedInput';
import Skeleton from '../common/Skeleton';
import RealtimeColumns from '@/components/column/RealtimeColumns';

import RealtimeTable from '@/components/table/RealtimeTable';

const RealtimeCategory: React.FC<
  React.ComponentProps<'div'>
  & { initialCategory: Category }
> = ({
  initialCategory,
  className,
  ...props
}) => { 

  const utils = trpc.useUtils();
  const mutation = trpc.category.update.useMutation();
  trpc.category.onUpdate.useSubscription(
      initialCategory, {
      onData: data =>
        utils.category.get.setData(initialCategory, data),
      onError: err => console.log(err),
    },
  );
  const { data: category, isLoading } = trpc.category.get.useQuery(
    initialCategory,
    { initialData: initialCategory }
  );

  if (category == null) {
    return isLoading
      ? <Skeleton />
      : <div>カテゴリが見つかりません</div>
  }

  return (
    <div>
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
      <RealtimeColumns categoryId={category.id}/>
      <RealtimeTable 
        projectId={category.projectId}
        categoryId={category.id}
      />
    </div>
  );
};

export default RealtimeCategory;

