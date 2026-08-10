import React from 'react';
import { FlaskConical } from 'lucide-react';

export const DemoBanner: React.FC<{ note?: string }> = ({ note }) => (
  <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
    <FlaskConical className="w-4 h-4 shrink-0" />
    <span>
      Demo data — this section isn&apos;t connected to live infrastructure yet.
      {note ? ` ${note}` : ''}
    </span>
  </div>
);
