import React from 'react';
import clsx from 'clsx';

import { Select } from '@/components/common/Select';

import { useColumnGroups } from '@/hooks/useColumnGroups';

type ColumnGroupSelectProps = {
  projectId: string;
  value: number;
  onChange: (newId: number) => void;

  className?: string;
}

const ColumnGroupSelect = ({
  projectId,
  value,
  onChange,
  className,
}: ColumnGroupSelectProps) => {

  const {
    data: columnGroups
  } = useColumnGroups({
    projectId
  });

  return (
    <Select
      className={clsx(className)}
      value={value}
      onChange={newValue => newValue && onChange(newValue as number)}
    >
      {columnGroups.map(columnGroup =>
        <option 
          key={columnGroup.id}
          value={columnGroup.id}
        >
          {columnGroup.name}
        </option>
      )}
    </Select>
  );
};

export default ColumnGroupSelect;

