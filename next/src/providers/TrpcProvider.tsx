'use client'

import React from 'react';
import type { AppRouter } from 'server/router';
import { wsLink } from '@trpc/client';
import { wsClient } from '@/lib/wsClient';
import { 
  QueryClient,
  QueryClientProvider 
} from '@tanstack/react-query';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();

const TrpcProvider: React.FC<
  React.PropsWithChildren
> = ({
  children,
}) => {

  console.log('TrpcProvider rendered');

  const [queryClient] = React.useState(() => new QueryClient());
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        wsLink({ client: wsClient }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </trpc.Provider>
    </QueryClientProvider>
  );
};
 
export default TrpcProvider;
export { AppRouter };

