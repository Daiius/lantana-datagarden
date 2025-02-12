import React from 'react';
import clsx from 'clsx';

import RealtimeProject from '@/components/project/RealtimeProject';

export default async function Page() {
  const zeroId = '00000000-0000-0000-0000-000000000000' as const;
  
  return (
    <div
      className={clsx(
        'm-2',
      )}
    >
      <RealtimeProject projectId={zeroId} />
    </div>
  );
}

