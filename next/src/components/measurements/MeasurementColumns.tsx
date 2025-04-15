import clsx from 'clsx';

import type { 
  MeasurementColumn as MeasurementColumnType 
} from '@/types';

import {
  useMeasurementColumns
} from '@/hooks/useMeasurementColumns';

import MeasurementColumn from '@/components/measurements/MeasurementColumn';

type MeasurementColumnsProps<
  T extends MeasurementColumnType
> = {
  projectId: string;
  columnGroupId: number;
  initialValue: T[];
};

const MeasurementColumns = <
  T extends MeasurementColumnType
>({
  projectId,
  columnGroupId,
  initialValue,
}: MeasurementColumnsProps<T>) => {
  const { data: columns } = useMeasurementColumns({
    projectId,
    columnGroupId,
    initialData: initialValue
  });

  return (
    <>
      {columns.map(column => 
        <MeasurementColumn
          key={column.id}
          initialValue={column}
        />
      )}
    </>
  );
};

export default MeasurementColumns;

