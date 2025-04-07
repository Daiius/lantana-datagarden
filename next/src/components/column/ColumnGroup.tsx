import React from 'react';
import clsx from 'clsx';

import type {
  ColumnGroup,
  Column,
} from '@/types';

import Columns from '@/components/column/Columns';
import DebouncedInput from '@/components/common/DebouncedInput';
import Button from '@/components/common/Button';
import { IconTrash } from '@tabler/icons-react';

import { useColumnGroup } from '@/hooks/useColumnGroup';

type ColumnGroupWithColumns = ColumnGroup & { columns: Column[] };

type ColumnGroupProps = {
  columnGroup: ColumnGroupWithColumns

  className?: string;
};

const ColumnGroup = ({
  columnGroup: initialColumnGroup,
  className,
}: ColumnGroupProps) => {

  const { id, projectId } = initialColumnGroup;
  const {
    columnGroup,
    updateColumnGroup,
    deleteColumnGroup,
  } = useColumnGroup({
    initialColumnGroup
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
          <DebouncedInput
            value={columnGroup.name}
            debouncedOnChange={async newValue =>
              await updateColumnGroup(
                { ...columnGroup, name: newValue as string }
              )
            }
          />
        </fieldset>
        <Button 
          className='text-error ms-auto'
          onClick={async () => await deleteColumnGroup(
            { ...columnGroup }
          )}
        >
          <IconTrash />
        </Button>
      </div>
      <Columns 
        projectId={projectId}
        columnGroupId={id}
        initialColumns={columnGroup.columns} 
      />
    </div>
  );
};

export default ColumnGroup;

