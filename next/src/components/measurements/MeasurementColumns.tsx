import clsx from 'clsx';


import {
  useMeasurementColumns
} from '@/hooks/useMeasurementColumns';

import Button from '@/components/common/Button';
import MeasurementColumn from '@/components/measurements/MeasurementColumn';

type MeasurementColumnsProps = {
  projectId: string;
  columnGroupId: number;
};

const MeasurementColumns = ({
  projectId,
  columnGroupId,
}: MeasurementColumnsProps) => {

  const { data: columns, add, update, remove } = useMeasurementColumns({
    projectId,
    columnGroupId,
  });

  return (
    <>
      {columns?.map(column => 
        <MeasurementColumn
          key={column.id}
          column={column}
          update={update}
          remove={remove}
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

