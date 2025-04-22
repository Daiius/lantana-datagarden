'use client' // for useMeasurementColumnGroups hook

import clsx from 'clsx';

import { useEffect, useState } from 'react';

import type {
  MeasurementColumnGroup
} from '@/types';

import { useMeasurementColumnGroups } from '@/hooks/useMeasurementColumnGroups';
import { Select } from '@/components/common/Select';

export type MeasurementSelectProps = {
  projectId: string;
  defaultId?: number;
  onChange?: (value: MeasurementColumnGroup) => void;
  nameFilter?: string[];
};

export const MeasurementSelect = ({
  projectId,
  onChange,
  defaultId,
  nameFilter = [],
}: MeasurementSelectProps) => {
  const { data: columnGroups } = useMeasurementColumnGroups({ projectId });
  const [selected, setSelected] = useState<MeasurementColumnGroup>();

  useEffect(() => {
    if (columnGroups) {
      setSelected(columnGroups.find(cg => cg.id == defaultId));
    }
  }, [columnGroups, defaultId])

  return (
    <Select
      value={selected?.id}
      onChange={newValue => {
        const newColumnGroup = columnGroups?.find(cg => cg.id == newValue);
        setSelected(newColumnGroup);
        if (newColumnGroup != null) {
          onChange?.(newColumnGroup);
        }
      }}
      //defaultValue={defaultId}
    >
      <option className='text-base-content/50' value={undefined}>選択...</option>
      {columnGroups?.map(columnGroup =>
        <option 
          key={columnGroup.id}
          value={columnGroup.id}
          disabled={nameFilter.includes(columnGroup.name)}
        >
          {columnGroup.name}
        </option>
      )}
    </Select>
  );
};

