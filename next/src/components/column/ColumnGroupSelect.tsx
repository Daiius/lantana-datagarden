import React from 'react';
import clsx from 'clsx';

import DebouncedSelect from '@/components/common/DebouncedSelect';

import { useRealtimeColumnGroups } from '@/hooks/useRealtimeColumnGroups';


const ColumnGroupSelect: React.FC<
  Omit<
    React.ComponentProps<typeof DebouncedSelect>,
    'options' | 'debouncedOnChange'
  > & { 
    projectId: string;
    debouncedOnChange: (newValue: { id: string; name: string }) => Promise<void>;
  }
> = ({
  projectId,
  className,
  debouncedOnChange,
  ...props
}) => {
  // TODO columnsまで取得する豪華バージョンなので
  // 簡易化しても良いかも
  const {
    columnGroups
  } = useRealtimeColumnGroups({
    projectId
  });

  if (columnGroups == null) return (
    <div className='skeleton h-4 w-32' />
  );

  return (
    <DebouncedSelect
      {...props}
      options={columnGroups.map(cg => cg.name)}
      debouncedOnChange={async newName => {
        const selectedColumnGroup = columnGroups
          .find(cg => cg.name === newName);
        if (selectedColumnGroup == null) throw new Error(
          `cannot find ColumnGroup with name ${newName}`
        );
        const { id, name } = selectedColumnGroup;
        debouncedOnChange({ id, name });
      }}
      className={clsx(className)}
    />
  );
};

export default ColumnGroupSelect;

