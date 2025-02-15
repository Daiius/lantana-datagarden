'use client'

import React from 'react';
import clsx from 'clsx';

import {
  Category,
  CategoryColumns
} from '@/types';

import { trpc } from '@/providers/TrpcProvider';
import Skeleton from '@/components/common/Skeleton';
import Button from '@/components/common/Button';
import RealtimeCategory from '@/components/category/RealtimeCategory';

const RealtimeCategories: React.FC<{
  projectId: string,
}> = ({
  projectId,
}) => {

  const utils = trpc.useUtils();
  trpc.category.onUpdateList.useSubscription(
    { projectId }, {
      onData: data => utils.category.list.setData(
        { projectId }, data
      ),
      onError: err => console.error(err.toString()),
    }
  );
  const { data: categories, isLoading } = 
    trpc.category.list.useQuery({ projectId });

  if (categories == null) {
    return isLoading
      ? <Skeleton />
      : <div>カテゴリ一覧がロードできません</div>
      ;
  }

  return (
    <>
      {categories.map(c =>
        <RealtimeCategory 
          key={c.id} 
          initialCategory={c}
        />
      )}
      <Button>
        カテゴリ追加
      </Button>
    </>
  );
};

export default RealtimeCategories;

