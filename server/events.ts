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

type OnUpdateTableRelationsEventArgs = {
  relations: Relation[];
  projectId: string;
  id: number;
};

export type TableRelationEvents = {
  onUpdate: OnUpdateTableRelationsEventArgs;
}

export const tableEventEmitter = mitt<TableRelationEvents>();

export type OnUpdateTableFollowingColumnGroupsArgs = {
  projectId: string;
  id: number;
}

export type TableFollowingColumnGroupsEvents = {
  onUpdate: OnUpdateTableFollowingColumnGroupsArgs;
}

export const tableFollowingColumnGroupsEventEmitter = mitt<TableFollowingColumnGroupsEvents>();

