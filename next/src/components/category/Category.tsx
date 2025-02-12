
import React from 'react';
import clsx from 'clsx';

import type {
  CategoryColumns
} from '@/types';
import RealtimeCategory from '@/components/category/RealtimeCategory';

const Category: React.FC<
  React.ComponentProps<'div'>
  & { category: CategoryColumns }
> = async ({
  category,
  className,
  ...props
}) => (
  <div 
    className={clsx(className)}
    {...props}
  >
    <RealtimeCategory
      initialCategory={category}
    />
  </div>
);

export default Category;

