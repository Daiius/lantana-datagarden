'use client'

import {
  useMemo,
} from 'react';

import clsx from 'clsx';

import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';


import type {
  MeasurementColumn,
  Measurement,
} from '@/types';

import TableHeader from '@/components/table/TableHeader';
import MeasurementTableCell from '@/components/measurements/MeasurementTableCell';
import MeasurementRow from '@/components/measurements/MeasurementRow';

export type TableProps = {
  columns: MeasurementColumn[];
  data: Measurement[];
};

export const Table = ({
  columns,
  data,
}: TableProps) => {
  const columnHelper = createColumnHelper<Measurement>();

  const tableColumns = useMemo(() => columns.map(column =>
    columnHelper.accessor(d => d.data[column.name], {
      id: column.name,
      cell: ({ row, table }) =>
        <MeasurementTableCell
          column={column}
          row={row}
          table={table}
        />
    })
  ), [columns]);

  const table = useReactTable<Measurement>({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: row => row.id.toString(),
  });

  return (
    <div className='w-fit'>
      <table
        className={clsx(
          'border-collapse w-full',
          'table table-sm table-zebra',
        )}
      >
        <thead>
          {table.getHeaderGroups().map(headerGroup =>
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header =>
                <TableHeader key={header.id} header={header} />
              )}
              <th
                className={clsx(
                  'border border-gray-300 bg-gray-500/20',
                  'text-center',
                )}
              >
                ...
              </th>
            </tr>
          )}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row =>
            <MeasurementRow
              key={row.id}
              row={row}
              columns={columns}
            />
          )}
        </tbody>
      </table>
    </div>
  );
};

