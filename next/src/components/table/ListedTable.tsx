import clsx from 'clsx';

import { 
  ColumnGroup,
  Grouping,
  FlowStep,
} from '@/types';

import { useColumns } from '@/hooks/useColumns';
import { useDataList } from '@/hooks/useDataList';

import TableGroup from '@/components/table/TableGroup';
import { FlowStepProps } from '@/components/table/FlowStep';


type ListedTablePrivateProps = {
  projectId: string;
  columnGroup: ColumnGroup;
  iflowStep: number;
  grouping: Grouping;
  followingColumnGroups: ColumnGroup[];
  updateFlowStep: (newFlowStep: FlowStep) => Promise<void>;
  updateLine: () => Promise<void>;
};

const ListedTablePrivate = ({
  projectId,
  columnGroup,
  iflowStep,
  grouping,
  followingColumnGroups,
  updateFlowStep,
  updateLine,
}: ListedTablePrivateProps) => {

  const { id: columnGroupId } = columnGroup;

  const { columns } = useColumns({ projectId, columnGroupId });

  const {  dataList, add } = useDataList({ projectId, columnGroupId });

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
        istep={iflowStep}
        projectId={projectId}
        grouping={grouping}
        columns={columns}
        dataList={dataList}
        add={add}
        updateGrouping={async (newGrouping) => 
          await updateFlowStep({
            ...flowStep,
            columnGroupWithGroupings:
              flowStep.columnGroupWithGroupings.map((cg, icg) =>
                icg === icolumnGroup
                ? { ...cg, grouping: newGrouping }
                : cg
              )
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
          key={`${columnGroup.id}-${icolumnGroup}`}
          columnGroup={columnGroup}
          projectId={projectId}
          iflowStep={iflowStep}
          updateFlowStep={updateFlowStep}
          followingColumnGroups={followingColumnGroups}
          updateLine={updateLine}
        />
      )}
    </>
  );
};

export default ListedTable;

