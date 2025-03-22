import React from 'react';

import { trpc } from '@/providers/TrpcProvider';

export const useTables = ({
  flowId,
  projectId,
}: { 
  flowId: number;
  projectId: string;
}) => {

  const utils = trpc.useUtils();
  const { data: flowWithData } = trpc.flow.getNestedWithData.useQuery(
    { id: flowId, projectId: projectId },
  );
  const invalidate = async () => {
    await utils.flow.getNestedWithData.invalidate({
      projectId, id: flowId,
    });
  };

  return {
    flowWithData,
    invalidate,
  }
};

