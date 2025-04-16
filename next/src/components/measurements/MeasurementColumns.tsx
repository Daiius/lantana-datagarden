import clsx from 'clsx';

import type { 
  MeasurementColumn as MeasurementColumnType 
} from '@/types';

import {
  useMeasurementColumns
} from '@/hooks/useMeasurementColumns';

import Button from '@/components/common/Button';
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

  const { data: columns, add, } = useMeasurementColumns({
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
      <Button
        className='btn btn-soft btn-accent'
        onClick={async () => {
          await add({
            name: '新しい測定列',
            projectId,
            columnGroupId,
            isOptional: false,
            type: 'string',
            sort: null,
          })
        }}
      >
        + 測定列の追加
      </Button>
    </>
  );
};

export default MeasurementColumns;

