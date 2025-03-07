'use client'

import React from 'react';
import { trpc } from '@/providers/TrpcProvider';

import type { Data, Flow } from '@/types';

export const useRealtimeDataList = ({
  flow
}: {
  flow?: Flow
}) => {
  const { projectId, id: flowId } = flow!;
  //const utils = trpc.useUtils();
  const { data, error, isLoading } = trpc.data.listByFlow.useQuery(
    { projectId, flowId },
    { enabled: !!flow },
  );
  //trpc.data.onUpdateList.useSubscription(
  //  { projectId, flowId },
  //  {
  //    onData: data => utils.data.get.setData(
  //      { id, projectId, columnGroupId },
  //      data
  //    ),
  //    onError: err => console.error(err),
  //  }
  //);
  //const { mutateAsync: updateData } = trpc.data.update.useMutation();
  //const { mutateAsync: deleteData } = trpc.data.remove.useMutation();

  return {
    data,
    isLoading,
    error,
  };
};

