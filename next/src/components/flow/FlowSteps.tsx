'use client' // for hooks

import clsx from 'clsx';

import {
  useFlowSteps
} from '@/hooks/useFlowSteps';


import FlowStep from '@/components/flow/FlowStep';
import Button from '@/components/common/Button';

export type FlowStepsProps = 
  & {
    projectId: string;
    flowId: number;
  } & { className?: string; }

export const FlowSteps = ({
  projectId,
  flowId,
}: FlowStepsProps) => {
  const {
    data: flowSteps,
    update,
    remove,
    add,
  } = useFlowSteps({ 
    projectId,
    flowId,
  });

  return (
    <div 
      className={clsx(
        'flex flex-row items-center overflow-x-auto',
        'w-full',
        'p-4 bg-base-300'
      )}
    >
      {flowSteps.map(flowStep =>
        <FlowStep
          key={flowStep.id}
          projectId={projectId}
          flowStep={flowStep}
          update={update}
          remove={remove}
          deletable={flowSteps.length > 1}
        />
      )}
      <Button 
        className='btn-success'
        onClick={async () => await add({
          projectId,
          flowId,
          mode: 'list',
          sort: null,
        })}
      >
        ステップ追加
      </Button>
    </div>
  );
};

