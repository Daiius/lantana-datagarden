/*
 * tRPC Subscription と組み合わせて動作するイベントハンドラを
 * まとめて定義します
 * 
 * 最初は個別に、tRPCプロシージャ毎に定義していましたが、
 * 他のルートからイベントを発火したい例があり、処理が複雑になりそうなので
 * 分離してみます
 *
 */

import mitt from 'mitt';

import type {
  Relation,
} from './lib/table/relations';

type OnUpdateEventArgs = {
  relations: Relation[];
  projectId: string;
  id: number;
};

export type TableRelationEvents = {
  onUpdate: OnUpdateEventArgs;
}

export const tableEventEmitter = mitt<TableRelationEvents>();

