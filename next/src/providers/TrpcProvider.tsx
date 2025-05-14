'use client'

import { ReactNode } from 'react';
import type { AppRouter } from 'server/router';
import { wsLink } from '@trpc/client';
import { getWSClient } from '@/lib/wsClient';
import { 
  QueryClient,
  QueryClientProvider 
} from '@tanstack/react-query';
import { log } from '@/debug';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();
let queryClient: QueryClient | null = null;
const getQueryClient = () => {
  if (queryClient == null) {
    queryClient = new QueryClient();
  }
  return queryClient;
};
type TRPCClient = ReturnType<typeof trpc.createClient>;
let trpcClient: TRPCClient | null = null;
const getTrpcClient = () => {
  if (trpcClient == null) {
    trpcClient = trpc.createClient({
      links: [
        wsLink({ client: getWSClient() }),
      ]
    });
  }
  return trpcClient;
}

export type TrpcProviderProps = {
  children: ReactNode;
}

const TrpcProvider = ({
  children,
}: TrpcProviderProps) => {

  log('TrpcProvider rendered');

  //const [queryClient] = React.useState(() => new QueryClient());
  //const [trpcClient] = React.useState(() =>
  //  trpc.createClient({
  //    links: [
  //      wsLink({ client: wsClient }),
  //    ],
  //  })
  //);

  return (
    <QueryClientProvider client={getQueryClient()}>
      <trpc.Provider client={getTrpcClient()} queryClient={getQueryClient()}>
        {children}
      </trpc.Provider>
    </QueryClientProvider>
  );
};
 
export default TrpcProvider;
export { AppRouter };

