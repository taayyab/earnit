import { Upload } from "lucide-react";

type UploadFieldProps = {
  label: string;
  buttonLabel: string;
  helper?: string;
};

const UploadField = ({ label, buttonLabel, helper }: UploadFieldProps) => (
  <div>
    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {label}
    </label>
    <label className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
      <Upload className="h-4 w-4" />
      {buttonLabel}
      <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" />
    </label>
    {helper ? <p className="mt-2 text-[10px] text-slate-400">{helper}</p> : null}
  </div>
);

export default UploadField;
