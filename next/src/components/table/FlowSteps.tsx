'use client' // for hooks

import { useFlowSteps } from '@/hooks/useFlowSteps';
import FlowStep from '@/components/table/FlowStep';

export type FlowStepsProps = {
  projectId: string;
  flowId: number;
}

export const FlowSteps = ({
  projectId,
  flowId,
}: FlowStepsProps) => {
  const {
    data: flowSteps,
    isLoading,
    update,
  } = useFlowSteps({ projectId, flowId });

  return (
    <>
      {/* flowのstep毎に横向きに表示する部分 */}
      {flowSteps.map(flowStep =>
        <div key={flowStep.id} className='flex flex-col gap-8'>
          {/* 同じstepに属するcolumnGroupを縦に重ねて表示する部分 */}
          <FlowStep
            flowStep={flowStep}
            projectId={projectId}
            update={update}
            followingColumnGroups={calcFollowingColumnGroups({
              flowWithData,
              iflowStep,
            })}
            updateLine={updateLine}
          />
        </div>
      )}
    </>
  );
};

