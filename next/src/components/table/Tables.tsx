'use client'

import React from 'react';
import clsx from 'clsx';

import type { Flow, Grouping } from '@/types';

import { useTables } from '@/hooks/useTables';
import { useLines, Connection } from '@/hooks/useLines';

import TableGroup from '@/components/table/TableGroup';

import Line from '@/components/line/Line';

type TablesProps = {
  projectId: string;
  flowId: Flow['id'];
  className?: string;
}

const Tables = ({
  projectId,
  flowId,
  className,
}: TablesProps) => {

  const [mounted, setMounted] = React.useState<boolean>(false);
  const [connections, setConnections] = React.useState<Connection[]>([]);
  const [updateLineCount, setUpdateLineCount] = React.useState<number>(0);

  const { flowWithData, invalidate, update } = useTables({
    projectId, flowId
  });

  // TODO データの追加・削除の度に
  // データの取得し直しをしているので効率が悪い
  const updateLine = async () => {
    setUpdateLineCount(prev => prev + 1);
    await invalidate();
  }
  const allData = flowWithData
    ?.columnGroups
    .flatMap(cgs => cgs.flatMap(cg => cg.data)) ?? [];

  React.useEffect(() => {
    if (!mounted) {
      setMounted(true);
      console.log('first rendering...');
      return;
    }

    console.log('second rendering...');

    setTimeout(() => {
      const { connections } = useLines({ data: allData, });
      setConnections(connections);
      console.log('allData: ', allData);
      console.log('connections: ', connections);
    }, 1_000);

  }, [flowWithData, mounted, updateLineCount]);


  if (flowWithData == null) return (
    <div className='skeleton h-32 w-full'/>
  );

  const handleUpdateGrouping = async (
    {
      flow,
      newGrouping,
      igroup,
      icolumnGroup,
    }: {
      flow: Flow;
      newGrouping: Grouping;
      igroup: number;
      icolumnGroup: number;
    }
  ) => {
    await update({ 
      ...flow, 
      columnGroupWithGroupings:
      flowWithData
      .columnGroupWithGroupings
      .map((step, istep) =>
        istep === igroup
        ? step.map((v, iv) => 
            iv === icolumnGroup
            ? { ...v, grouping: newGrouping } 
            : v
          )
        : step
      ),
    })
  };

  const calcFollowingColumnGroups = ({
    flowWithData,
    igroup,
  }: {
    flowWithData: ReturnType<typeof useTables>['flowWithData'],
    igroup: number
  }) => Array.from(
    new Map(
      flowWithData
        ?.columnGroups
        .filter((_, ig) => ig > igroup)
        .flatMap(group => group.map(g => g))
        .map(g => [g.id, g])
    )
    .entries()
    .map(([_,v]) => v)
  );

  return (
    <div
      id='tables-container'
      className={clsx(
        'flex flex-row gap-8',
        'relative',
        className,
      )}
    >
      {/* flowのstep毎に横向きに表示する部分 */}
      {flowWithData.columnGroups?.map((group, igroup) =>
        <div key={igroup} className='flex flex-col gap-8'>
          {/* 同じstepに属するcolumnGroupを縦に重ねて表示する部分 */}
          {group.map((cg, icg) =>
            <div key={`${cg.id}-${icg}`}>
              {/* columnGroup名の表示 */}
              <div className='font-bold text-lg'>
                {cg.name}
              </div>
              <TableGroup
                columnGroup={cg}
                grouping={
                  flowWithData
                  .columnGroupWithGroupings[igroup]?.[icg]
                  ?.grouping
                }
                updateGrouping={async (newGrouping) => 
                  await handleUpdateGrouping({
                    flow: flowWithData,
                    igroup: igroup,
                    icolumnGroup: icg,
                    newGrouping,
                  })
                }
                followingColumnGroups={calcFollowingColumnGroups({
                  flowWithData,
                  igroup,
                })}
                updateLine={updateLine}
              />
            </div>
          )}
        </div>
      )}
      {connections.map((c,ic) =>
        <Line key={ic} position={c} />
      )}
    </div>
  );
};

export default Tables;

