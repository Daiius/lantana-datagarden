'use client' // for hooks

import { useFlowSteps } from '@/hooks/useFlowSteps';
import { useFollowingColumnGroups } from '@/hooks/useFollowingColumnGroups';
import FlowStep from '@/components/table/FlowStep';
import Skeleton from '../common/Skeleton';

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
    isLoading: isLoadingFlowSteps,
    update,
  } = useFlowSteps({ projectId, flowId });

  const {
    data: followingColumnGroups,
    isLoading: isLoadingFollowingColumnGroups,
  } = useFollowingColumnGroups({ projectId, flowId });

  if (isLoadingFlowSteps|| isLoadingFollowingColumnGroups) {
    return <Skeleton />
  }

  return (
    <>
      {/* flowのstep毎に横向きに表示する部分 */}
      {flowSteps.map((flowStep, iflowStep) =>
        <div key={flowStep.id} className='flex flex-col gap-8'>
          {/* 同じstepに属するcolumnGroupを縦に重ねて表示する部分 */}
          <FlowStep
            flowStep={flowStep}
            projectId={projectId}
            update={update}
            followingColumnGroups={
              followingColumnGroups
                .filter((_, ifcg) => ifcg > iflowStep)
                .flat()
            }
          />
        </div>
      )}
    </>
  );
};

