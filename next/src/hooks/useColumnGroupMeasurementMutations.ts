'use client' // for hooks

import { trpc } from '@/providers/TrpcProvider';

export const useColumnGroupMeasurementMutations = () => {
  const { mutateAsync: update } = 
    trpc.condition.columnGroupMeasurement.update.useMutation();
  const { mutateAsync: remove } =
    trpc.condition.columnGroupMeasurement.remove.useMutation();
  const { mutateAsync: add } =
    trpc.condition.columnGroupMeasurement.add.useMutation();

  return {
    update,
    add,
    remove,
  };
};

