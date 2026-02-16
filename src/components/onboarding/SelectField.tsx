import type { ChangeEvent } from "react";

type SelectFieldProps = {
  label: string;
  options: string[];
  helper?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
};

const SelectField = ({ label, options, helper, value, onChange }: SelectFieldProps) => (
  <div>
    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="mt-2 w-full px-3 py-2 border border-[#e5e7eb] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    {helper ? <p className="text-xs text-[#65758b] mt-2">{helper}</p> : null}
  </div>
);

export default SelectField;
