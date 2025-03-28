
import clsx from 'clsx';

type DebugJsonProps = {
  data: any;
  className?: string;
}

const DebugJson = ({
  data,
  className,
}: DebugJsonProps) => (
  <div 
    className={clsx(
      'bg-sky-200 rounded-lg shadow text-xs',
      'p-4 m-2',
      className,
    )}
  >
    <pre>
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);

export default DebugJson;

