'use client' // custom hook

import { trpc } from '@/providers/TrpcProvider';

export const useMeasurementColumnGroupMutations = () => {
  const { mutateAsync: update } = 
    trpc.condition.columnGroupMeasurement.update.useMutation();
  const { mutateAsync: add } =
    trpc.condition.columnGroupMeasurement.add.useMutation();
  const { mutateAsync: remove } =
    trpc.condition.columnGroupMeasurement.remove.useMutation();

  return {
    add,
    remove,
    update,
  };
};

