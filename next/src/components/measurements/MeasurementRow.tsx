'use client'

import clsx from 'clsx';

import {
  Row,
  flexRender,
} from '@tanstack/react-table';

import type {
  Measurement,
  MeasurementColumn,
} from '@/types';

export type MeasurementRowProps = {
  row: Row<Measurement>;
  columns: MeasurementColumn[];
};

const MeasurementRow = ({
  row,
}: MeasurementRowProps) => (
  <tr>
    {row.getVisibleCells().map(cell => 
      <td
        key={cell.id}
        className={clsx('border border-gray-300')}
      >
        {flexRender(
          cell.column.columnDef.cell,
          cell.getContext(),
        )}
      </td>
    )}
    <td className='border border-gray-300'>
      ...
    </td>
  </tr>
);

export default MeasurementRow;

