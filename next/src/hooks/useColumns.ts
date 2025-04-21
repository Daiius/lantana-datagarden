'use client'

import { Column, ColumnGroup } from '@/types';
import { trpc } from '@/providers/TrpcProvider';

export const useColumns = ({
  initialColumns,
  projectId,
  columnGroupId,
}: {
  initialColumns?: Column[];
  projectId: string;
  columnGroupId: ColumnGroup['id'];
}) => {
  const utils = trpc.useUtils();
  const { data } = trpc.condition.column.list.useQuery(
    { projectId, columnGroupId },
    initialColumns
    ? { enabled: false, initialData: initialColumns }
    : { enabled: true }
  );
  trpc.condition.column.onAdd.useSubscription(
    { projectId, columnGroupId },
    {
      onData: newData => utils.condition.column.list.setData(
        { projectId, columnGroupId },
        data == null
        ? [newData]
        : [...data, newData],
      ),
    }
  );
  trpc.condition.column.onRemove.useSubscription(
    { projectId, columnGroupId },
    {
      onData: newData => utils.condition.column.list.setData(
        { projectId, columnGroupId },
        data == null
        ? []
        : data.filter(d => d.id !== newData.id)
      )
    }
  );
  const { mutateAsync: addColumn } = trpc.condition.column.add.useMutation();

  return {
    columns: data,
    addColumn,
  };
};

