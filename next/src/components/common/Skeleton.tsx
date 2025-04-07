import React from 'react';
import clsx from 'clsx';

type SkeletonProps = {
  className?: string;
}

const Skeleton = ({
  className,
}: SkeletonProps) => (
  <div
    className={clsx(
      'bg-slate-500/50 rounded-md',
      className,
    )}
  >
  </div>
);

export default Skeleton;

