import { createWSClient } from '@trpc/client';

type WSClient = ReturnType<typeof createWSClient>;
let wsClient: WSClient | null = null;

export const getWSClient = () => {
  if (wsClient == null) {
    wsClient = createWSClient({
      url: `ws://${process.env.NEXT_PUBLIC_SERVER_IP}:3001`,
    });
  }
  return wsClient;
}

