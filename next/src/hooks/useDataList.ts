'use client'

import { inferRouterInputs } from '@trpc/server';
import { trpc, AppRouter } from '@/providers/TrpcProvider';

import type { Data } from '@/types';

type DataListInputs = inferRouterInputs<AppRouter>['data']['list'];

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
  } = trpc.data.list.useQuery(
    { projectId, columnGroupId },
    initialDataList == null
    ? { enabled: true }
    : { enabled: false, initialData: initialDataList }
  );
  trpc.data.onAdd.useSubscription(
    { projectId, columnGroupId },
    {
      onData: data => utils.data.list.setData(
        { projectId, columnGroupId },
        dataList == null
        ? [data]
        : [...dataList, data]
      ),
     onError: err => console.error(err),
    } 
  );
  trpc.data.onRemove.useSubscription(
    { projectId, columnGroupId },
    {
      onData: data => utils.data.list.setData(
        { projectId, columnGroupId },
        dataList?.filter(x => x.id !== data.id) ?? []
      ),
      onError: err => console.error(err),
    }
  );
  const { mutateAsync: add } = trpc.data.add.useMutation();

  return {
    dataList,
    error,
    isLoading,
    add,
  }
};

