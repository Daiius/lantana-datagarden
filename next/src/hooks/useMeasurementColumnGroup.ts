import type {
  MeasurementColumn,
  MeasurementColumnGroup,
} from '@/types';

import { trpc } from '@/providers/TrpcProvider';

export type UseMeasurementColumnGroupArgs<
  T extends MeasurementColumnGroup
> = {
  initialData: T;
};

/**
 * 上位コンポーネントからの初期データを受け取って、
 * リアルタイム更新されるMeasurementColumnGroupを取得します
 *
 * initialDataには、ネストされたMeasurementColumnGroupを拡張した
 * データを指定することも可能です
 * 動作時には拡張されたデータはそのまま出力されます
 */
export const useMeasurementColumnGroup = <
  T extends MeasurementColumnGroup
>({
  initialData
} : UseMeasurementColumnGroupArgs<T>) => {
  const { projectId, id } = initialData;
  const utils = trpc.useUtils();
  const { data: fetchedData } = 
    trpc.measurement.columnGroup.get.useQuery(
      { projectId, id },
      { initialData, enabled: false }
  );
  const { mutateAsync: update } = trpc.measurement.columnGroup.update.useMutation();
  trpc.measurement.columnGroup.onUpdate.useSubscription(
    { projectId, id },
    {
      onData: data => utils.measurement.columnGroup.get.setData(
        { projectId, id },
        data,
      ),
    }
  );

  const { mutateAsync: remove } = trpc.measurement.columnGroup.remove.useMutation();

  return {
    data: { ...initialData, ...fetchedData },
    update,
    remove,
  }
};

