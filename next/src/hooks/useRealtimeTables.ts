import React from 'react';

import { trpc } from '@/providers/TrpcProvider';

export const useRealtimeTables = ({
  flowId,
  projectId,
}: { 
  flowId: number;
  projectId: string;
}) => {

  const { data: flowWithData } = trpc.flow.getNestedWithData.useQuery(
    { id: flowId, projectId: projectId },
  );

  return {
    flowWithData
  }
};

