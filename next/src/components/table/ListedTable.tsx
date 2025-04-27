'use client' // for hooks

import type {
  ColumnGroup,
  FlowStepColumnGroup,
  Grouping,
} from '@/types';

import TableGroup from '@/components/table/TableGroup';

import { useColumns } from '@/hooks/useColumns';
import { useDataList } from '@/hooks/useDataList';

type ListedTableProps = {
  projectId: string;
  columnGroup: ColumnGroup;
  iflowStep: number;
  flowStepColumnGroup: FlowStepColumnGroup;
  followingColumnGroups: ColumnGroup[];
  update: (newFlowStepColumnGroup: FlowStepColumnGroup) => Promise<void>;
  updateLine: () => Promise<void>;

  className?: string;
};

export const ListedTable = ({
  projectId,
  columnGroup,
  iflowStep,
  flowStepColumnGroup,
  followingColumnGroups,
  update,
  updateLine,
  className,
}: ListedTableProps) => {

  const { id: columnGroupId } = columnGroup;
  const { data: columns } = useColumns({ projectId, columnGroupId });
  const { dataList, add } = useDataList({ projectId, columnGroupId });

  if (columns == null || dataList == null) return (
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
        istep={iflowStep}
        projectId={projectId}
        grouping={flowStepColumnGroup.grouping}
        columns={columns}
        dataList={dataList}
        add={add}
        updateGrouping={ async newGrouping => await update({ 
          ...flowStepColumnGroup, grouping: newGrouping
        })}
        followingColumnGroups={followingColumnGroups}
        updateLine={updateLine}
        isMerged={false}
      />
    </>
  );
};
