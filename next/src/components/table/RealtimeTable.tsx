'use client'

import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';

import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  Table as TanstackTable,
  Column as TanstackColumn,
  Row as TanstackRow,
} from '@tanstack/react-table';


import { 
  Column,
  Data,
  //JsonData,
} from '@/types';

import DebouncedInput from '@/components/common/DebouncedInput';
import Button from '@/components/common/Button';


const RealtimeTableCell: React.FC<
  React.ComponentProps<'input'>
  & {
    column: Column;
    tanstackColumn: TanstackColumn<Data>;
    row: TanstackRow<Data>;
    table: TanstackTable<Data>;
  }
> = ({
  row,
  column,
  tanstackColumn,
  table,
  className,
  ...props
}) => {
  const { id, projectId, columnGroupId } = row.original;
  const { data } = trpc.data.get.useQuery(
    { id, projectId, columnGroupId },
    { enabled: false, initialData: row.original }
  );
  const utils = trpc.useUtils();
  trpc.data.onUpdate.useSubscription(
    { id, projectId, columnGroupId },
    {
      onData: data => utils.data.get.setData(
        { id, projectId, columnGroupId },
        data,
      ),
      onError: err => console.error(err),
    }
  );
  const { mutateAsync: updateData } = trpc.data.update.useMutation();
  if (data == null) return <div>loading...</div>
  return (
    <DebouncedInput
      className='input-ghost'
      value={data.data[column.name]}
      validation={column.type !== 'string' ? 'number' : undefined}
      debouncedOnChange={async newValue =>
        updateData({ 
          ...data,
          data: {
            ...data.data,
            [column.name]: newValue
          }
        })
      }
      {...props}
    />
  );
};


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

  const utils = trpc.useUtils();
  const columnHelper = createColumnHelper<Data>();

  const { data: columns } = trpc.column.list.useQuery({ 
    columnGroupId, projectId 
  });
  trpc.column.onUpdateList.useSubscription(
    { columnGroupId, projectId },
    {
      onData: data => utils.column.list.setData(
        { columnGroupId, projectId },
        data,
      ),
      onError: err => console.error(err),
    }
  );

  const tableColumns = React.useMemo(() => 
    columns?.map(c =>
      columnHelper.accessor(d => d.data[c.name], {
        id: c.id,
        header: () => c.name,
        cell: ({ row, column, table }) =>
          <RealtimeTableCell
            column={c}
            tanstackColumn={column}
            row={row}
            table={table}
          />
      }),
    ) ?? [],
    [columns]
  ); 

  const { data } = trpc.data.list.useQuery(
    { projectId, columnGroupId }
  );
  const { mutateAsync: addData } = trpc.data.add.useMutation();
  const { mutateAsync: removeData } = trpc.data.remove.useMutation();
  trpc.data.onUpdateList.useSubscription(
    { projectId, columnGroupId },
    {
      onData: data => {
        utils.data.list.setData(
          { projectId, columnGroupId },
          data.newList,
        );
        console.log('data, onData: %o', data);
      },
      onError: err => console.error(err),
    }
  );

  const tableData = data ?? []; 

  const table = useReactTable<Data>({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  console.log('RealtimeTable rendered @ ', new Date);

  return (
    //<div
    //  className={clsx(
    //    'border border-gray-400 rounded-lg overflow-hidden',
    //    'w-full',
    //  )}
    //>
    <>
      <table
        className={clsx(
          'border-collapse w-full',
          'table table-sm table-zebra',
          className,
        )}
        {...props}
      >
        <thead>
          {table.getHeaderGroups().map(headerGroup =>
            <tr 
              key={headerGroup.id}
              //className='sticky top-0'
            >
              {headerGroup.headers.map(header =>
                <th 
                  key={header.id}
                  className={clsx(
                    'border border-gray-300 bg-gray-500',
                    'min-w-32 w-32',
                    'text-center',
                    //'sticky left-0',
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
              <td className='border border-gray-300' >
                {/* 削除ボタン */}
                <Button
                  onClick={async () => await removeData({ 
                    ...row.original
                  })}
                >
                  <svg  
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M4 7l16 0" />
                    <path d="M10 11l0 6" />
                    <path d="M14 11l0 6" />
                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                  </svg>
                </Button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Button 
        className='btn-success btn-block'
        onClick={async () => await addData({
          projectId, columnGroupId,
          parentId: null,
          data: {}
        })}
      >
        データ追加
      </Button>
    </>
    //</div>
  );
};

export default RealtimeTable;

