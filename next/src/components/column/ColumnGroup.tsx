import React from 'react';
import clsx from 'clsx';

import type { ColumnGroup } from '@/types';

import { IconTrash } from '@tabler/icons-react';

import type { useColumnGroups } from '@/hooks/useColumnGroups';

import Button from '@/components/common/Button';
import Columns from '@/components/column/Columns';
import Input from '@/components/common/Input';

import { Measurements } from '@/components/column/Measurements';


type ColumnGroupProps = 
  & { columnGroup: ColumnGroup }
  & Pick<ReturnType<typeof useColumnGroups>, 'update'|'remove'>
  & { className?: string; };

const ColumnGroup = ({
  columnGroup,
  update,
  remove,
  className,
}: ColumnGroupProps) => (
  <div 
    className={clsx(
      'rounded-lg border border-base-100',
      'p-4',
      'bg-base-200',
      className,
    )} 
  >
    <div className='flex flex-row'>
      <fieldset className='fieldset'>
        <label className='fieldset-label'>
          列グループ名:
        </label>
        <Input
          value={columnGroup.name}
          onChange={async newValue =>
            await update(
              { ...columnGroup, name: newValue as string }
            )
          }
        />
      </fieldset>
      <Button 
        className='text-error ms-auto'
        onClick={async () => await remove({ 
          id: columnGroup.id,
          projectId: columnGroup.projectId,
        })}
      >
        <IconTrash />
      </Button>
    </div>
    <Columns 
      projectId={columnGroup.projectId}
      columnGroupId={columnGroup.id}
    />
    <div className='divider'/>
    <Measurements
      projectId={columnGroup.projectId}
      columnGroupId={columnGroup.id}
    />
  </div>
);

export default ColumnGroup;

