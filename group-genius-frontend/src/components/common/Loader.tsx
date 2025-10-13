import { Loader2 } from 'lucide-react';

interface LoaderProps {
  label?: string;
}

export default function Loader({ label }: LoaderProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" />
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  );
}


