'use client'

import React from 'react';
import clsx from 'clsx';

import type { Flow } from '@/types';

import { useTables } from '@/hooks/useTables';
import { useLines, Connection } from '@/hooks/useLines';

import Table from '@/components/table/Table';
import TableGroupSelector from '@/components/table/TableGroupSelector';

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

  const { flowWithData, invalidate } = useTables({
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
              {/* TODO : グループ分けの選択 */}
              <TableGroupSelector 
                columnNames={cg.columns.map(c => c.name)}
                selected={[]}
                setSelected={newSelected => console.log(newSelected)}
              />
              {/* tableの表示、ここをグループ分けしたい */}
              <Table 
                projectId={cg.projectId}
                columnGroupId={cg.id}
                followingColumnGroups={
                  Array.from(
                    new Map(
                      flowWithData
                        .columnGroups
                        .filter((_, ig) => ig > igroup)
                        .flatMap(group => group.map(g => g))
                        .map(g => [g.id, g])
                    )
                    .entries()
                    .map(([_,v]) => v)
                  )
                }
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

