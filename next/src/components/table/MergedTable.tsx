//import clsx from 'clsx';

import { useDataList } from '@/hooks/useDataList';
import { useColumnGroups } from '@/hooks/useColumnGroups';
import { useFlowStepColumnGroups } from '@/hooks/useFlowStepColumnGroups';

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
  //update,
  updateLine,
}: MergedTableProps) => {

  const {
    data: flowStepColumnGroups,
    update,
  } = useFlowStepColumnGroups(flowStep);

  const {
    data: columnGroups
  } = useColumnGroups({ projectId });

  const relatedColumnGroups = flowStepColumnGroups.flatMap(flowStepColumnGroup =>
    columnGroups.find(cg => cg.id === flowStepColumnGroup.columnGroupId)
    ?? []
  );

  const mergedTableGroupName = relatedColumnGroups
    .map(rcg => rcg.name)
    .join(' & ');
  const mergedColumns = Array.from( 
    new Map(
      relatedColumnGroups.flatMap(columnGroup =>
        columnGroup.columns
      ).map(column => [column.name, column])
    ).values()
  );
  const { dataList: mergedDataList, add } = useDataList({
    projectId, columnGroupId: flowStep.columnGroups.map(cg => cg.id)
  });

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
          flowStepColumnGroups[0]?.grouping
        }
        // TODO MergedTableのgrouping処理については要件等
        updateGrouping={async newGrouping => {
          // MergedTableのgroupingを変更する際は、
          // (最初のcolumnGroupWithGroupingsの値のみ変更すれば
          //  事足りるかもしれませんが)
          // columnGroupWithGroupings全体のgroupingを新規の値に
          // 一括で更新します、挙動に少し注意が必要です
          
          await update({ ...flowStep, grouping: newGrouping });
        }}
        columns={mergedColumns}
        dataList={mergedDataList}
        followingColumnGroups={followingColumnGroups}
        updateLine={updateLine}
        isMerged
        add={add}
      />
    </>
  );
};

export default MergedTable;

