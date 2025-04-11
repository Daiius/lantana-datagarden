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
  updateFlowStep,
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
        grouping={
          // 最初のcolumnGroupWithGroupingsに保存された
          // グループ化情報を、MergedTableのグループ化情報として
          // 利用します
          flowStep.columnGroupWithGroupings[0]?.grouping
        }
        // TODO MergedTableのgrouping処理については要件等
        updateGrouping={async newGrouping => {
          // MergedTableのgroupingを変更する際は、
          // (最初のcolumnGroupWithGroupingsの値のみ変更すれば
          //  事足りるかもしれませんが)
          // columnGroupWithGroupings全体のgroupingを新規の値に
          // 一括で更新します、挙動に少し注意が必要です
          await updateFlowStep({
            ...flowStep,
            columnGroupWithGroupings:
              flowStep.columnGroupWithGroupings.map(cg => ({
                ...cg, grouping: newGrouping,
              })),
          });
        }}
        columns={mergedColumns}
        dataList={mergedDataList}
        followingColumnGroups={followingColumnGroups}
        updateLine={updateLine}
        add={add}
      />
    </>
  );
};

export default MergedTable;

