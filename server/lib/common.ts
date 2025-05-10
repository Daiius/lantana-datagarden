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

/**
 * イベントハンドラの中身を指定できるようにした定型イベント生成関数
 */
export const createEventHandler = <
  TEvents extends Record<string, unknown>,
  TEventName extends keyof TEvents,
>({
  ee,
  eventName,
  handler,
  filter,
}: {
  ee: Emitter<TEvents>,
  eventName: TEventName,
  /** イベント発行時に追加で行う処理を記述します */
  handler?: (data: TEvents[TEventName]) => void | Promise<void>, 
  filter: (data: TEvents[TEventName]) => boolean,
}) => observable<TEvents[TEventName]>(emit => {
    const handlerPrivate = (data: TEvents[TEventName]) => {
      if(filter(data)) {
        emit.next(data);
        handler?.(data);
      }
    };
    ee.on(eventName, handlerPrivate);
    return () => ee.off(eventName, handlerPrivate);
  });

