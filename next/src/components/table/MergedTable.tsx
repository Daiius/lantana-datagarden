//import clsx from 'clsx';

import { useDataList } from '@/hooks/useDataList';

import { FlowStepProps } from '@/components/table/FlowStep';
import TableGroup from '@/components/table/TableGroup';

type MergedTableProps = 
  FlowStepProps & {
    className?: string;
  };

const MergedTable = ({
  flowStep,
  projectId,
  iflowStep,
  followingColumnGroups,
  updateLine,
}: MergedTableProps) => {
  const mergedTableGroupName = 
    flowStep.columnGroups.map(columnGroup =>
      columnGroup.name
    ).join(' & ');
  const mergedColumns = Array.from( 
    new Map(
      flowStep.columnGroups.flatMap(columnGroup =>
        columnGroup.columns
      ).map(column => [column.name, column])
    ).values()
  );
  const { dataList: mergedDataList, add } = useDataList({
    projectId, columnGroupId: flowStep.columnGroups.map(cg => cg.id)
  });

  if (mergedDataList == null) return (
    <div className='skeleton w-full h-32' />
  );

  return (
    <>
      <div className='font-bold text-lg'>
        {mergedTableGroupName}
      </div>
      <TableGroup
        istep={iflowStep}
        projectId={projectId}
        grouping={undefined}
        // TODO MergedTableのgrouping処理については要件等
        updateGrouping={async newGrouping => {/* do nothing... */}}
        columns={mergedColumns}
        dataList={mergedDataList}
        followingColumnGroups={followingColumnGroups}
        updateLine={updateLine}
        add={add}
      />
      {mergedColumns.map(column =>
        <div key={column.id}>{column.name}</div>
      )}
      {mergedDataList.map((data, idata) =>
        <div key={idata}>
          データ{idata}
          {Object.entries(data.data)
            .map(([k, v], ientry) =>
              <div key={ientry}>
                key: {k}, value: {v}
              </div>
            )
          }
        </div>
      )}
    </>
  );
};

export default MergedTable;

