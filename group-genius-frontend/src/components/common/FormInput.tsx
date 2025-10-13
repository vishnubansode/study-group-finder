import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type InputType = 'text' | 'textarea';

interface FormInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: InputType;
  required?: boolean;
}

export default function FormInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = 'text',
  required,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      {type === 'textarea' ? (
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}


