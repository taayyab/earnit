type SelectFieldProps = {
  label: string;
  options: { value: string; label: string }[];
  helper?: string;
  className?: string;
};

const SelectField = ({
  label,
  options,
  helper,
  className = "",
}: SelectFieldProps) => (
  <div className={className}>
    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {label}
    </label>
    <select className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200">
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {helper ? <p className="mt-2 text-[10px] text-slate-400">{helper}</p> : null}
  </div>
);

export default SelectField;
