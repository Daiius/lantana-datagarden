import React from 'react';
import clsx from 'clsx';

import type {
  ColumnGroup,
  Column,
} from '@/types';

import { IconTrash } from '@tabler/icons-react';

import { useColumnGroup } from '@/hooks/useColumnGroup';

import Button from '@/components/common/Button';
import Columns from '@/components/column/Columns';
import Input from '@/components/common/Input';


type ColumnGroupProps = {
  columnGroup: ColumnGroup

  className?: string;
};

const ColumnGroup = ({
  columnGroup: initialColumnGroup,
  className,
}: ColumnGroupProps) => {

  const { id, projectId } = initialColumnGroup;
  const {
    data: columnGroup,
    update,
    remove,
  } = useColumnGroup({
    initialData: initialColumnGroup
  });

  return (
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
        projectId={projectId}
        columnGroupId={id}
        initialColumns={columnGroup.columns} 
      />
      <div className='divider'/>
      <div>
        {columnGroup.measurements.map(m =>
          <div key={m.id}>
            <pre>{JSON.stringify(m)}</pre>
          </div>
        )}
        <Button 
          className='btn-soft btn-accent'
          onClick={async () => {
          }}
        >
          測定追加
        </Button>
      </div>
    </div>
  );
};

export default ColumnGroup;

