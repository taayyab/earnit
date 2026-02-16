import type { LucideIcon } from "lucide-react";
import type { ChangeEvent } from "react";

const inputBase =
  "flex min-h-11 w-full rounded-md border border-[#e5e7eb] bg-transparent px-3 py-2 text-base shadow-sm transition-all placeholder:text-[#21252b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A574] focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation md:text-sm";

type TextFieldProps = {
  label: string;
  placeholder?: string;
  helper?: string;
  type?: string;
  icon?: LucideIcon;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  min?: string;
};

const TextField = ({
  label,
  placeholder,
  helper,
  type = "text",
  icon,
  value,
  onChange,
  min,
}: TextFieldProps) => {
  const Icon = icon;
  return (
    <div>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        className={`${inputBase} mt-2 ring-[#D4A574]/80`}
      />
      {helper ? <p className="text-xs text-[#65758b] mt-1">{helper}</p> : null}
    </div>
  );
};

export default TextField;
