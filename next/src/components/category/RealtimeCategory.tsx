'use client';

import React from 'react';
import clsx from 'clsx';

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
  const { mutateAsync } = trpc.category.update.useMutation();
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
    <div
        className={clsx(
          'bg-sky-300/50 rounded-lg shadow',
          'border border-sky-500',
          'px-2 pb-2', 
        )}
    >
      <div className='flex flex-row items-center'>
        <div
          className='text-2xl text-sky-800 font-bold'
        >
          Category
        </div>
        <div className='ml-8 text-sky-800/50'>
          id: {category.id}
        </div>
      </div>
      <div 
        className='text-lg flex flex-row'
        {...props}
      >
        <div>カテゴリ名：</div>
        <DebouncedInput
          value={category.name}
          debouncedOnChange={async (newValue: string) =>
            await mutateAsync({ ...category, name: newValue })
          }
        />
      </div>
      <div 
        className='text-lg flex flex-row'
        {...props}
      >
        <div>カテゴリ種類：</div>
        <DebouncedInput
          value={category.type}
          debouncedOnChange={async (newValue: string) =>
            await mutateAsync({ ...category, type: newValue })
          }
        />
      </div>
      <div className='ml-4 rounded-md border border-sky-500 px-2 pb-2 m-2'>
        <div className='text-sky-800 text-xl font-bold'>Columns</div>
        <div className='ml-2'>
          <RealtimeColumns categoryId={category.id}/>
        </div>
      </div>
      <RealtimeTable 
        projectId={category.projectId}
        categoryId={category.id}
      />
    </div>
  );
};

export default RealtimeCategory;

