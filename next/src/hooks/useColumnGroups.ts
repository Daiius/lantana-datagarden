import { trpc } from '@/providers/TrpcProvider';

export const useColumnGroups = ({
  projectId
}: {
  projectId: string;
}) => {
  // column関連のトップレベルのデータ取得
  // まとめてネストしたcolumnGroups, columns を取得する
  const { data } = 
    trpc.condition.columnGroup.listNested.useQuery({ projectId });
  
  const utils = trpc.useUtils();
  // 数の変更や削除時に全読み込みしなおす
  trpc.condition.columnGroup.onUpdateList.useSubscription(
    { projectId }, {
      onData: newData =>
        utils.condition.columnGroup.listNested.setData({ projectId }, newData),
      onError: err => console.error(err),
    }
  ); 

  return {
    data,
  };
};

