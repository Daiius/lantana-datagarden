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

/**
 * ユーザの変更を部分的にリアルタイム反映するテーブル
 *
 * TODO
 * 恐らくinitialCategoryを渡されるのが正解
 * なのだが、categoryにはcolumnsが含まれないため
 * どうしたものだろうか...
 *
 * カテゴリ編集画面は <Project /> 内でdb.queryで取得した
 * ネストされたデータを、直接<Category />や<Columns />に渡せた
 * 
 * <Project /> 内に直接 <Category /> や <Columns /> が書いてあり
 * データの受け渡しが簡単に出来てしまったからだが、
 * これはデータの包含関係を壊している気がする
 *
 * これはデザインが良くない気がする
 * ネストされたデータはSSR時特有の型としてどこかに定義して
 * 子コンポーネントで具体的な処理を出来る様にするべき
 *
 * 恐らく、Project, Category, ColumnDefinitions までは
 * 全取得してもそこまで痛くない...はず
 *
 *
 * 個別のデータについては数が多くなると思われるので、
 * 更新があったことの通知のみとする
 */
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
        header: (): any => `${c.name} : ${c.type}`,
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

