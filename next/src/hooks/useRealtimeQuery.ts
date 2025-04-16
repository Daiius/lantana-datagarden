import { inferRouterOutputs, inferRouterInputs } from '@trpc/server';

import type { AppRouter } from '@/providers/TrpcProvider';

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

export const useRealtimeQuery = <
  TPath extends keyof RouterOutputs,
  TQueryKey extends keyof RouterOutputs[TPath],
  TSubKey extends keyof RouterOutputs[TPath],
>({
    trpc,
    path,
    input,
    initialData,
  }: {
  trpc: any,
  path: {
    query: [TPath, TQueryKey];
    subscription: [TPath, TSubKey];
  },
  input: RouterInputs[TPath][TQueryKey & string],
  initialData: RouterOutputs[TPath][TQueryKey & string],
}) => {
  const { data } = trpc[path.query[0]][path.query[1]].useQuery();
};


