'use client';

import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';

import type { 
  Category,
} from '@/types';
import { CategoryTypes } from '@/types';

import DebouncedInput from '@/components/common/DebouncedInput';
import DebouncedSelect from '@/components/common/DebouncedSelect';

import Skeleton from '../common/Skeleton';
import RealtimeColumns from '@/components/column/RealtimeColumns';


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
      onData: data => { 
        utils.category.get.setData(initialCategory, data),
        console.log('onData: ', data);
      },
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
        'px-2 pb-2', 
      )}
      {...props}
    >
      <div className='flex flex-row items-center'>
        <div
          className='text-2xl font-bold'
        >
          Category
        </div>
        <div className='ml-8'>
          id: {category.id}
        </div>
      </div>
      <fieldset 
        className={clsx(
          'flex flex-col md:flex-row',
          'fieldset bg-base-200', 
          'border border-base-300 p-4 rounded-box',
        )}
      >
        <label className='fieldset-label'>カテゴリ名：</label>
        <DebouncedInput
          value={category.name}
          debouncedOnChange={async (newValue: string) =>
            await mutateAsync({ ...category, name: newValue })
          }
        />
        <label className='fieldset-label'>カテゴリ種類：</label>
        <DebouncedSelect
          value={category.type}
          options={CategoryTypes}
          debouncedOnChange={async newValue => {
            await mutateAsync({ ...category, type: newValue })
            console.log('newValue: ', newValue); 
          }}
        />
        
      </fieldset>
      <RealtimeColumns categoryId={category.id}/>
    </div>
  );
};

export default RealtimeCategory;

