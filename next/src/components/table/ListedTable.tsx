//import clsx from 'clsx';

import { 
  ColumnGroup,
  ColumnGroupWithGrouping,
} from '@/types';

import { useColumns } from '@/hooks/useColumns';
import { useDataList } from '@/hooks/useDataList';

import TableGroup from '@/components/table/TableGroup';
import { FlowStepProps } from '@/components/table/FlowStep';


type ListedTablePrivateProps = {
  projectId: string;
  columnGroup: ColumnGroup;
  iflowStep: number;
  columnGroupWithGrouping: ColumnGroupWithGrouping;
  followingColumnGroups: ColumnGroup[];
  updateColumnGroupWithGrouping: (newColumnGroupWithGrouping: ColumnGroupWithGrouping) => Promise<void>;
  updateLine: () => Promise<void>;

  className?: string;
};

const ListedTablePrivate = ({
  projectId,
  columnGroup,
  iflowStep,
  columnGroupWithGrouping,
  followingColumnGroups,
  updateColumnGroupWithGrouping,
  updateLine,
  className,
}: ListedTablePrivateProps) => {

  const { id: columnGroupId } = columnGroup;
  const { columns } = useColumns({ projectId, columnGroupId });
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
        grouping={columnGroupWithGrouping.grouping}
        columns={columns}
        dataList={dataList}
        add={add}
        updateGrouping={ async newGrouping => 
          await updateColumnGroupWithGrouping({ 
            ...columnGroupWithGrouping, grouping: newGrouping
          })
        }
        followingColumnGroups={followingColumnGroups}
        updateLine={updateLine}
      />
    </>
  );
};

type ListedTableProps = 
  FlowStepProps & {
    className?: string;
  };

const ListedTable = ({
  projectId,
  flowStep,
  iflowStep,
  updateFlowStep,
  followingColumnGroups,
  updateLine,
  className,
}: ListedTableProps) => {
  return (
    <>
      {flowStep.columnGroups.map((columnGroup, icolumnGroup) =>
        <ListedTablePrivate
          className={className}
          key={`${columnGroup.id}-${icolumnGroup}`}
          columnGroup={columnGroup}
          projectId={projectId}
          iflowStep={iflowStep}
          updateColumnGroupWithGrouping={async newColumnGroupWithGrouping =>
            await updateFlowStep({
              ...flowStep,
              columnGroupWithGroupings:
                flowStep.columnGroupWithGroupings.map((cg, icg) =>
                  icg === icolumnGroup
                  ? newColumnGroupWithGrouping
                  : cg
                )
            })
          }
          followingColumnGroups={followingColumnGroups}
          columnGroupWithGrouping={
            flowStep.columnGroupWithGroupings[icolumnGroup]!
          }
          updateLine={updateLine}
        />
      )}
    </>
  );
};

export default ListedTable;

