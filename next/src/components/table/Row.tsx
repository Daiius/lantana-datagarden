import clsx from 'clsx';

import type {
  Data,
  DataIds,
  Column,
  ColumnGroup,
} from '@/types';

import {
  Row as TanstackRow,
  flexRender,
} from '@tanstack/react-table';

import RowDropdown from '@/components/table/RowDropdown';
import { followingColumnGroupsRouter } from 'server/table/followingColumnGroups';


type RowProps = {
  columns: Column[];
  row: TanstackRow<Data>;
  addData: (args: Omit<Data, 'id'>) => Promise<void>;
  removeData: (dataIds: DataIds) => Promise<void>;
  followingColumnGroups: ColumnGroup[];
}

const Row = ({
  row,
  addData,
  removeData,
  followingColumnGroups,
}: RowProps) => {

  const { id, projectId, columnGroupId } = row.original;

  return (
    <tr 
      tabIndex={0}
      id={`tr-${id}`}
      className={clsx(`tr-${id}`)}
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
          dataId={id}
          columnGroupId={columnGroupId}
          removeData={async () => await removeData(row.original)}
          addData={async params => await addData({
            ...params,
            parentId: row.original.id,
            projectId, 
            data: {},
          })}
          followingColumnGroups={followingColumnGroups}
        />
      </td>
    </tr>
  );
};

export default Row;

