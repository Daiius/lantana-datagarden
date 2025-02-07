'use client';

import type { 
  Category,
} from '@/types';
import Input from '@/components/common/Input';
import { updateCategoryName } from '@/actions/category';

const CateogryName: React.FC<
  React.ComponentProps<'div'>
  & { category: Category }
> = ({
  category,
  className,
  ...props
}) => (
  <div 
    className='text-lg flex flex-row'
    {...props}
  >
    <div>
      プロジェクト名：
    </div>
    <Input
      value={category.name}
      onUpdate={async (newName: string) => updateCateogryName(
        category.id, newName
      )}
    />
  </div>
);

export default CateogryName;

