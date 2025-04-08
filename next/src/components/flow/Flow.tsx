import React from 'react';
import clsx from 'clsx';

import { useFlow, NestedFlow } from '@/hooks/useFlow';
import { useColumnGroups } from '@/hooks/useColumnGroups';

import { IconTrash } from '@tabler/icons-react';

import DebouncedInput from '@/components/common/DebouncedInput';
import Button from '@/components/common/Button';

import FlowStep from '@/components/flow/FlowStep';
import type { 
  Grouping,
  Flow,
} from '@/types';


type FlowProps = {
  initialFlow: NestedFlow;
  
  className?: string;
}

const Flow = ({
  initialFlow,
  className,
}: FlowProps) => {
  const { projectId, id } = initialFlow;
  
  const {
    flow,
    update,
    remove,
  } = useFlow({ 
    projectId: initialFlow.projectId,
    id: initialFlow.id,
    initialFlow, 
  });
  const {
    columnGroups
  } = useColumnGroups({ projectId });

  const handleAddFlowStep = async () => {
    if (flow == null) return;
    const defaultColumnGroupId = columnGroups?.[0]?.id ?? 0;
    const newFlowSteps = [
      ...flow.flowSteps,
      {
        columnGroupWithGroupings: [
          { 
            id: defaultColumnGroupId, 
            grouping: { type: 'parent' } as Grouping, 
          }
        ],
        mode: 'list' as const,
      },
    ];
    await update({ ...flow, flowSteps: newFlowSteps });
  };

  const handleUpdateFlowSteps = async ({ 
    istep,
    newFlowStep,
  }: {
    istep: number;
    newFlowStep: FlowStep;
  }) => {
    if (flow == null) return;
    const newFlowSteps =
      flow.flowSteps.map((flowStep, iflowStep) =>
        istep === iflowStep
        ? newFlowStep
        : flowStep
      );
    await update({ ...flow, flowSteps: newFlowSteps });
  };

  const handleDeleteStep = async ({
    istep
  }: { istep: number }) => {
    if (flow == null) return;
    const newFlowSteps =
      flow.flowSteps.filter((_, iflowStep) =>
        istep !== iflowStep
      );
    await update({ ...flow, flowSteps: newFlowSteps });
  };

  if (flow == null) return (
    <div className='skeleton h-16 w-full'/>
  );

  return (
    <div 
      className={clsx(
        'bg-base-100 rounded-md',
        'p-4',
        className,
      )} 
    >
      <div className='flex flex-row'>
        <fieldset className='fieldset'>
          <label className='label'>
            フロー名：
          </label>
          <DebouncedInput
            value={flow.name}
            debouncedOnChange={async newValue => {
              await update({
                ...flow,
                name: newValue as string,
              })
            }}
          />
        </fieldset>
        <Button 
          className='text-error ms-auto'
          onClick={async () => { await remove({ projectId, id }); }}
        >
          <IconTrash />
        </Button>
      </div>
      <label className='label'>
        フローに含まれるカテゴリ：
      </label>
      {/* flowの順に横に並べる部分 */}
      <div 
        className={clsx(
          'flex flex-row items-center overflow-x-auto',
          'w-full',
          'p-4 bg-base-300'
        )}
      >
        {flow.flowSteps.map((flowStep, iflowStep) =>
          <FlowStep
            key={iflowStep}
            projectId={flow.projectId}
            istep={iflowStep}
            flowStep={flowStep}
            updateStep={handleUpdateFlowSteps}
            deleteStep={handleDeleteStep}
            deletable={flow.flowSteps.length > 1}
          />
        )}
        <Button 
          className='btn-success'
          onClick={async () => await handleAddFlowStep()}
        >
          ステップ追加
        </Button>
      </div>
    </div>
  );
};

export default Flow;

