import { Emitter } from 'mitt';
import { observable } from '@trpc/server/observable';

/**
 * mitt + tRPC subscription による定型イベント生成を行います
 *
 * TODO
 * filter が同じならば既存のobserver を使いまわせるのでは？
 */
export const createSubscription = <
  TEvents extends Record<string, unknown>,
  TEventName extends keyof TEvents,
>({
  filter,
  eventEmitter,
  eventName,
}: {
  eventName: TEventName;
  eventEmitter: Emitter<TEvents>;
  filter: (input: TEvents[TEventName]) => boolean;
}) =>
  observable<TEvents[typeof eventName]>(emit => {
    const handler = (data: TEvents[typeof eventName]) => {
      if (filter(data)) {
        emit.next(data);
      }
    };
    eventEmitter.on(eventName, handler);
    return () => eventEmitter.off(eventName, handler);
  });

