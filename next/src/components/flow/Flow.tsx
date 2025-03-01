import React from 'react';
import clsx from 'clsx';

import type { FlowColumnGroups } from '@/types';

import { useRealtimeFlow } from '@/hooks/useRealtimeFlow';
import { useRealtimeColumnGroups } from '@/hooks/useRealtimeColumnGroups';

import DebouncedInput from '@/components/common/DebouncedInput';
import Button from '@/components/common/Button';

import FlowStep from '@/components/flow/FlowStep';

const Flow: React.FC<
  React.ComponentProps<'div'>
  & {
    initialFlow: FlowColumnGroups;
  }
> = ({
  initialFlow,
  className,
  ...props
}) => {
  
  const {
    flow,
    updateFlow
  } = useRealtimeFlow({ initialFlow });
  const {
    columnGroups
  } = useRealtimeColumnGroups({ projectId: initialFlow.projectId });

  const handleAddFlowStep = async () => {
    const defaultColumnGroupId = columnGroups?.[0]?.id ?? '';
    const newColumnGroupIds = [
      ...flow.columnGroupIds,
      [defaultColumnGroupId],
    ];
    await updateFlow({ ...flow, columnGroupIds: newColumnGroupIds });
  };

  const handleUpdateStep = async ({ 
    istep,
    newColumnGroupIds,
  }: {
    istep: number;
    newColumnGroupIds: string[];
  }) => {
    console.log('handleUpdateStep: %o', newColumnGroupIds);
    // TODO 要名前の検討
    const newColumnGroupIds_ =
      flow.columnGroupIds.map((group, igroup) =>
        istep === igroup
        ? newColumnGroupIds
        : group
      );
    await updateFlow({ 
      ...flow, columnGroupIds: newColumnGroupIds_ 
    });
  };

  const handleDeleteStep = async ({
    istep
  }: { istep: number }) => {
    const newColumnGroupIds =
      flow.columnGroupIds.filter((_, igroup) =>
        istep !== igroup
      );
    await updateFlow({
      ...flow, columnGroupIds: newColumnGroupIds
    });
  };

  if (flow == null) return (
    <div className='skeleton h-16 w-full'/>
  );

  return (
    <div className={clsx(className)} {...props}>
      <fieldset className='fieldset'>
        <label className='label'>
          フロー名：
        </label>
        <DebouncedInput
          value={flow.name}
          debouncedOnChange={async newValue => {
            await updateFlow({
              ...flow,
              name: newValue as string,
            })
          }}
        />
      </fieldset>
      <label className='label'>
        フローに含まれるカテゴリ：
      </label>
      {/* flowの順に横に並べる部分 */}
      <div 
        className={clsx(
          'flex flex-row items-center overflow-x-auto',
          'w-full',
        )}
      >
        {flow.columnGroups.map((group, igroup) =>
          <FlowStep
            key={igroup}
            projectId={flow.projectId}
            columnGroups={group}
            columnGroupIds={group.map(g => g.id)}
            istep={igroup}
            updateStep={handleUpdateStep}
            deleteStep={handleDeleteStep}
            deletable={flow.columnGroups.length > 1}
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

