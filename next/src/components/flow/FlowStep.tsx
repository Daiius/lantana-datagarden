import React from 'react';
import clsx from 'clsx';

import {
  IconArrowRight,
  IconTrash,
} from '@tabler/icons-react';
import type { FlowStep } from '@/types';
import {
  FlowStepColumnGroups
} from '@/components/flow/FlowStepColumnGroups';

import type { useFlowSteps } from '@/hooks/useFlowSteps';
import Button from '@/components/common/Button';

type FlowStepProps = 
  & {
    projectId: string;
    flowStep: FlowStep;
    deletable?: boolean;
  }
  & Pick<ReturnType<typeof useFlowSteps>, 'update'|'remove'>
  & { className?: string; }

const FlowStep = ({
  projectId,
  flowStep,
  update: updateFlowStep,
  remove: removeFlowStep,
  deletable = true,
  className,
}: FlowStepProps) => (
  //{/* flowの横に矢印を表示する横向きのコンテナ */}
  <div 
    className={clsx(
      'flex flex-row items-center',
      className
    )}
  >
    {/* flowの要素に含まれるcolumnGroupを縦に並べて表示する部分*/}
    <div  className='flex flex-col gap-2'>
      <FlowStepColumnGroups 
        projectId={projectId}
        flowId={flowStep.flowId}
        id={flowStep.id}
      />
      {/* MEMO padding と margin がdividerに設定されている*/}
      <div className='divider my-0'/>
      {/* TODO コンポーネントを分割*/}
      <fieldset className='flex flex-row gap-4 justify-evenly'>
        {['list', 'merge'].map(mode =>
          <React.Fragment key={mode}>
            <label 
              className='fieldset-label' 
            >
              <input 
                type='radio' 
                name={`flowstep-mode-radio-${flowStep.id}`}
                onChange={async () => await updateFlowStep({ 
                  ...flowStep, 
                  mode: mode as FlowStep['mode'],
                })}
                checked={mode === flowStep.mode}
              />
              {mode}
            </label> 
          </React.Fragment>
        )}
      </fieldset>
      {deletable &&
        <Button 
          className='text-error'
          onClick={() => removeFlowStep(flowStep)}
        >
          カテゴリ削除 
          <IconTrash />
        </Button>
      }
    </div>
    <IconArrowRight />
  </div>
);

export default FlowStep;

