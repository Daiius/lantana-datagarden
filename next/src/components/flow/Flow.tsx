import React from 'react';
import clsx from 'clsx';

import type { FlowColumnGroups } from '@/types';

import { useRealtimeFlow } from '@/hooks/useRealtimeFlow';
import { useRealtimeColumnGroups } from '@/hooks/useRealtimeColumnGroups';

import { IconTrash } from '@tabler/icons-react';

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
  const { projectId, id } = initialFlow;
  
  const {
    flow,
    updateFlow,
    deleteFlow,
  } = useRealtimeFlow({ initialFlow });
  const {
    columnGroups
  } = useRealtimeColumnGroups({ projectId });

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
    <div 
      className={clsx(
        'bg-base-100 rounded-md',
        'p-4',
        className,
      )} 
      {...props}
    >
      <div className='flex flex-row'>
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
        <Button 
          className='text-error ms-auto'
          onClick={async () => { await deleteFlow({ projectId, id }); }}
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

