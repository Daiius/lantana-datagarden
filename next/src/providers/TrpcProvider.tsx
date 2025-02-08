'use client'

import React from 'react';
import type { AppRouter } from 'server/router';
import { 
  createTRPCProxyClient,
  createWSClient,
  wsLink
} from '@trpc/client';


const TrpcProviderContext = React.createContext<
  ReturnType<typeof createTRPCProxyClient<AppRouter>>
  | undefined
>(undefined);



const TrpcProvider: React.FC<
  React.PropsWithChildren
> = ({
  children,
}) => {
  // NOTE : 再生成は防ぐべきらしい
  const wsClient = createWSClient({
    url: 'ws://localhost:3001',
  });
  const trpc = createTRPCProxyClient<AppRouter>({
    links: [
      wsLink({
        client: wsClient
      }),
    ],
  });

  return (
    <TrpcProviderContext.Provider value={trpc}>
      {children}
    </TrpcProviderContext.Provider>
  );
};

export const useTrpcClient = () => {
  const client = React.useContext(TrpcProviderContext);
  if (!client) {
    throw new Error("useTrpcClient must be called within a TrpcProvider");
  }
  return client;
};

 
export default TrpcProvider;

