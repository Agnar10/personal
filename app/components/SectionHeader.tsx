import type { ReactNode } from 'react';

export default function SectionHeader({
  title,
  action
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-text">{title}</h2>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
