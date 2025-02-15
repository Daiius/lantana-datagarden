import React from 'react';
import clsx from 'clsx';

import RealtimeTable from '@/components/table/RealtimeTable';

const SequenceTable: React.FC<
  React.ComponentProps<'div'>
  & { 
    projectId: string,
    categoryId: string,
  }
> = ({
  projectId,
  categoryId,
  className,
  ...props
}) => {
  return (
    <RealtimeTable
      projectId={projectId}
      categoryId={categoryId}
    />
  );
};

export default SequenceTable;

