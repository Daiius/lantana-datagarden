'use client'

import React from 'react';
import type { AppRouter } from 'server/router';
import { 
  createWSClient,
  wsLink
} from '@trpc/client';
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
        wsLink({
          client: createWSClient({
            url: `ws://${process.env.NEXT_PUBLIC_SERVER_IP}:3001`,
          }),
        }),
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

