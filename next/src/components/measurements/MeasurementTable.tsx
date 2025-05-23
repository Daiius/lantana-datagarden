'use client' // for hooks

import clsx from 'clsx';


import { useMeasurements } from '@/hooks/useMeasurements';
import { useMeasurementColumns } from '@/hooks/useMeasurementColumns';

import Button from '@/components/common/Button';
import { Table } from '@/components/measurements/Table';
import Skeleton from '@/components/common/Skeleton';

export type MeasurementTableProps = {
  projectId: string;
  columnGroupId: number;
};

export const MeasurementTable = ({
  projectId,
  columnGroupId,
}: MeasurementTableProps) => {
  const { 
    data,
    update,
    add,
    remove,
  } = useMeasurements({ 
    projectId, 
    columnGroupId,
  });
  const { data: columns } = useMeasurementColumns({ 
    projectId, 
    columnGroupId,
  });

  if (!data || !columns) {
    return <Skeleton />;
  }

  return (
    <>
    <Table
      columns={columns}
      data={data}
      update={update}
    />
    <Button 
      className='btn-accent btn-block'
      onClick={async () => await add({
        projectId,
        columnGroupId,
        dataId: null,
        data: Object.fromEntries(
          columns.map(column => [column.name, null])
        )
      })}
    >
      データ追加
    </Button>
    </>
  );
};

