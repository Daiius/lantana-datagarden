'use client'

import React from 'react';
import clsx from 'clsx';

import type { 
  Flow,
} from '@/types';

import { useLines, Connection } from '@/hooks/useLines';

import { FlowSteps } from '@/components/table/FlowSteps';

import Line from '@/components/line/Line';
import Skeleton from '@/components/common/Skeleton';

export const calcFollowingColumnGroups = ({
  flowWithData,
  iflowStep,
}: {
  flowWithData: FlowWithData,
  iflowStep: number
}) => Array.from(
  new Map(
    flowWithData
      ?.flowSteps
      .filter((_, iflowStep_) => iflowStep_ > iflowStep)
      .flatMap(flowStep => 
        flowStep.columnGroups
      )
      .map(cgs => [cgs.id, cgs])
  )
  .entries()
  .map(([_,v]) => v)
);

type TablesProps = {
  projectId: string;
  flowId: Flow['id'];
  className?: string;
}

/**
 * 指定されたフローによる表を表示します
 *
 * TableはDBと対応する要素はなく、
 * Flow, FlowStep, FlowStepColumnGroup, ColumnGroup, Column, Data など
 * 様々なデータを逐次取得して構成します
 */
export const Tables = ({
  projectId,
  flowId,
  className,
}: TablesProps) => {

  const [mounted, setMounted] = React.useState<boolean>(false);
  const [connections, setConnections] = React.useState<Connection[]>([]);
  const [updateLineCount, setUpdateLineCount] = React.useState<number>(0);


  // TODO データの追加・削除の度に
  // データの取得し直しをしているので効率が悪い
  const updateLine = async () => {
    setUpdateLineCount(prev => prev + 1);
    await invalidate();
  }

  // TODO 逐次データ取得だと、flowに関連する全データ列挙が難しい
  const allData = [];

  // TODO line再描画処理の実装が難しい
  React.useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }
    setTimeout(() => {
      const { connections } = useLines({ data: allData, });
      setConnections(connections);
    }, 1_000);
  }, [flowWithData, mounted, updateLineCount]);

  return (
    <div
      id='tables-container'
      className={clsx(
        'flex flex-row gap-8',
        'relative',
        className,
      )}
    >
      <FlowSteps
        projectId={projectId}
        flowId={flowId}
      />
      {connections.map((c,ic) =>
        <Line key={ic} position={c} />
      )}
    </div>
  );
};

export default Tables;

