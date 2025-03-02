import React from 'react';
import clsx from 'clsx';

import {
  IconArrowRight,
  IconTrash,
} from '@tabler/icons-react';
import type {
  ColumnGroup
} from '@/types';
import ColumnGroupSelect from '@/components/column/ColumnGroupSelect';
import Button from '@/components/common/Button';
import {
  useRealtimeColumnGroups
} from '@/hooks/useRealtimeColumnGroups';

const FlowStep: React.FC<
  React.ComponentProps<'div'>
  & {
    istep: number;
    projectId: string;
    columnGroups: ColumnGroup[];
    columnGroupIds: string[];
    updateStep: ({
      istep, 
      newColumnGroupIds,
    }: {
      istep: number;
      newColumnGroupIds: string[];
    }) => void;
    deleteStep: ({ istep }: { istep: number }) => void;
    deletable?: boolean;
  }
> = ({
  istep,
  projectId,
  // TODO 一覧なのか、columnGroupIdsに対応するモノなのか
  // あいまいになりがちで、バグを生じている
  columnGroups,
  columnGroupIds,
  updateStep,
  deleteStep,
  deletable = true,
  className,
  ...props
}) => {

  const {
    columnGroups: allColumnGroups,
  } = useRealtimeColumnGroups({
    projectId
  });

  const handleUpdateFlowColumnGroup = async ({
    newColumnGroup, icolumnGroup,
  }: {
    newColumnGroup: { id: string; name: string };
    icolumnGroup: number;
  }) => {
    const newColumnGroupIds = 
        columnGroupIds.map((cgid,icgid) => 
          icgid === icolumnGroup
          ? newColumnGroup.id
          : cgid
      );
    updateStep({ istep, newColumnGroupIds });
  };
  
  const handleAddFlowColumnGroup = async () => {
    const defaultColumnGroupId = allColumnGroups?.[0]?.id ?? '';
    const newColumnGroupIds = 
      [...columnGroupIds, defaultColumnGroupId];

    updateStep({ istep, newColumnGroupIds });
  };
  
  const handleDeleteFlowColumnGroup = async ({
    icolumnGroup,
  }: { icolumnGroup: number }) => {
    const newColumnGroupIds =
      columnGroupIds.filter((_, icolumnGroup_) =>
        icolumnGroup !== icolumnGroup_
      );
    updateStep({ istep, newColumnGroupIds });
  };

  return (
    //{/* flowの横に矢印を表示する横向きのコンテナ */}
    <div 
      className={clsx(
        'flex flex-row items-center',
        className
      )}
      {...props}
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
            {columnGroupIds.length > 1 &&
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

