import React from 'react';
import clsx from 'clsx';

import type { FlowColumnGroups } from '@/types';

import { useRealtimeFlow } from '@/hooks/useRealtimeFlow';

import DebouncedInput from '@/components/common/DebouncedInput';
import Button from '@/components/common/Button';
import type {
  ColumnGroup
} from '@/types';

import FlowStep from '@/components/flow/FlowStep';

const Flow: React.FC<
  React.ComponentProps<'div'>
  & {
    initialFlow: FlowColumnGroups;
    columnGroups: ColumnGroup[]; 
  }
> = ({
  initialFlow,
  columnGroups,
  className,
  ...props
}) => {
  
  const {
    flow,
    updateFlow
  } = useRealtimeFlow({ initialFlow });

  const handleAddFlowStep = async () => {
    const defaultColumnGroupId = columnGroups[0]?.id ?? '';
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
      <div className='flex flex-row items-center'>
        {flow.columnGroups.map((group, igroup) =>
          <FlowStep
            columnGroups={columnGroups}
            columnGroupIds={group.map(g => g.id)}
            istep={igroup}
            updateStep={handleUpdateStep}
            deleteStep={handleDeleteStep}
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

