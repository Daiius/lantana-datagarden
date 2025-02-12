'use client'

import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';

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

/**
 * ユーザの変更を部分的にリアルタイム反映するテーブル
 *
 * 個別のデータについては数が多くなると思われるので、
 * 更新があったことの通知のみとする
 */
const RealtimeTable: React.FC<
  React.ComponentProps<'table'>
  & {
    projectId: string,
    categoryId: string,
  }
> = ({
  projectId,
  categoryId,
  className,
  ...props
}) => {

  const columnHelper = createColumnHelper<JsonDataType>();

  const { data: columns } = trpc.column.list.useQuery({ categoryId });

  const tableColumns = React.useMemo(() => 
    columns?.map(c =>
      columnHelper.accessor(c.name, {
        cell: (info): any => info.getValue(),
        header: (): any => `${c.name} : ${c.type}`,
      })
    ) ?? [],
    [columns]
  ); 

  const { data } = trpc.data.list.useQuery(
    { projectId, categoryId }
  );

  const tableData = React.useMemo(() =>
    data?.map(d => d.data) ?? [],
    [data]
  );

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      className={clsx(
        'border border-gray-400 overflow-hidden rounded-lg',
      )}
    >
    <table
      className={clsx(
        'w-full',
        'table-auto border-collapse ',
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
    </div>
  );
};

export default RealtimeTable;

