import clsx from 'clsx';

import TableGroup from '@/components/table/TableGroup';
import { FlowStepProps } from '@/components/table/FlowStep';


type ListedTableProps = 
  FlowStepProps & {
    className?: string;
  };

const ListedTable = ({
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
        <div key={`${columnGroup.id}-${icolumnGroup}`}>
          {/* columnGroup名の表示 */}
          <div className='font-bold text-lg'>
            {columnGroup.name}
          </div>
          <TableGroup
            istep={iflowStep}
            columnGroup={columnGroup}
            grouping={
              flowStep
                .columnGroupWithGroupings[icolumnGroup]
                ?.grouping
            }
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
        </div>
      )}
    </>
  );
};

export default ListedTable;

