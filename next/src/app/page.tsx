import React from 'react';

import RealtimeProject from '@/components/project/RealtimeProject';

export default async function Page() {
  const zeroId = '00000000-0000-0000-0000-000000000000' as const;
  
  return (
    <RealtimeProject projectId={zeroId} />
  );
}

