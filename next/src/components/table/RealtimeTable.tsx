'use client'

import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';

import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  TableMeta,
  RowData,
  flexRender,
} from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (data: Data) => void;
  }
}

import { 
  Column,
  Data,
  JsonData,
} from '@/types';

import DebouncedInput from '@/components/common/DebouncedInput';

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
    columnGroupId: string,
  }
> = ({
  projectId,
  columnGroupId,
  className,
  ...props
}) => {

  const columnHelper = createColumnHelper<Data>();

  const { data: columns } = trpc.column.list.useQuery({ 
    columnGroupId, projectId 
  });

  const tableColumns = React.useMemo(() => 
    columns?.map(c =>
      columnHelper.accessor(d => d.data[c.name], {
        id: c.name,
        cell: ({ getValue, row, column, table }): any => {
          return (
            <DebouncedInput
              value={getValue()}
              validation={c.type !== 'string' ? 'number' : undefined}
              debouncedOnChange={async newValue =>
                table.options.meta?.updateData({ 
                  ...row.original,
                  data: {
                    ...row.original.data,
                    [column.id]: newValue
                  }
                })
              }
            />
          );
        }
      }),
    ) ?? [],
    [columns]
  ); 

  const { data } = trpc.data.list.useQuery(
    { projectId, columnGroupId }
  );
  const { mutateAsync } = trpc.data.update.useMutation();

  const tableData = data ?? []; 

  const table = useReactTable<Data>({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: async (newData) => {
        console.log('newData %o', newData);
        await mutateAsync(newData);
      },
    }
  });

  return (
    //<div
    //  className={clsx(
    //    'border border-gray-400 overflow-hidden rounded-lg',
    //    'w-full',
    //  )}
    //>
    <table
      className={clsx(
        'table border-collapse w-full',
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
                  'border border-gray-300 bg-gray-500/20',
                  'min-w-32 w-32',
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
    //</div>
  );
};

export default RealtimeTable;

