import React from 'react';
import clsx from 'clsx';

import { 
  Header,
  RowData, 
  flexRender,
} from '@tanstack/react-table';

type TableHeaderProps<TData extends RowData, TValue> = {
  header: Header<TData, TValue>
};

const TableHeader = <TData extends RowData, TValue>({
    header,
}: TableHeaderProps<TData, TValue>) => {
  return (
    <th 
      className={clsx(
        'border border-gray-300 bg-gray-500',
        'min-w-32 w-32',
        'text-center',
        //'sticky left-0',
      )}
      onClick={
        header.column.getToggleSortingHandler()
      }
    >
      <div className='flex flex-row'>
      {header.isPlaceholder
        ? null
        : flexRender(
            header.column.columnDef.header,
            header.getContext()
          )
      }
      {   header.column.getIsSorted() === 'asc'
        ? <div>↑</div>
        : header.column.getIsSorted() === 'desc'
        ? <div>↓</div>
        : <div></div>
      }
      </div>
    </th>
  );
};

export default  TableHeader;

