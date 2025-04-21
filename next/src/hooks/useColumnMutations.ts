'use client'

import { trpc } from '@/providers/TrpcProvider';

export const useColumnMutations = () => {
  const { mutateAsync: update } = 
    trpc.condition.column.update.useMutation();
  const { mutateAsync: remove } =
    trpc.condition.column.remove.useMutation();
  const { mutateAsync: add } =
    trpc.condition.column.add.useMutation();

  return {
    add,
    update,
    remove,
  };

};

