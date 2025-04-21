'use client'

import { trpc } from '@/providers/TrpcProvider';

export const useColumnGroupMutations = () => {
  const { mutateAsync: update } = 
    trpc.condition.columnGroup.update.useMutation();
  const { mutateAsync: remove } =
    trpc.condition.columnGroup.remove.useMutation();
  const { mutateAsync: add } =
    trpc.condition.columnGroup.add.useMutation();

  return {
    update,
    add,
    remove,
  };
};

