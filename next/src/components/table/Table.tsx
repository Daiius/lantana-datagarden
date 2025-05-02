'use client'

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';


import type { 
  Data, 
  DataIds,
  Column,
} from '@/types';

import Row from '@/components/table/Row';

import TableCell from '@/components/table/TableCell';
import TableHeader from '@/components/table/TableHeader';

import { useLines } from '@/providers/LinesProvider';

type TableProps = {
  columns: Column[],
  data: Data[],
  addData: (args: Omit<Data, 'id'>) => Promise<void>;
  updateData: (newData: Data) => Promise<void>;
  removeData: (dataIds: DataIds) => Promise<void>;
  className?: string;
}


/**
 * ユーザの変更を部分的にリアルタイム反映するテーブル
 */
const Table = ({
  data,
  addData,
  updateData,
  removeData,
  columns,
  className,
}: TableProps) => {

  const columnHelper = createColumnHelper<Data>();

  const tableColumns = useMemo(() => 
    columns.map(c =>
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
    ),
    [columns]
  ); 
  
  const [sorting, setSortingPrivate] = useState<SortingState>([]);
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

  const { register, unregister } = useLines();
  useEffect(() => {
    const relations = data
      .filter(d => d.parentId != null)
      .map(d => ({ id: d.id, parentId: d.parentId ?? 0 }));
    register(relations);
    return () => unregister(relations);
  }, [data]);

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
              removeData={removeData}
            />
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

