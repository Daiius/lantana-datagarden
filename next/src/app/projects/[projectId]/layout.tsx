
import { ReactNode } from 'react';

import { 
  ColumnGroupSubscriptionProvider 
} from '@/providers/ColumnGroupSubscriptionsProvider';
import {
  MeasurementColumnGroupSubscriptionProvider
} from '@/providers/MeasurementColumnGroupSubscriptionProvider';

export default async function ProjectLayout(
  { 
    params,
    children,
  }
  : { 
    params: Promise<{ projectId: string }>;
    children: ReactNode;
  }
) {
  const { projectId } = await params;
  return (
    <>
      <ColumnGroupSubscriptionProvider projectId={projectId} />
      <MeasurementColumnGroupSubscriptionProvider projectId={projectId} />
      {children}
    </>
  );
}

