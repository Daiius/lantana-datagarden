'use client' // for hooks

import type {
  ColumnGroup,
  FlowStepColumnGroup,
} from '@/types';

import TableGroup from '@/components/table/TableGroup';

import { useData } from '@/hooks/useData';

import { useColumns } from '@/hooks/useColumns';

type ListedTableProps = {
  projectId: string;
  columnGroup: ColumnGroup;
  flowStepColumnGroup: FlowStepColumnGroup;
  update: (newFlowStepColumnGroup: FlowStepColumnGroup) => Promise<void>;

  className?: string;
};

export const ListedTable = ({
  projectId,
  columnGroup,
  flowStepColumnGroup,
  update,
  className,
}: ListedTableProps) => {

  const { id: columnGroupId } = columnGroup;
  const { data: columns } = useColumns({ projectId, columnGroupId });
  const {
    data,
    add,
    update: updateData,
    remove: removeData,
  } = useData({ projectId, columnGroupId });

  if (columns == null || data == null) return (
    <div className='skeleteon w-full h-32' />
  );

  return (
    <>
      {/* columnGroup名の表示 */}
      <div className='font-bold text-lg'>
        {columnGroup.name}
      </div>
      <TableGroup
        className={className}
        projectId={projectId}
        grouping={flowStepColumnGroup.grouping}
        columns={columns}
        dataList={data}
        add={add}
        update={updateData}
        remove={removeData}
        updateGrouping={ async newGrouping => await update({ 
          ...flowStepColumnGroup, grouping: newGrouping
        })}
        isMerged={false}
      />
    </>
  );
};
