import type { ChangeEvent } from "react";

type TextFieldProps = {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  helper?: string;
  className?: string;
};

const TextField = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  helper,
  className = "",
}: TextFieldProps) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-slate-700">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
    />
    {helper ? <p className="mt-1 text-[10px] text-slate-400">{helper}</p> : null}
  </div>
);

export default TextField;
