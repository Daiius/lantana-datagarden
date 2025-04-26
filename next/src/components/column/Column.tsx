'use client';

import clsx from 'clsx';

import type { Column } from '@/types';
import { DataTypes } from '@/types';
import Input from '@/components/common/Input';
import DebouncedSelect from '@/components/common/DebouncedSelect';
import Button from '@/components/common/Button';
import { IconTrash } from '@tabler/icons-react';

import type { useColumns } from '@/hooks/useColumns';

type ColumnProps = 
  & { column: Column; }
  & Pick<ReturnType<typeof useColumns>, 'update'|'remove'>
  & {className?: string; }

const Column = ({
  column,
  update,
  remove,
  className,
}: ColumnProps) => (
  <div 
    className={clsx('text-lg flex flex-row', className)}
  >
    <fieldset className='fieldset'>
      <label className='fieldset-label'>
        列名：
      </label>
      <Input
        value={column.name}
        onChange={async newValue =>
          await update({ ...column, name: newValue as string })
        }
      />
    </fieldset>
    <fieldset className='fieldset'>
      <label className='fieldset-label'>
        型：
      </label>
      <DebouncedSelect
        value={column.type}
        options={DataTypes}
        debouncedOnChange={async (newValue) =>
          await update({ ...column, type: newValue })
        }
      />
    </fieldset>
    {/* TODO 手動で位置を調整してしまっている...... */}
    <Button 
      className='text-error ml-8 mt-7'
      onClick={async () => await remove(column)}
    >
      <IconTrash />
    </Button>
  </div>
);

export default Column;

