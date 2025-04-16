import clsx from 'clsx';

import type {
  Data,
  Column,
  ColumnGroup,
} from '@/types';

import {
  Row as TanstackRow,
  flexRender,
} from '@tanstack/react-table';

import RowDropdown from '@/components/table/RowDropdown';
import { useData } from '@/hooks/useData';


type RowProps = {
  columns: Column[];
  row: TanstackRow<Data>;
  followingColumnGroups: ColumnGroup[];
  addData: (args: Omit<Data, 'id'>) => Promise<void>;
}

const Row = ({
  row,
  followingColumnGroups,
  addData,
}: RowProps) => {

  const { id, projectId, columnGroupId } = row.original;
  const {
    data,
    remove,
  } = useData({ 
    id, projectId, columnGroupId,
    initialData: row.original 
  });

  if (data == null) return (
    <div className='skeleton h-4 w-32'/>
  );

  return (
    <tr 
      tabIndex={0}
      id={`tr-${data.id}`}
      className={clsx(`tr-${data.id}`)}
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
        <RowDropdown
          projectId={projectId}
          dataId={row.original.id}
          columnGroupId={row.original.columnGroupId}
          followingColumnGroups={followingColumnGroups}
          removeData={async () => await remove({
            id: row.original.id, projectId, columnGroupId,
          })}
          addData={async params => await addData({
            ...params,
            parentId: row.original.id,
            projectId, 
            data: {},
          })}
        />
      </td>
    </tr>
  );
};

export default Row;

