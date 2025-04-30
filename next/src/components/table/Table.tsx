'use client'

import React from 'react';
import clsx from 'clsx';

import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';


import type { Data, Column } from '@/types';

import Row from '@/components/table/Row';

import TableCell from '@/components/table/TableCell';
import TableHeader from '@/components/table/TableHeader';

type TableProps = {
  columns: Column[],
  data: Data[],
  addData: (args: Omit<Data, 'id'>) => Promise<void>;
  updateData: (newData: Data) => Promise<void>;
  className?: string;
}


/**
 * ユーザの変更を部分的にリアルタイム反映するテーブル
 *
 * 個別のデータについては数が多くなると思われるので、
 * 更新があったことの通知のみとする
 */
const Table = ({
  data,
  addData,
  updateData,
  columns,
  className,
}: TableProps) => {

  const columnHelper = createColumnHelper<Data>();

  const tableColumns = React.useMemo(() => 
    columns?.map(c =>
      columnHelper.accessor(d => d.data[c.name], {
        id: c.name,
        cell: ({ row, column, table }) =>
          <TableCell
            column={c}
            tanstackColumn={column}
            row={row}
            table={table}
            update={updateData}
          />
      }),
    ) ?? [],
    [columns]
  ); 
  
  const [sorting, setSortingPrivate] = React.useState<SortingState>([]);
  const setSorting: typeof setSortingPrivate = (sort) => {
    setSortingPrivate(sort);
  };


  const table = useReactTable<Data>({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <div className='w-fit'>
      <table
        className={clsx(
          'border-collapse w-full',
          'table table-sm table-zebra',
          className,
        )}
      >
        <thead>
          {table.getHeaderGroups().map(headerGroup =>
            <tr key={headerGroup.id} >
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
            <Row
              key={row.original.id}
              columns={columns}
              row={row}
              addData={addData}
            />
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

