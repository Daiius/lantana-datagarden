import React from 'react';
import clsx from 'clsx';

import {
  IconArrowRight,
  IconTrash,
} from '@tabler/icons-react';
import type {
  ColumnGroup,
  Grouping,
  FlowStep,
} from '@/types';
import ColumnGroupSelect from '@/components/column/ColumnGroupSelect';
import Button from '@/components/common/Button';
import {
  useColumnGroups
} from '@/hooks/useColumnGroups';

type UpdateFlowStepArgs = {
  istep: number;
  newFlowStep: FlowStep;
}

type FlowStepProps = {
  istep: number;
  projectId: string;
  flowStep: FlowStep & { columnGroups: ColumnGroup[] };
  updateStep: (args: UpdateFlowStepArgs) => void;
  deleteStep: ({ istep }: { istep: number }) => void;
  deletable?: boolean;

  className?: string;
}

const FlowStep = ({
  istep,
  projectId,
  flowStep,
  updateStep,
  deleteStep,
  deletable = true,
  className,
}: FlowStepProps) => {

  const {
    columnGroups: allColumnGroups,
  } = useColumnGroups({
    projectId
  });

  const handleUpdateFlowStep = async ({
    newColumnGroup, icolumnGroup,
  }: {
    newColumnGroup: { id: number; name: string };
    icolumnGroup: number;
  }) => {
    const newFlowStep = {
      ...flowStep,
      columnGroupWithGroupings:
        flowStep.columnGroupWithGroupings.map((cg,icg) => 
          icg === icolumnGroup
          ? { ...cg, id: newColumnGroup.id }
          : cg
        )
    };
    updateStep({ istep, newFlowStep });
  };
  
  const handleAddColumnGroup = async () => {
    const defaultColumnGroupId = allColumnGroups?.[0]?.id ?? 0;
    const newFlowStep = {
      ...flowStep,
      columnGroupWithGroupings: [ 
        ...flowStep.columnGroupWithGroupings,
        { 
          id: defaultColumnGroupId, 
          grouping: { type: 'parent' } as Grouping 
        },
      ],
    };

    updateStep({ istep, newFlowStep });
  };
  
  const handleDeleteFlowColumnGroup = async ({
    icolumnGroup,
  }: { icolumnGroup: number }) => {
    const newFlowStep = {
      ...flowStep,
      columnGroupWithGroupings:
        flowStep.columnGroupWithGroupings.filter((_, icolumnGroup_) =>
          icolumnGroup !== icolumnGroup_
        ),
    };
    updateStep({ istep, newFlowStep });
  };

  return (
    //{/* flowの横に矢印を表示する横向きのコンテナ */}
    <div 
      className={clsx(
        'flex flex-row items-center',
        className
      )}
    >
      {/* flowの要素に含まれるcolumnGroupを縦に並べて表示する部分*/}
      <div  className='flex flex-col gap-2'>
        {flowStep.columnGroups.map((columnGroup, icolumnGroup) =>
          <div 
            key={icolumnGroup} 
            className='flex flex-row'
          >
            <ColumnGroupSelect
              projectId={projectId}
              className='flex flex-row w-fit'
              debouncedOnChange={async newValue => {
                console.log('newValue: ', newValue);
                await handleUpdateFlowStep({
                  newColumnGroup: newValue,
                  icolumnGroup,
                });
              }}
              value={columnGroup.name}
            />
            {flowStep.columnGroupWithGroupings.length > 1 &&
              <Button 
                className='text-error'
                onClick={async () => 
                  await handleDeleteFlowColumnGroup({ 
                    icolumnGroup,
                  })
                }
              >
                <IconTrash />
              </Button>
            }
          </div>
        )}
        {flowStep.columnGroups.length === 0 &&
          <div>カテゴリを追加して下さい...</div>
        }
        {/* MEMO padding と margin がdividerに設定されている*/}
        <div className='divider my-0'/>
        <fieldset className='flex flex-row gap-4 justify-evenly'>
          {['list', 'merge'].map(mode =>
            <React.Fragment key={mode}>
              <label 
                className='fieldset-label' 
              >
                <input 
                  type='radio' 
                  name={`flowstep-mode-radio-${istep}`}
                  onChange={() => {
                    updateStep({
                      newFlowStep: { 
                        ...flowStep, 
                        mode: mode as FlowStep['mode']
                      },
                      istep,
                    });
                  }}
                  checked={mode === flowStep.mode}
                />
                {mode}
              </label> 
            </React.Fragment>
          )}
        </fieldset>
        <div className='divider my-0'/>
        <Button 
          className='btn-success'
          onClick={async () => await handleAddColumnGroup()}
        > 
          カテゴリ追加
        </Button>
        {deletable &&
          <Button 
            className='text-error'
            onClick={() => deleteStep({ istep })}
          >
            カテゴリ削除 
            <IconTrash />
          </Button>
        }
      </div>
      <IconArrowRight />
    </div>
  );
};

export default FlowStep;

