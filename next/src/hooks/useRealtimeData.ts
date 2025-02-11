'use client'

import React from 'react';
import { useDebouncedCallback } from 'use-debounce';

type PartialWithout<T, K extends keyof T> =
  Pick<T, K> & Partial<Omit<T, keyof K>>;

type NotFunction<T> =
  T extends (...args: any) => any ? never : T;

type UseRealtimeDataOptions<
  Data, 
  DataId extends keyof Data,
  MutationInput = PartialWithout<Data, DataId>
> = {
 initialData: NotFunction<Data>,
 ids: Pick<Data, DataId>,
 useQuery: 
   (id: Pick<Data,DataId>, opts: { initialData: Data }) => 
     { data: Data | undefined },
 useMutation: () => { mutateAsync: (arg: MutationInput) => void },
 //useSubscription: (
 //  input: DataId,
 //  opts: { 
 //    onData: (data: Data) => void; 
 //    onError?: (err: any) => void; 
 //  },
 //) => void,
};

export function useRealtimeData<
  Data,
  DataId extends keyof Data,
  MutationInput = PartialWithout<Data, DataId>
>({
  initialData,
  ids,
  useQuery,
  useMutation,
  //useSubscription,
}: UseRealtimeDataOptions<
  Data,
  DataId,
  MutationInput
>) {
  const { data } = useQuery(ids, { initialData });
  const mutation = useMutation();
  const [value, setValue] = React.useState<Data>(initialData);
  //useSubscription(id, {
  //  onData: newData => setValue(newData),
  //  onError: err => console.error('Subscription error:', err),
  //});
}

