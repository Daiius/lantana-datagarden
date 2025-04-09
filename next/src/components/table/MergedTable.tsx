import clsx from 'clsx';

//import { ColumnGroupWithData } from '@/types';

import { FlowStepProps } from '@/components/table/FlowStep';
import TableGroup from '@/components/table/TableGroup';

type MergedTableProps = 
  FlowStepProps & {
    className?: string;
  };

const MergedTable = ({
  flowStep,
  iflowStep,
}: FlowStepProps) => {
  const mergedTableGroupName = 
    flowStep.columnGroups.map(columnGroup =>
      columnGroup.name
    ).join(' & ');
  const mergedColumns = Array.from( 
    new Map(
      flowStep.columnGroups.flatMap(columnGroup =>
        columnGroup.columns
      ).map(column => [column.id, column])
    ).values()
  );
  //const mergedColumnGroup: ColumnGroupWithData
  return (
    <>
      <div className='font-bold text-lg'>
        {mergedTableGroupName}
      </div>
      {/*
      <TableGroup
        istep={iflowStep}
        columnGroup={}
      />
      */}
      {mergedTableGroupName}
    </>
  );
};

export default MergedTable;

