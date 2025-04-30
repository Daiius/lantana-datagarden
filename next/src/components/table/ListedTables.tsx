//import clsx from 'clsx';


import { FlowStepProps } from '@/components/table/FlowStep';

import {
  useFlowStepColumnGroups
} from '@/hooks/useFlowStepColumnGroups';
import {
  useColumnGroups
} from '@/hooks/useColumnGroups';

import {
  ListedTable
} from '@/components/table/ListedTable';

export type ListedTablesProps = 
  FlowStepProps & {
    className?: string;
  };

/**
 * FlowingTableにおいて、同じFlowStepに複数のColumnGroupが指定された際、
 * これらを並べて表示します
 *
 */
export const ListedTables = ({
  projectId,
  flowStep,
  //update,
  className,
}: ListedTablesProps) => {
  const {
    data: flowStepColumnGroups,
    update,
  } = useFlowStepColumnGroups(flowStep);
  const {
    data: columnGroups
  } = useColumnGroups(flowStep);
  return (
    <>
      {flowStepColumnGroups.map(flowStepColumnGroup => {
        const columnGroup = columnGroups.find(cg => 
          cg.id === flowStepColumnGroup.columnGroupId
        );
        if (columnGroup == null) return null;
        return (
          <ListedTable
            key={flowStepColumnGroup.id}
            className={className}
            flowStepColumnGroup={flowStepColumnGroup}
            columnGroup={columnGroup}
            projectId={projectId}
            update={update}
          />
        );
      })}
    </>
  );
};

