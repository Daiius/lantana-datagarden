//import clsx from 'clsx';

import type {
  FlowStepWithData,
  FlowStep as FlowStepType,
  ColumnGroup,
} from '@/types';

import MergedTable from '@/components/table/MergedTable';
import ListedTable from '@/components/table/ListedTable';

export type FlowStepProps = {
  projectId: string;
  flowStep: FlowStepWithData;
  iflowStep: number;
  updateFlowStep: (newFlowStep: FlowStepType) => Promise<void>;
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

