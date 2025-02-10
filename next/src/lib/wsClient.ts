import { createWSClient } from '@trpc/client';

export const wsClient = createWSClient({
  url: `ws://${process.env.NEXT_PUBLIC_SERVER_IP}:3001`,
});

