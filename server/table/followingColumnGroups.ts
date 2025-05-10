/*
 * FollowingColumnGroupsは、あるFlowStepについて、
 * それより後ろのFlowStepsに含まれるcolumnGroupの一覧のことを指します。
 *
 * データを追加する際には親となるデータのDropdownから操作しますが、
 * 追加先のflowStepやcolumnGroupは選択肢が有るため、自分より後のflowStepsに含まれる
 * columnGroupのみを指定できるようにします
 *
 * これはDBのテーブル等に対応する概念ではなく、
 *
 */

import { router, publicProcedure } from '../trpc';

import {
  list,
  flowIdsSchema,
} from '../lib/table/followingColumnGroups';

import { createEventHandler } from '../lib/common';

import {
  tableFollowingColumnGroupsEventEmitter as ee,
  OnUpdateTableFollowingColumnGroupsArgs,
} from '../events';

const filter = (
  data: OnUpdateTableFollowingColumnGroupsArgs,
  input: OnUpdateTableFollowingColumnGroupsArgs,
) => (
     data.projectId === input.projectId
  && data.id === input.id
);

export const followingColumnGroupsRouter = router({
  list: publicProcedure
    .input(flowIdsSchema)
    .query(async ({ input }) => await list(input)),
  onUpdate: publicProcedure
    .input(flowIdsSchema)
    .subscription(({ input }) => createEventHandler({
      ee,
      eventName: 'onUpdate',
      filter: data => filter(data, input)
    })),
});

