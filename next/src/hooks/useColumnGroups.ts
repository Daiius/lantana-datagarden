import { trpc } from '@/providers/TrpcProvider';

export const useColumnGroups = ({
  projectId
}: {
  projectId: string;
}) => {
  // column関連のトップレベルのデータ取得
  // まとめてネストしたcolumnGroups, columns を取得する
  const { data: columnGroups } = 
    trpc.columnGroup.listNested.useQuery({ projectId });
  const utils = trpc.useUtils();
  // 数の変更や削除時に全読み込みしなおす
  trpc.columnGroup.onUpdateList.useSubscription(
    { projectId }, {
      onData: data =>
        utils.columnGroup.listNested.setData({ projectId }, data),
      onError: err => console.error(err),
    }
  ); 
  const { mutateAsync: addColumnGroup } = trpc.columnGroup.add.useMutation();

  return {
    columnGroups,
    addColumnGroup,
  };
};

