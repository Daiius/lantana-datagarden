//import clsx from 'clsx';

import type {
  FlowStep as FlowStepType,
  ColumnGroup,
} from '@/types';

import MergedTable from '@/components/table/MergedTable';
import ListedTable from '@/components/table/ListedTable';

export type FlowStepProps = {
  projectId: string;
  flowStep: FlowStepType;
  iflowStep: number;
  update: (newValue: FlowStepType) => Promise<void>;
  /** 
   * TODO データの渡し方再考、このままでは見通しが立たない
   * flowingTableの子データ追加時、
   * 自信より右側のColumnGroupだけ指定するためのprop
   */
  followingColumnGroups: ColumnGroup[];
  updateLine: () => Promise<void>;

  className?: string;
}

const FlowStep = (props: FlowStepProps) => {
  if (props.flowStep.mode === 'merge') return (
    <MergedTable {...props} />
  );

  return (
    <ListedTable {...props} />
  );
};

export default FlowStep;

