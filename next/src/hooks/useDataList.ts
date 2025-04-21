'use client'

import { inferRouterInputs } from '@trpc/server';
import { trpc, AppRouter } from '@/providers/TrpcProvider';

import type { Data } from '@/types';

type DataListInputs = inferRouterInputs<AppRouter>['condition']['data']['list'];

type UseDataListArgs = DataListInputs
  & { initialDataList?: Data[]; };

export const useDataList = ({
  projectId,
  columnGroupId,
  initialDataList,
}: UseDataListArgs) => {
  const utils = trpc.useUtils();
  const { 
    data: dataList, 
    error,
    isLoading 
  } = trpc.condition.data.list.useQuery(
    { projectId, columnGroupId },
    initialDataList == null
    ? { enabled: true }
    : { enabled: false, initialData: initialDataList }
  );
  trpc.condition.data.onAdd.useSubscription(
    { projectId, columnGroupId },
    {
      onData: data => utils.condition.data.list.setData(
        { projectId, columnGroupId },
        dataList == null
        ? [data]
        : [...dataList, data]
      ),
     onError: err => console.error(err),
    } 
  );
  trpc.condition.data.onRemove.useSubscription(
    { projectId, columnGroupId },
    {
      onData: data => utils.condition.data.list.setData(
        { projectId, columnGroupId },
        dataList?.filter(x => x.id !== data.id) ?? []
      ),
      onError: err => console.error(err),
    }
  );
  const { mutateAsync: add } = trpc.condition.data.add.useMutation();

  return {
    dataList,
    error,
    isLoading,
    add,
  }
};

