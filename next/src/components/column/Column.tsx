import type { Column } from '@/types';

import RealtimeColumn from '@/components/column/RealtimeColumn';

const Column: React.FC<
  React.ComponentProps<'div'>
  & { column: Column }
> = async ({
  column,
  className,
  ...props
}) => {

  return (
    <div 
      className='text-lg w-full'
      {...props}
    >
      <RealtimeColumn initialColumn={column} />
    </div>
  );
};

export default Column;

