'use client'

import React from 'react';
import clsx from 'clsx';

import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

import { 
  Column,
  Data,
  JsonDataType,
} from '@/types';

const RealtimeTable: React.FC<
  React.ComponentProps<'table'>
  & {
    columns: Column[],
    data: Data[],
  }
> = ({
  columns,
  data,
  className,
  ...props
}) => {

  const columnHelper = createColumnHelper<JsonDataType>();

  // 注意 
  // useReactTableは再描画を行うカスタムフックらしいので
  // propertyから生成するcolumnsやdataが再描画の度
  // 作り直すデータでは無限に再描画されてしまう
  const tableColumns = React.useMemo(() => 
    columns.map(c =>
      columnHelper.accessor(c.name, {
        cell: (info): any => info.getValue(),
      })
    ), 
    [columns]
  );
  const tableData = React.useMemo(() =>
    data.map(d => d.data),
    [data]
  );

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table
      className={clsx(
        'w-full',
        'table-auto border-collapse border border-gray-400',
        className,
      )}
      {...props}
    >
      <thead>
        {table.getHeaderGroups().map(headerGroup =>
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header =>
              <th 
                key={header.id}
                className={clsx(
                  'border border-gray-300 bg-gray-500/20'
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )
                }
              </th>
            )}
          </tr>
        )}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row =>
          <tr key={row.id}>
            {row.getVisibleCells().map(cell =>
              <td 
                key={cell.id}
                className={clsx(
                  'border border-gray-300',
                )}
              >
                {flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext()
                )}
              </td>
            )}
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default RealtimeTable;

