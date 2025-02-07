
import React from 'react';
import clsx from 'clsx';

import type {
  Category
} from '@/types';

const Category: React.FC<
  React.ComponentProps<'div'>
  & { category: Category }
> = async ({
  category,
  className,
  ...props
}) => (
  <div 
    className={clsx(
      className,
    )}
    {...props}
  >
    <div className='flex flex-row'>
      <div>カテゴリ名：</div>
      <div>{category.name}</div>
    </div>
  </div>
);

export default Category;

