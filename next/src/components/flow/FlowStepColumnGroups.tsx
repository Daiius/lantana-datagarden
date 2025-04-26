'use client' // for hooks

import {
  useFlowStepColumnGroups
} from '@/hooks/useFlowStepColumnGroups';

import type {
  useFlowSteps
} from '@/hooks/useFlowSteps';

import {
  FlowStepColumnGroup
} from '@/components/flow/FlowStepColumnGroup';

import Button from '@/components/common/Button';

export type FlowStepColumnGroupsProps =
  & Parameters<typeof useFlowStepColumnGroups>[0]
  & { className?: string}

export const FlowStepColumnGroups = ({
  projectId,
  flowId,
  id,
  //className, 
}: FlowStepColumnGroupsProps) => {

  const {
    data: flowStepColumnGroups,
    //isLoading,
    update,
    add,
    remove,
  } = useFlowStepColumnGroups({ projectId, flowId, id});

  return (
    <>
      {flowStepColumnGroups.map(flowStepColumnGroup =>
        <FlowStepColumnGroup
          key={flowStepColumnGroup.id}
          flowStepColumnGroup={flowStepColumnGroup}
          update={update}
          remove={remove}
        />
      )}
      {flowStepColumnGroups.length === 0 &&
        <div>カテゴリを追加して下さい...</div>
      }
      <div className='divider my-0'/>
      <Button 
        className='btn-success'
        onClick={async () => await add({
          projectId,
          columnGroupId: defaultColumnGroupId,
          flowStepId: id,
          grouping: { type: 'parent' },
          sort: null,
        })}
      > 
        カテゴリ追加
      </Button>
    </>
  );
};

