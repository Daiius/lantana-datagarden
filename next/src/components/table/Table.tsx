'use client'

import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';

import type { ColumnGroup } from '@/types';

import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from '@tanstack/react-table';


import { Data } from '@/types';

import Button from '@/components/common/Button';

import { useColumns } from '@/hooks/useColumns';

import TableCell from '@/components/table/TableCell';
import TableHeader from '@/components/table/TableHeader';
import RowDropdown from '@/components/table/RowDropdown';

type TableProps = {
  projectId: string,
  columnGroupId: ColumnGroup['id'],
  followingColumnGroups: ColumnGroup[],
  updateLine: () => void;

  className?: string;
}


/**
 * ユーザの変更を部分的にリアルタイム反映するテーブル
 *
 * 個別のデータについては数が多くなると思われるので、
 * 更新があったことの通知のみとする
 */
const Table = ({
  projectId,
  columnGroupId,
  followingColumnGroups,
  updateLine,
  className,
}: TableProps) => {

  const utils = trpc.useUtils();
  const columnHelper = createColumnHelper<Data>();

  const { columns } = useColumns({
    projectId, columnGroupId
  });

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
          />
      }),
    ) ?? [],
    [columns]
  ); 
  
  const [sorting, setSortingPrivate] = React.useState<SortingState>([]);
  const setSorting: typeof setSortingPrivate = (sort) => {
    setSortingPrivate(sort);
    updateLine();
  };

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
        updateLine();
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
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    //<div
    //  className={clsx(
    //    'border border-gray-400 rounded-lg overflow-hidden',
    //    'w-full',
    //  )}
    //>
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
            <tr 
              key={headerGroup.id}
              //className='sticky top-0'
            >
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
            <tr 
              tabIndex={0}
              key={row.id}
              id={`tr-${row.original.id}`}
              className={clsx(`tr-${row.original.id}`)}
            >
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
                {/*
                */}
                <RowDropdown
                  projectId={projectId}
                  dataId={row.original.id}
                  columnGroupId={row.original.columnGroupId}
                  followingColumnGroups={followingColumnGroups}
                  removeData={async () => await removeData({
                    id: row.original.id, projectId, columnGroupId,
                  })}
                  addData={async params => await addData({
                    ...params,
                    parentId: row.original.id,
                    projectId, data: {},
                  })}
                />
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
    </div>
    //</div>
  );
};

export default Table;

