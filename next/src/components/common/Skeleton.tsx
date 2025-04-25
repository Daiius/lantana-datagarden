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
      'skeleton rounded-md h-full w-full',
      className,
    )}
  >
  </div>
);

export default Skeleton;

