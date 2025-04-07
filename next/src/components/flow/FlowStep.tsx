import React from 'react';
import clsx from 'clsx';

import {
  IconArrowRight,
  IconTrash,
} from '@tabler/icons-react';
import type {
  ColumnGroup,
  Grouping,
} from '@/types';
import ColumnGroupSelect from '@/components/column/ColumnGroupSelect';
import Button from '@/components/common/Button';
import {
  useColumnGroups
} from '@/hooks/useColumnGroups';

type FlowStepProps = {
  istep: number;
  projectId: string;
  columnGroups: ColumnGroup[];
  columnGroupWithGroupings: { id: number, grouping?: Grouping}[];
  updateStep: ({
    istep, 
    newColumnGroupWithGroupings,
  }: {
    istep: number;
    newColumnGroupWithGroupings: { id: number, grouping?: Grouping}[];
  }) => void;
  deleteStep: ({ istep }: { istep: number }) => void;
  deletable?: boolean;

  className?: string;
}

const FlowStep = ({
  istep,
  projectId,
  // TODO 一覧なのか、columnGroupIdsに対応するモノなのか
  // あいまいになりがちで、バグを生じている
  columnGroups,
  columnGroupWithGroupings,
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

  const handleUpdateFlowColumnGroup = async ({
    newColumnGroup, icolumnGroup,
  }: {
    newColumnGroup: { id: number; name: string };
    icolumnGroup: number;
  }) => {
    const newColumnGroupWithGroupings = 
        columnGroupWithGroupings.map((cgid,icgid) => 
          icgid === icolumnGroup
          ? { ...cgid, id: newColumnGroup.id }
          : cgid
      );
    updateStep({ istep, newColumnGroupWithGroupings });
  };
  
  const handleAddFlowColumnGroup = async () => {
    const defaultColumnGroupId = allColumnGroups?.[0]?.id ?? 0;
    const newColumnGroupWithGroupings = [
      ...columnGroupWithGroupings, 
      { id: defaultColumnGroupId, grouping: { type: 'parent' } as Grouping },
    ];

    updateStep({ istep, newColumnGroupWithGroupings });
  };
  
  const handleDeleteFlowColumnGroup = async ({
    icolumnGroup,
  }: { icolumnGroup: number }) => {
    const newColumnGroupWithGroupings =
      columnGroupWithGroupings.filter((_, icolumnGroup_) =>
        icolumnGroup !== icolumnGroup_
      );
    updateStep({ istep, newColumnGroupWithGroupings });
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
        {columnGroups.map((columnGroup, icolumnGroup) =>
          <div 
            key={icolumnGroup} 
            className='flex flex-row'
          >
            <ColumnGroupSelect
              projectId={projectId}
              className='flex flex-row w-fit'
              debouncedOnChange={async newValue => {
                console.log('newValue: ', newValue);
                await handleUpdateFlowColumnGroup({
                  newColumnGroup: newValue,
                  icolumnGroup,
                });
              }}
              value={columnGroup.name}
            />
            {columnGroupWithGroupings.length > 1 &&
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
        {columnGroups.length === 0 &&
          <div>カテゴリを追加して下さい...</div>
        }
        {/* MEMO padding と margin がdividerに設定されている*/}
        <div className='divider my-0'/>
        <Button 
          className='btn-success'
          onClick={async () => await handleAddFlowColumnGroup()}
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

