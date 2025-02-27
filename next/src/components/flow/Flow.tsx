import React from 'react';
import clsx from 'clsx';

import {
  IconArrowRight,
} from '@tabler/icons-react';

import type { FlowColumnGroups } from '@/types';

import { trpc } from '@/providers/TrpcProvider';

import DebouncedInput from '@/components/common/DebouncedInput';
import Button from '@/components/common/Button';

const Flow: React.FC<
  React.ComponentProps<'div'>
  & {
    initialFlow: FlowColumnGroups
  }
> = ({
  initialFlow,
  className,
  ...props
}) => {
  const { data: flow } = trpc.flow.get.useQuery(
    { id: initialFlow.id, projectId: initialFlow.projectId },
    { enabled: false, initialData: initialFlow },
  );
  const { mutateAsync: updateFlow } = trpc.flow.update.useMutation();

  const combinedData = {
    ...initialFlow,
    ...flow
  };

  if (flow == null) return (
    <div className='skeleton h-16 w-full'/>
  );

  return (
    <div>
      <fieldset className='fieldset'>
        <label className='label'>
          フロー名：
        </label>
        <DebouncedInput
          value={flow.name}
          debouncedOnChange={async newValue => {
            await updateFlow({
              ...combinedData,
              name: newValue as string,
            })
          }}
        />
      </fieldset>
      {/* flowの順に横に並べる部分 */}
      <div className='flex flex-row'>
        {combinedData.columnGroups.map((group, igroup) =>
          // flowの要素に含まれるcolumnGroupを縦に並べて表示する部分
          <div key={igroup}>
            {group.map(columnGroup =>
              <div 
                key={columnGroup.id} 
                className='flex flex-row w-fit'
              >
                {columnGroup.name}
              </div>
            )}
            <Button className='btn-success'>
              追加
            </Button>
          </div>
        )}
        <IconArrowRight />
      </div>
    </div>
  );
};

export default Flow;

