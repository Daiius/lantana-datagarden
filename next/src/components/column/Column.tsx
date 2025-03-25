'use client';

import React from 'react';

import type { Column } from '@/types';
import { DataTypes } from '@/types';
import DebouncedInput from '@/components/common/DebouncedInput';
import DebouncedSelect from '@/components/common/DebouncedSelect';
import Skeleton from '../common/Skeleton';
import Button from '@/components/common/Button';
import { IconTrash } from '@tabler/icons-react';

import { useColumn } from '@/hooks/useColumn';


const Column: React.FC<
  React.ComponentProps<'div'>
  & { initialColumn: Column }
> = ({
  initialColumn,
  className,
  ...props
}) => { 
  const {
    column,
    update,
    remove,
  } = useColumn({ initialColumn });

  if (column == null) return (
    <Skeleton />
  );

  return (
    <div 
      className='text-lg flex flex-row'
      {...props}
    >
      <fieldset className='fieldset'>
        <label className='fieldset-label'>
          列名：
        </label>
        <DebouncedInput
          value={column.name}
          debouncedOnChange={async newValue =>
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
};

export default Column;

