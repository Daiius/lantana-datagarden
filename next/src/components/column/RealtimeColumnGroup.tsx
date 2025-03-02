import React from 'react';
import clsx from 'clsx';

import type {
  ColumnGroup,
  Column,
} from '@/types';

import RealtimeColumns from '@/components/column/RealtimeColumns';
import DebouncedInput from '@/components/common/DebouncedInput';
import Button from '@/components/common/Button';
import { IconTrash } from '@tabler/icons-react';

import { useRealtimeColumnGroup } from '@/hooks/useRealtimeColumnGroup';

type ColumnGroupWithColumns = ColumnGroup & { columns: Column[] };

const RealtimeColumnGroup: React.FC<
  React.ComponentProps<'div'>
  & { columnGroup: ColumnGroupWithColumns }
> = ({
  columnGroup: initialColumnGroup,
  className,
  ...props
}) => {

  const { id, projectId } = initialColumnGroup;
  const {
    columnGroup,
    updateColumnGroup,
    deleteColumnGroup,
  } = useRealtimeColumnGroup({
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
      {...props}
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
      <RealtimeColumns 
        projectId={projectId}
        columnGroupId={id}
        initialColumns={columnGroup.columns} 
      />
    </div>
  );
};

export default RealtimeColumnGroup;

