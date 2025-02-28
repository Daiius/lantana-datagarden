import React from 'react';
import clsx from 'clsx';

import {
  IconArrowRight,
} from '@tabler/icons-react';

import type { FlowColumnGroups } from '@/types';

import { useRealtimeFlow } from '@/hooks/useRealtimeFlow';

import DebouncedInput from '@/components/common/DebouncedInput';
import DebouncedSelect from '@/components/common/DebouncedSelect';
import Button from '@/components/common/Button';
import type {
  ColumnGroup
} from '@/types';

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
          // flowの要素に含まれるcolumnGroupを縦に並べて表示する部分
          <div key={igroup} className='flex flex-col gap-2'>
            {group.map((columnGroup, icolumnGroup) =>
              <DebouncedSelect
                key={columnGroup.id} 
                className='flex flex-row w-fit'
                debouncedOnChange={async newValue => {
                  console.log('debouncedOnChange: ', newValue);
                  const newColumnGroupIds = 
                    flow.columnGroupIds.map((cgids, icgids) =>
                      cgids.map((cgid,icgid) => 
                        (    icgid === icolumnGroup
                          && icgids === igroup
                        )
                        ? columnGroups
                            .find(cg => cg.name === newValue)?.id ?? ''
                        : cgid
                      )
                    );
                  await updateFlow({ 
                    ...flow, columnGroupIds: newColumnGroupIds,
                  });
                }}
                value={columnGroup.name}
                options={columnGroups.map(cg => cg.name)}
              >
              </DebouncedSelect> 
            )}
            <Button className='btn-success'>
              カテゴリ追加
            </Button>
          </div>
        )}
        <IconArrowRight />
        <Button className='btn-success'>
          ステップ追加
        </Button>
      </div>
    </div>
  );
};

export default Flow;

