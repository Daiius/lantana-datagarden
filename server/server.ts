import { WebSocketServer } from 'ws';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { appRouter } from './router';
import { createContext } from './context';

const wss = new WebSocketServer({
  port: 3001,
});

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext,
  //keepAlive: {
  //  enabled: true,
  //  pingMs: 300000,
  //  pongWaitMs: 5000,
  //},
});

wss.on('connection', ws => {
  console.log(`++connection: ${wss.clients.size}`);
  ws.once('close', () => {
    console.log(`--connection: ${wss.clients.size}`);
  });
});
console.log('WebSocket server listening on ws://localhost:3001');

process.on('SIGTERM', () => {
  console.log('SIGTERM');
  handler.broadcastReconnectNotification();
  wss.close();
});

