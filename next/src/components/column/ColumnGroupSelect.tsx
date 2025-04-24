import React from 'react';
import clsx from 'clsx';

import DebouncedSelect from '@/components/common/DebouncedSelect';

import { useColumnGroups } from '@/hooks/useColumnGroups';

type ColumnGroupSelectProps =
  Omit<
    React.ComponentProps<typeof DebouncedSelect>,
    'options' | 'debouncedOnChange'
  > & {
    projectId: string;
    debouncedOnChange: (newValue: { id: number; name: string }) => Promise<void>;
};

const ColumnGroupSelect = ({
  projectId,
  className,
  debouncedOnChange,
  ...props
}: ColumnGroupSelectProps) => {
  // TODO columnsまで取得する豪華バージョンなので
  // 簡易化しても良いかも
  const {
    data: columnGroups
  } = useColumnGroups({
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

